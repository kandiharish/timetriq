import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { timeService } from '../services/timeService';

export interface TaskTimer {
  startTime: number | null; // null if paused
  elapsedSeconds: number; // accumulated seconds when paused/running
  taskTitle: string;
}

export interface FocusSession {
  taskId: string;
  taskTitle: string;
  timeLeft: number; // in seconds
  duration: number; // in seconds
  isRunning: boolean;
}

interface TimerContextType {
  timers: Record<string, TaskTimer>;
  startTimer: (taskId: string, taskTitle: string) => void;
  pauseTimer: (taskId: string) => void;
  stopTimer: (taskId: string) => Promise<void>;
  cancelTimer: (taskId: string) => void;
  getLiveElapsedSeconds: (taskId: string) => number;
  focusSession: FocusSession | null;
  startFocus: (taskId: string, taskTitle: string, durationMinutes: number) => void;
  pauseFocus: () => void;
  stopFocus: () => void;
  resetFocus: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timers, setTimers] = useState<Record<string, TaskTimer>>(() => {
    const saved = localStorage.getItem('timetriq_active_timers');
    return saved ? JSON.parse(saved) : {};
  });

  // Persist timers to local storage
  useEffect(() => {
    localStorage.setItem('timetriq_active_timers', JSON.stringify(timers));
  }, [timers]);

  // Tick active timers every second to force re-renders for ticking displays
  const [, setTick] = useState(0);
  useEffect(() => {
    const hasRunningTimers = Object.values(timers).some(t => t.startTime !== null);
    if (!hasRunningTimers) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timers]);

  const startTimer = (taskId: string, taskTitle: string) => {
    setTimers(prev => {
      const existing = prev[taskId];
      if (existing) {
        return {
          ...prev,
          [taskId]: {
            ...existing,
            startTime: Date.now()
          }
        };
      }
      return {
        ...prev,
        [taskId]: {
          startTime: Date.now(),
          elapsedSeconds: 0,
          taskTitle
        }
      };
    });
  };

  const pauseTimer = (taskId: string) => {
    setTimers(prev => {
      const existing = prev[taskId];
      if (!existing || existing.startTime === null) return prev;
      const sessionSeconds = Math.floor((Date.now() - existing.startTime) / 1000);
      return {
        ...prev,
        [taskId]: {
          startTime: null,
          elapsedSeconds: existing.elapsedSeconds + sessionSeconds
        }
      };
    });
  };

  const getLiveElapsedSeconds = (taskId: string): number => {
    const timer = timers[taskId];
    if (!timer) return 0;
    if (timer.startTime === null) return timer.elapsedSeconds;
    return timer.elapsedSeconds + Math.floor((Date.now() - timer.startTime) / 1000);
  };

  const stopTimer = async (taskId: string) => {
    const timer = timers[taskId];
    if (!timer) return;

    let totalSeconds = timer.elapsedSeconds;
    if (timer.startTime !== null) {
      totalSeconds += Math.floor((Date.now() - timer.startTime) / 1000);
    }

    if (totalSeconds > 0) {
      const hoursWorked = Math.max(0.01, Math.round((totalSeconds / 3600) * 100) / 100);
      
      try {
        await timeService.createTimeEntry({
          task_id: taskId,
          date: new Date().toISOString().split('T')[0],
          hours_worked: hoursWorked,
          notes: 'Time logged via task timer'
        });
      } catch (e) {
        console.error("Failed to save time entry", e);
      }
    }

    // Remove timer
    setTimers(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  const cancelTimer = (taskId: string) => {
    setTimers(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  // Focus Pomodoro Sprint State
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null);

  // Focus session ticking effect
  useEffect(() => {
    if (!focusSession || !focusSession.isRunning) return;

    const interval = setInterval(() => {
      setFocusSession(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          clearInterval(interval);
          
          // Play synthetic audio chime using Web Audio API
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const audioCtx = new AudioCtx();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch beep
              gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
              osc.start();
              osc.stop(audioCtx.currentTime + 1.2); // play for 1.2s
            }
          } catch (err) {
            console.warn("AudioContext chime failed: ", err);
          }

          return {
            ...prev,
            timeLeft: 0,
            isRunning: false
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [focusSession?.isRunning]);

  const startFocus = (taskId: string, taskTitle: string, durationMinutes: number) => {
    setFocusSession({
      taskId,
      taskTitle,
      timeLeft: durationMinutes * 60,
      duration: durationMinutes * 60,
      isRunning: true
    });
  };

  const pauseFocus = () => {
    setFocusSession(prev => prev ? { ...prev, isRunning: false } : null);
  };

  const stopFocus = () => {
    setFocusSession(null);
  };

  const resetFocus = () => {
    setFocusSession(prev => prev ? { ...prev, timeLeft: prev.duration, isRunning: true } : null);
  };

  return (
    <TimerContext.Provider value={{ 
      timers, 
      startTimer, 
      pauseTimer, 
      stopTimer, 
      cancelTimer, 
      getLiveElapsedSeconds,
      focusSession,
      startFocus,
      pauseFocus,
      stopFocus,
      resetFocus
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
