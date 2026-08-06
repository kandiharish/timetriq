import React from 'react';
import type { Task } from '../services/taskService';

interface MonthCalendarProps {
  currentDate: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({ currentDate, tasks, onTaskClick }) => {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

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

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ padding: '12px', textAlign: 'center', fontSize: '0.8125rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, gridAutoRows: 'minmax(120px, 1fr)' }}>
        {blanks.map(blank => (
          <div key={`blank-${blank}`} style={{ borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }} />
        ))}
        {days.map(day => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = new Date().toDateString() === date.toDateString();
          
          const dayTasks = tasks.filter(t => {
            if (!t.dueDate) return false;
            const tDate = new Date(t.dueDate);
            return tDate.getFullYear() === date.getFullYear() && 
                   tDate.getMonth() === date.getMonth() && 
                   tDate.getDate() === date.getDate();
          });

          return (
            <div key={day} style={{ borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '8px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <span style={{ 
                  width: '24px', height: '24px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  borderRadius: '50%', 
                  fontSize: '0.875rem', fontWeight: 600,
                  backgroundColor: isToday ? '#4F46E5' : 'transparent',
                  color: isToday ? 'white' : '#374151'
                }}>
                  {day}
                </span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {dayTasks.map(renderTask)}
              </div>
            </div>
          );
        })}
        
        {/* Fill remaining cells in the last row to maintain grid */}
        {Array.from({ length: (7 - ((daysInMonth + firstDayOfMonth) % 7)) % 7 }).map((_, i) => (
          <div key={`end-blank-${i}`} style={{ borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }} />
        ))}
      </div>
    </div>
  );
};
