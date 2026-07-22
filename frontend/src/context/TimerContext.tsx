import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { timeService } from '../services/timeService';

interface TimerContextType {
  activeTaskId: string | null;
  elapsedSeconds: number;
  startTimer: (taskId: string) => void;
  stopTimer: () => Promise<void>;
  cancelTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTaskId && startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTaskId, startTime]);

  const startTimer = (taskId: string) => {
    setActiveTaskId(taskId);
    setStartTime(Date.now());
    setElapsedSeconds(0);
  };

  const stopTimer = async () => {
    if (activeTaskId && elapsedSeconds > 0) {
      // Calculate hours worked, rounded to 2 decimal places
      const hoursWorked = Math.max(0.01, Math.round((elapsedSeconds / 3600) * 100) / 100);
      
      // Save to backend if there's any time logged
      try {
        await timeService.createTimeEntry({
          task_id: activeTaskId,
          date: new Date().toISOString().split('T')[0],
          hours_worked: hoursWorked,
          notes: 'Time logged via quick timer'
        });
      } catch (e) {
        console.error("Failed to save time entry", e);
      }
    }
    
    // Reset timer state
    setActiveTaskId(null);
    setStartTime(null);
    setElapsedSeconds(0);
  };

  const cancelTimer = () => {
    setActiveTaskId(null);
    setStartTime(null);
    setElapsedSeconds(0);
  };

  return (
    <TimerContext.Provider value={{ activeTaskId, elapsedSeconds, startTimer, stopTimer, cancelTimer }}>
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
