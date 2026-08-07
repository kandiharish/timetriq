import React from 'react';
import type { Task } from '../services/taskService';

interface MonthCalendarProps {
  currentDate: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick?: (date: Date) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({ currentDate, tasks, onTaskClick, onDateClick }) => {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const endBlanks = Array.from({ length: (7 - ((daysInMonth + firstDayOfMonth) % 7)) % 7 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return { bg: '#F3F4F6', border: '#E5E7EB', text: '#4B5563' };
      case 'In Progress': return { bg: '#E0E7FF', border: '#C7D2FE', text: '#3730A3' };
      case 'Review': return { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' };
      case 'Completed': return { bg: '#D1FAE5', border: '#A7F3D0', text: '#065F46' };
      case 'Blocked': return { bg: '#FEE2E2', border: '#FECACA', text: '#991B1B' };
      default: return { bg: '#F3F4F6', border: '#E5E7EB', text: '#4B5563' };
    }
  };

  const emptyCellStyle = {
    backgroundColor: '#F9FAFB'
  };

  const renderTask = (task: Task) => {
    const color = getStatusColor(task.status);
    return (
      <div 
        key={task.id}
        onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
        style={{
          padding: '3px 8px',
          marginBottom: '4px',
          backgroundColor: color.bg,
          border: `1px solid ${color.border}`,
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: 500,
          color: color.text,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          alignItems: 'center',
          transition: 'transform 0.1s, box-shadow 0.1s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
        title={`${task.title} (${task.status})`}
      >
        <span style={{ 
          display: 'inline-block', 
          width: '6px', 
          height: '6px', 
          borderRadius: '50%', 
          backgroundColor: color.text, 
          marginRight: '6px',
          opacity: 0.7,
          flexShrink: 0
        }}></span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</span>
      </div>
    );
  };

  const weeks = Math.ceil((daysInMonth + firstDayOfMonth) / 7);

  return (
    <div style={{ backgroundColor: '#F3F4F6', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ padding: '10px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {day}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `repeat(${weeks}, minmax(100px, 1fr))`, flex: 1, gap: '1px', backgroundColor: '#F3F4F6' }}>
        {blanks.map(blank => (
          <div key={`blank-${blank}`} style={emptyCellStyle} />
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
            <div 
              key={day} 
              onClick={() => onDateClick?.(date)}
              style={{ padding: '8px', display: 'flex', flexDirection: 'column', backgroundColor: isToday ? '#F8FAFC' : 'white', cursor: onDateClick ? 'pointer' : 'default', transition: 'background-color 0.1s' }}
              onMouseEnter={(e) => { if (onDateClick) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
              onMouseLeave={(e) => { if (onDateClick) e.currentTarget.style.backgroundColor = isToday ? '#F8FAFC' : 'white'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ 
                  width: '24px', height: '24px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  borderRadius: '50%', 
                  fontSize: '0.75rem', fontWeight: 600,
                  backgroundColor: isToday ? '#4F46E5' : 'transparent',
                  color: isToday ? 'white' : (dayTasks.length > 0 ? '#111827' : '#9CA3AF'),
                }}>
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 500, paddingRight: '4px' }}>
                    {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {dayTasks.map(renderTask)}
              </div>
            </div>
          );
        })}
        
        {/* Fill remaining cells in the last row to maintain grid */}
        {endBlanks.map((_, i) => (
          <div key={`end-blank-${i}`} style={emptyCellStyle} />
        ))}
      </div>
    </div>
  );
};
