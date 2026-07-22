import React, { useEffect, useState, useMemo } from 'react';
import { taskService, type Task } from '../services/taskService';
import { TaskForm } from '../components/TaskForm';
import { ChevronLeft, ChevronRight, AlertTriangle, ListTodo, TrendingUp } from 'lucide-react';

export const Workload: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
  };

  const handleTaskSaved = () => {
    fetchTasks();
    setIsTaskModalOpen(false);
  };

  // TIMELINE LOGIC (14 days window)
  const timelineStart = useMemo(() => {
    const d = new Date(viewDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [viewDate]);

  const timelineDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(timelineStart);
      d.setDate(timelineStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [timelineStart]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // WORKLOAD CALCULATION (GROUPED BY TASK)
  const { taskWorkload, dailyTotals } = useMemo(() => {
    const taskData: { task: Task; totalHours: number; daily: Record<string, number> }[] = [];
    const totals: Record<string, number> = {};

    // Initialize daily totals map
    timelineDays.forEach(day => {
      totals[day.toISOString()] = 0;
    });

    tasks.forEach(task => {
      if (task.status === 'Completed') return; 

      const actual = task.actualHours || 0;
      const remaining = Math.max(task.estimatedHours - actual, 0);
      if (remaining === 0) return;

      let start = new Date(task.startDate || task.dueDate || today);
      let end = new Date(task.dueDate || task.startDate || today);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (start > end) {
        const temp = start;
        start = end;
        end = temp;
      }

      // Count valid weekdays
      let validDaysCount = 0;
      const validDates: string[] = [];
      
      let current = new Date(start);
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
          validDaysCount++;
          validDates.push(current.toISOString());
        }
        current.setDate(current.getDate() + 1);
      }

      // If due on a weekend and started on a weekend, default to 1 day
      if (validDaysCount === 0) {
        validDaysCount = 1;
        validDates.push(start.toISOString());
      }

      const hoursPerDay = Number((remaining / validDaysCount).toFixed(1));
      
      const dailyRecord: Record<string, number> = {};
      let taskTotalInWindow = 0;

      validDates.forEach(dateStr => {
        // Only add if date is within 14-day window
        if (totals[dateStr] !== undefined) {
          dailyRecord[dateStr] = hoursPerDay;
          taskTotalInWindow += hoursPerDay;
          totals[dateStr] += hoursPerDay;
        }
      });

      // Only include tasks that actually fall in this 14-day window
      if (taskTotalInWindow > 0) {
        taskData.push({
          task,
          totalHours: taskTotalInWindow,
          daily: dailyRecord
        });
      }
    });

    // Sort tasks by total hours descending, then by dueDate
    taskData.sort((a, b) => b.totalHours - a.totalHours);

    return { taskWorkload: taskData, dailyTotals: totals };
  }, [tasks, timelineDays, today]);

  // SMART INSIGHTS
  const overbookedDays = useMemo(() => {
    const overbooked: { date: Date; hours: number }[] = [];
    Object.entries(dailyTotals).forEach(([dateStr, hours]) => {
      if (hours > 8) { // 8h total personal limit
        overbooked.push({ date: new Date(dateStr), hours });
      }
    });
    return overbooked;
  }, [dailyTotals]);

  const underUtilizedDays = useMemo(() => {
    const underUtilized: { date: Date; hours: number }[] = [];
    Object.entries(dailyTotals).forEach(([dateStr, hours]) => {
      const d = new Date(dateStr);
      // Only look at weekdays in the future (or today)
      if (d.getDay() !== 0 && d.getDay() !== 6 && d >= today) {
        if (hours < 4) { // Less than 4 hours booked
          underUtilized.push({ date: d, hours });
        }
      }
    });
    // Sort by date and take first 3
    return underUtilized.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 3);
  }, [dailyTotals, today]);

  const topTasks = useMemo(() => {
    return taskWorkload.slice(0, 5); // top 5 heaviest tasks
  }, [taskWorkload]);

  const totalWeeklyHours = taskWorkload.reduce((sum, item) => sum + item.totalHours, 0);

  // COLORS
  const getCellColor = (hours: number) => {
    if (hours === 0) return { bg: 'transparent', text: '#D1D5DB' };
    if (hours <= 1.9) return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    if (hours <= 3.9) return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' }; // > 4h on a SINGLE task is very heavy
  };

  const getHeaderColor = (totalHours: number) => {
    if (totalHours > 8) return { bg: '#FEF2F2', text: '#DC2626', border: '#F87171' };
    if (totalHours > 6) return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    return { bg: 'transparent', text: '#4F46E5', border: 'transparent' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#9CA3AF';
    }
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Loading workload data...</div>;

  return (
    <div style={{ display: 'flex', gap: '16px', maxWidth: '1600px', margin: '0 auto', height: '100%', alignItems: 'flex-start' }}>
      
      {/* MAIN AREA: HEATMAP GRID */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* Header Toolbar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>Task Distribution Heatmap</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() - 14); setViewDate(d); }} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}><ChevronLeft size={14}/></button>
              <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() + 14); setViewDate(d); }} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}><ChevronRight size={14}/></button>
            </div>
            <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
              {timelineStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(timelineStart.getTime() + 13 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Heatmap Grid Area */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          
          {/* Grid Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '250px repeat(14, minmax(40px, 1fr))', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: '#FFFFFF', zIndex: 10 }}>
            <div style={{ padding: '12px 16px', borderRight: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Active Tasks</div>
              <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '2px' }}>Total Hours in Period</div>
            </div>
            
            {timelineDays.map((d, i) => {
              const dateStr = d.toISOString();
              const isToday = d.getTime() === today.getTime();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const dayTotal = dailyTotals[dateStr] || 0;
              const headerStyle = getHeaderColor(dayTotal);
              
              return (
                <div key={i} style={{ 
                  padding: '6px 2px', 
                  textAlign: 'center', 
                  borderRight: '1px solid #F3F4F6',
                  backgroundColor: isWeekend ? '#F9FAFB' : (headerStyle.bg !== 'transparent' ? headerStyle.bg : (isToday ? '#EEF2FF' : '#FFFFFF')),
                  borderBottom: headerStyle.border !== 'transparent' ? `2px solid ${headerStyle.border}` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '0.65rem', color: headerStyle.text !== '#4F46E5' ? headerStyle.text : (isToday ? '#4F46E5' : '#9CA3AF'), textTransform: 'uppercase', fontWeight: 600 }}>
                    {d.toLocaleDateString('en-US', { weekday: 'short' })[0]}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: headerStyle.text !== '#4F46E5' ? headerStyle.text : (isToday ? '#4F46E5' : '#374151'), fontWeight: isToday || headerStyle.text !== '#4F46E5' ? 700 : 500, margin: '2px 0' }}>
                    {d.getDate()}
                  </div>
                  
                  {/* Daily Total Pill */}
                  {!isWeekend && (
                    <div style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 700, 
                      backgroundColor: headerStyle.text, 
                      color: headerStyle.bg === 'transparent' && !isToday ? '#6B7280' : '#FFFFFF',
                      padding: '1px 4px', 
                      borderRadius: '8px',
                      minWidth: '20px'
                    }}>
                      {dayTotal.toFixed(1)}h
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid Body (Rows per Task) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {taskWorkload.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>No tasks assigned in this timeframe. Add tasks to see them distributed here.</div>
            ) : (
              taskWorkload.map(({ task, totalHours, daily }) => {
                const priorityColor = getPriorityColor(task.priority);
                
                return (
                  <div key={task.id} style={{ display: 'grid', gridTemplateColumns: '250px repeat(14, minmax(40px, 1fr))', borderBottom: '1px solid #F3F4F6', minHeight: '44px' }}>
                    
                    {/* Task Label Cell */}
                    <div 
                      onClick={() => handleOpenEditTask(task)}
                      style={{ padding: '8px 12px', borderRight: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ width: '4px', height: '100%', backgroundColor: priorityColor, borderRadius: '2px', flexShrink: 0 }}></div>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={task.title}>{task.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: 500 }}>{totalHours.toFixed(1)}h</span>
                          <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>•</span>
                          <span style={{ fontSize: '0.6rem', color: '#6B7280', padding: '1px 4px', backgroundColor: '#F3F4F6', borderRadius: '4px' }}>{task.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Heatmap Cells */}
                    {timelineDays.map((d, i) => {
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      const dateStr = d.toISOString();
                      const hours = daily[dateStr] || 0;
                      const styleInfo = getCellColor(hours);
                      
                      return (
                        <div key={i} style={{ 
                          borderRight: '1px solid #F3F4F6',
                          backgroundColor: isWeekend ? '#F9FAFB' : '#FFFFFF',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          {hours > 0 ? (
                            <div 
                              onClick={() => handleOpenEditTask(task)}
                              title={`Task: ${task.title}\nHours today: ${hours.toFixed(1)}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: styleInfo.bg,
                                border: `1px solid ${styleInfo.border}`,
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: styleInfo.text,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'transform 0.1s',
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              {hours.toFixed(1)}
                            </div>
                          ) : (
                            <div style={{ color: '#E5E7EB', fontSize: '0.7rem' }}>-</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: SOLO INSIGHTS */}
      <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#111827' }}>Personal Insights</h2>
        
        {/* Top Heaviest Tasks */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ListTodo size={16} color="#4F46E5" />
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0, color: '#111827' }}>Heaviest Tasks</h3>
          </div>
          {topTasks.length === 0 ? (
             <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>No active tasks in this period.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topTasks.map(({ task, totalHours }, i) => {
                const percentage = totalWeeklyHours > 0 ? Math.round((totalHours / totalWeeklyHours) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={task.title}>{task.title}</span>
                      <span style={{ color: '#6B7280' }}>{percentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: '#F3F4F6', borderRadius: '2px' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: getPriorityColor(task.priority), borderRadius: '2px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottlenecks Warning */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={16} color="#DC2626" />
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0, color: '#991B1B' }}>Daily Bottlenecks</h3>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: '0 0 12px 0' }}>Days exceeding your 8h capacity.</p>
          
          {overbookedDays.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: '#059669', margin: 0, fontWeight: 500 }}>Your schedule is perfectly balanced!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {overbookedDays.map((alert, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#991B1B' }}>{alert.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>{alert.hours.toFixed(1)}h</span>
                </div>
              ))}
              
              {/* Recommendation AI */}
              {underUtilizedDays.length > 0 && (
                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.7rem', color: '#4B5563' }}>
                  <span style={{ fontWeight: 600, color: '#4F46E5', display: 'block', marginBottom: '4px' }}>💡 Quick Fix:</span>
                  Consider extending the due dates of tasks falling on {overbookedDays[0].date.toLocaleDateString('en-US', { weekday: 'long' })} into {underUtilizedDays[0].date.toLocaleDateString('en-US', { weekday: 'long' })} to reduce the bottleneck.
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Available Capacity */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <TrendingUp size={16} color="#059669" />
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0, color: '#065F46' }}>Open Slots</h3>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: '0 0 12px 0' }}>Upcoming days with &lt;4h booked.</p>
          
          {underUtilizedDays.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>You are fully booked for the coming week.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {underUtilizedDays.map((slot, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '6px 8px', backgroundColor: '#ECFDF5', borderRadius: '4px' }}>
                  <span style={{ fontWeight: 500, color: '#065F46' }}>{slot.date.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                  <span style={{ color: '#059669' }}>{slot.hours.toFixed(1)}h booked</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {isTaskModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TaskForm
            initialTask={editingTask}
            onCancel={handleCloseTaskModal}
            onSuccess={handleTaskSaved}
          />
        </div>
      )}

    </div>
  );
};
