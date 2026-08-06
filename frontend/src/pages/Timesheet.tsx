import React, { useEffect, useState, useMemo } from 'react';
import { timeService } from '../services/timeService';
import type { TimeEntry } from '../services/timeService';
import { taskService } from '../services/taskService';
import type { Task } from '../services/taskService';
import { useAuth } from '../components/AuthContext';
import { Calendar, Clock, ChevronLeft, ChevronRight, FileText, TrendingUp, Target } from 'lucide-react';

type TimesheetView = 'daily' | 'weekly' | 'monthly';

export const Timesheet: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<TimesheetView>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { hasRole } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [entriesData, tasksData] = await Promise.all([
          timeService.getAllTimeEntries(),
          taskService.getTasks()
        ]);
        setEntries(entriesData);
        const map: Record<string, Task> = {};
        tasksData.forEach(t => { map[t.id] = t; });
        setTasks(map);
      } catch (err) {
        console.error('Failed to load timesheet data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Navigation helpers
  const navigateDate = (direction: number) => {
    const d = new Date(currentDate);
    if (view === 'daily') d.setDate(d.getDate() + direction);
    else if (view === 'weekly') d.setDate(d.getDate() + (direction * 7));
    else d.setMonth(d.getMonth() + direction);
    setCurrentDate(d);
  };

  // Filtering entries by view range
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const entryDate = new Date(e.date);
      if (view === 'daily') {
        return entryDate.toDateString() === currentDate.toDateString();
      } else if (view === 'weekly') {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return entryDate >= weekStart && entryDate <= weekEnd;
      } else {
        return entryDate.getMonth() === currentDate.getMonth() && entryDate.getFullYear() === currentDate.getFullYear();
      }
    });
  }, [entries, currentDate, view]);

  const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours_worked, 0);
  const uniqueTasks = new Set(filteredEntries.map(e => e.task_id)).size;
  const avgPerDay = view === 'weekly' ? totalHours / 7 : view === 'monthly' ? totalHours / 30 : totalHours;

  // Date label
  const getDateLabel = () => {
    if (view === 'daily') return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (view === 'weekly') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Group entries by date for the table
  const groupedByDate = useMemo(() => {
    const groups: Record<string, TimeEntry[]> = {};
    filteredEntries.forEach(e => {
      const key = new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [filteredEntries]);

  // Weekly grid data (for the visual weekly grid)
  const weeklyGrid = useMemo(() => {
    if (view !== 'weekly') return [];
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dayEntries = entries.filter(e => new Date(e.date).toDateString() === d.toDateString());
      const dayTotal = dayEntries.reduce((sum, e) => sum + e.hours_worked, 0);
      days.push({ date: d, entries: dayEntries, total: dayTotal });
    }
    return days;
  }, [entries, currentDate, view]);

  const tabStyle = (active: boolean) => ({
    padding: '8px 16px', fontSize: '0.8125rem', fontWeight: active ? 600 : 400,
    color: active ? '#4F46E5' : '#6B7280', cursor: 'pointer', border: 'none',
    backgroundColor: active ? '#EEF2FF' : 'transparent', borderRadius: '6px',
    transition: 'all 0.15s'
  });

  if (loading) {
    return (
      <div style={{ padding: 'var(--spacing-8)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading timesheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-8)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <FileText size={24} /> Timesheets
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            {hasRole(['Admin']) ? 'Organization-wide timesheet overview' : hasRole(['Manager']) ? 'Your team\'s timesheet' : 'Your personal timesheet'}
          </p>
        </div>
        {/* View Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
          <button style={tabStyle(view === 'daily')} onClick={() => setView('daily')}>Daily</button>
          <button style={tabStyle(view === 'weekly')} onClick={() => setView('weekly')}>Weekly</button>
          <button style={tabStyle(view === 'monthly')} onClick={() => setView('monthly')}>Monthly</button>
        </div>
      </div>

      {/* Date Navigator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px 16px', backgroundColor: 'white', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
        <button onClick={() => navigateDate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          <ChevronLeft size={20} color="#374151" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#4F46E5" />
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}>{getDateLabel()}</span>
        </div>
        <button onClick={() => navigateDate(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          <ChevronRight size={20} color="#374151" />
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#EEF2FF', padding: '8px', borderRadius: '8px', color: '#4F46E5' }}><Clock size={18} /></div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Total Hours</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{totalHours.toFixed(1)}h</div>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#ECFDF5', padding: '8px', borderRadius: '8px', color: '#059669' }}><Target size={18} /></div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Tasks Worked On</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{uniqueTasks}</div>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#FFFBEB', padding: '8px', borderRadius: '8px', color: '#D97706' }}><TrendingUp size={18} /></div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Avg Per Day</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{avgPerDay.toFixed(1)}h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Visual Grid */}
      {view === 'weekly' && weeklyGrid.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '24px' }}>
          {weeklyGrid.map((day, i) => {
            const isToday = day.date.toDateString() === new Date().toDateString();
            const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
            const barHeight = Math.min(day.total * 12, 96);
            return (
              <div key={i} style={{
                backgroundColor: 'white', borderRadius: '10px', border: `1px solid ${isToday ? '#4F46E5' : 'var(--color-border)'}`,
                padding: '12px', textAlign: 'center', opacity: isWeekend ? 0.6 : 1
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: isToday ? '#4F46E5' : '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                  {day.date.getDate()}
                </div>
                <div style={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <div style={{
                    width: '24px', height: `${barHeight}px`, backgroundColor: day.total > 0 ? (isToday ? '#4F46E5' : '#A5B4FC') : '#F3F4F6',
                    borderRadius: '4px', transition: 'height 0.3s', minHeight: '4px'
                  }} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: day.total > 0 ? '#111827' : '#D1D5DB', marginTop: '8px' }}>
                  {day.total.toFixed(1)}h
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timesheet Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', margin: 0 }}>Time Entries</h3>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '4px 0 0' }}>{filteredEntries.length} entries found</p>
        </div>

        {filteredEntries.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9CA3AF' }}>
            <Clock size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 500 }}>No time entries for this period</p>
            <p style={{ fontSize: '0.8125rem' }}>Start logging time to see your timesheet data here.</p>
          </div>
        ) : (
          <div>
            {Object.entries(groupedByDate).map(([dateKey, dayEntries]) => (
              <div key={dateKey}>
                <div style={{ padding: '10px 20px', backgroundColor: '#F9FAFB', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{dateKey}</span>
                  <span>{dayEntries.reduce((s, e) => s + e.hours_worked, 0).toFixed(1)}h</span>
                </div>
                {dayEntries.map(entry => {
                  const task = tasks[entry.task_id];
                  return (
                    <div key={entry.id} style={{ padding: '12px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{ width: '4px', height: '32px', borderRadius: '2px', backgroundColor: '#4F46E5' }} />
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>{task?.title || 'Unknown Task'}</div>
                          {entry.notes && <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '2px' }}>{entry.notes}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {entry.start_time || '--:--'} → {entry.end_time || '--:--'}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4F46E5', minWidth: '50px', textAlign: 'right' }}>
                          {entry.hours_worked.toFixed(1)}h
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
