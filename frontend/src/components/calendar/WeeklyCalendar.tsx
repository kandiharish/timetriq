import React, { useMemo } from 'react';
import type { Task } from '../../services/taskService';

interface WeeklyCalendarProps {
  currentDate: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ currentDate, tasks, onTaskClick }) => {
  const days = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return { bg: '#F3F4F6', border: '#D1D5DB', text: '#374151' };
      case 'In Progress': return { bg: '#DBEAFE', border: '#93C5FD', text: '#1E40AF' };
      case 'Review': return { bg: '#FEF3C7', border: '#FCD34D', text: '#B45309' };
      case 'Completed': return { bg: '#D1FAE5', border: '#6EE7B7', text: '#065F46' };
      case 'Blocked': return { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B' };
      default: return { bg: '#F3F4F6', border: '#D1D5DB', text: '#374151' };
    }
  };

  const renderTask = (task: Task) => {
    const color = getStatusColor(task.status);
    return (
      <div 
        key={task.id}
        onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
        style={{
          padding: '4px 6px',
          marginBottom: '4px',
          backgroundColor: color.bg,
          borderLeft: `3px solid ${color.border}`,
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: 500,
          color: color.text,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        title={`${task.title} (${task.status})`}
      >
        {task.title}
      </div>
    );
  };

  const todayStr = new Date().toDateString();

  return (
    <div style={{ backgroundColor: '#F3F4F6', borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
          const date = days[i];
          const isToday = date.toDateString() === todayStr;
          return (
            <div key={day} style={{ padding: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                {day}
              </div>
              <div style={{
                width: '24px', height: '24px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                borderRadius: '50%', 
                fontSize: '0.875rem', fontWeight: isToday ? 600 : 500,
                backgroundColor: isToday ? '#4F46E5' : 'transparent',
                color: isToday ? 'white' : '#111827'
              }}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, gap: '1px', backgroundColor: '#F3F4F6' }}>
        {days.map((date, i) => {
          const dayTasks = tasks.filter(t => {
            if (!t.dueDate) return false;
            const tDate = new Date(t.dueDate);
            return tDate.getFullYear() === date.getFullYear() && 
                   tDate.getMonth() === date.getMonth() && 
                   tDate.getDate() === date.getDate();
          });

          return (
            <div key={i} style={{ padding: '8px', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {dayTasks.map(renderTask)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
