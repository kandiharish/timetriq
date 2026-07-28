import React, { useEffect, useState } from 'react';
import { timeService, type TimeEntry } from '../services/timeService';
import { taskService, type Task } from '../services/taskService';
import { formatDurationHMS } from '../lib/utils';
import { useAuth } from '../components/AuthContext';

export const TimesheetGrid: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [loading, setLoading] = useState(true);
  
  // Week navigation state
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesData, tasksData] = await Promise.all([
        timeService.getAllTimeEntries(),
        taskService.getTasks()
      ]);
      
      setEntries(entriesData);
      
      const tasksMap: Record<string, Task> = {};
      tasksData.forEach(task => { tasksMap[task.id] = task; });
      setTasks(tasksMap);
    } catch (err) {
      console.error('Failed to load time entries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Determine the week date range (Monday to Sunday)
  const getWeekDates = (offsetWeeks: number) => {
    const now = new Date();
    // JS getDay(): Sun=0, Mon=1...
    const dayOfWeek = now.getDay() || 7; // Convert Sun(0) to 7
    // Calculate Monday of current week
    const currentWeekMonday = new Date(now);
    currentWeekMonday.setDate(now.getDate() - dayOfWeek + 1 + (offsetWeeks * 7));
    currentWeekMonday.setHours(0,0,0,0);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekMonday);
      d.setDate(currentWeekMonday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const currentWeekDates = getWeekDates(weekOffset);
  const startDateStr = currentWeekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDateStr = currentWeekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dateRangeStr = `${startDateStr} - ${endDateStr}`;

  // Precompute column headers
  const columns = currentWeekDates.map(d => {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(); // "MON"
    const dayDate = d.getDate(); // "27"
    
    // Create robust ISO string matching local date
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    const isoDate = `${y}-${m}-${dStr}`;
    
    return { dayName, dayDate, isoDate };
  });

  // Filter entries to current week
  const weekIsoDates = columns.map(c => c.isoDate);
  const thisWeekEntries = entries.filter(e => weekIsoDates.includes(e.date));

  // Group by task_id
  const taskGroup: Record<string, { total: number, days: Record<string, number> }> = {};
  
  thisWeekEntries.forEach(entry => {
    if (!taskGroup[entry.task_id]) {
      taskGroup[entry.task_id] = { total: 0, days: {} };
      columns.forEach(c => taskGroup[entry.task_id].days[c.isoDate] = 0);
    }
    taskGroup[entry.task_id].days[entry.date] += entry.hours_worked;
    taskGroup[entry.task_id].total += entry.hours_worked;
  });

  // Person total
  let personTotalHours = 0;
  const personDailyTotals: Record<string, number> = {};
  columns.forEach(c => personDailyTotals[c.isoDate] = 0);
  
  Object.values(taskGroup).forEach(tg => {
    personTotalHours += tg.total;
    columns.forEach(c => {
      personDailyTotals[c.isoDate] += tg.days[c.isoDate];
    });
  });

  if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Loading timesheet...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#111827' }}>Timesheet</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6B7280' }}>{dateRangeStr}</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setWeekOffset(prev => prev - 1)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: '#6B7280', cursor: 'pointer' }}>&lt;</button>
            <button onClick={() => setWeekOffset(prev => prev + 1)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: '#6B7280', cursor: 'pointer' }}>&gt;</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#EEF2FF', padding: '6px 12px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 600 }}>≡ƒæñ Me</span>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#6B7280', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', minWidth: '250px' }}>Person / Task</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', width: '100px' }}>Total</th>
                {columns.map(c => (
                  <th key={c.isoDate} style={{ padding: '12px 8px', fontWeight: 600, fontSize: '0.65rem', textAlign: 'center', minWidth: '80px' }}>
                    {c.dayName}, {c.dayDate}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Person Row */}
              <tr 
                onClick={() => setIsExpanded(!isExpanded)} 
                style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                      {user?.displayName?.substring(0,2).toUpperCase() || 'ME'}
                    </div>
                    <span style={{ fontWeight: 500, color: '#374151' }}>{user?.displayName || 'My Timesheet'}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: '#374151' }}>
                  {formatDurationHMS(personTotalHours)}
                </td>
                {columns.map(c => {
                  const dayHours = personDailyTotals[c.isoDate];
                  const barWidth = Math.min(100, Math.max(0, (dayHours / 8) * 100)); // Assuming 8hr cap for bar viz
                  return (
                    <td key={c.isoDate} style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                        {dayHours > 0 && (
                          <div style={{ height: '100%', width: `${barWidth}%`, backgroundColor: '#8B5CF6', borderRadius: '2px' }}></div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Task Rows (Expanded) */}
              {isExpanded && Object.keys(taskGroup).length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
                    No time logged this week.
                  </td>
                </tr>
              )}
              {isExpanded && Object.keys(taskGroup).map(taskId => {
                const tg = taskGroup[taskId];
                const taskName = tasks[taskId]?.title || 'Unknown Task';
                return (
                  <tr key={taskId} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '24px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                        <span style={{ color: '#4B5563', fontWeight: 500 }}>{taskName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: '0.75rem' }}>
                      {formatDurationHMS(tg.total)}
                    </td>
                    {columns.map(c => (
                      <td key={c.isoDate} style={{ padding: '12px 8px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.75rem' }}>
                        {tg.days[c.isoDate] > 0 ? <span style={{ color: '#4B5563' }}>{formatDurationHMS(tg.days[c.isoDate])}</span> : '-'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
