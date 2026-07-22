import React, { useEffect, useState, useMemo } from 'react';
import { taskService, type Task } from '../services/taskService';
import { TaskForm } from '../components/TaskForm';
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Calendar: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  
  // For TaskForm Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    
    // Check URL params for "new task" shortcut
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      handleOpenNewTask();
      // Remove query param to prevent reopening on reload
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

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

  const handleOpenNewTask = () => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
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

  // TIMELINE LOGIC (28 days window)
  const timelineStart = useMemo(() => {
    const d = new Date(viewDate);
    // Start timeline on the Monday of the week that was 1 week ago
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setDate(diff - 7); 
    d.setHours(0,0,0,0);
    return d;
  }, [viewDate]);

  const timelineDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date(timelineStart);
      d.setDate(timelineStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [timelineStart]);

  const today = new Date();
  today.setHours(0,0,0,0);

  // Group tasks for agenda
  const agendaTasks = useMemo(() => {
    return tasks.filter(t => statusFilter === 'All' || t.status === statusFilter)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, statusFilter]);

  const overdueTasks = agendaTasks.filter(t => new Date(t.dueDate) < today && t.status !== 'Completed');
  const todayTasks = agendaTasks.filter(t => {
    const d = new Date(t.dueDate);
    d.setHours(0,0,0,0);
    return d.getTime() === today.getTime() && t.status !== 'Completed';
  });
  const upcomingTasks = agendaTasks.filter(t => new Date(t.dueDate) > today && t.status !== 'Completed').slice(0, 5);

  // Timeline Tasks
  const timelineTasks = useMemo(() => {
    const filtered = tasks.filter(t => statusFilter === 'All' || t.status === statusFilter);
    return filtered.map(t => {
      let start = new Date(t.startDate || t.dueDate || today);
      let end = new Date(t.dueDate || t.startDate || today);
      
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);

      // If dates are invalid or start is after end, fix them
      if (start > end) {
        const temp = start;
        start = end;
        end = temp;
      }

      const timelineEnd = new Date(timelineStart);
      timelineEnd.setDate(timelineStart.getDate() + 27);

      // Check if task falls within the 28-day window
      const isVisible = start <= timelineEnd && end >= timelineStart;
      
      let startCol = -1;
      let span = 0;

      if (isVisible) {
        const diffTimeStart = start.getTime() - timelineStart.getTime();
        startCol = Math.floor(diffTimeStart / (1000 * 60 * 60 * 24));
        
        const diffTimeEnd = end.getTime() - timelineStart.getTime();
        let endCol = Math.floor(diffTimeEnd / (1000 * 60 * 60 * 24));
        
        // clamp to grid
        if (startCol < 0) startCol = 0;
        if (endCol > 27) endCol = 27;
        
        span = endCol - startCol + 1;
      }

      return {
        ...t,
        start,
        end,
        isVisible,
        startCol,
        span
      };
    }).filter(t => t.isVisible).sort((a, b) => a.start.getTime() - b.start.getTime()); // Simple sort
  }, [tasks, timelineStart, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return { bg: '#F3F4F6', text: '#374151' };
      case 'In Progress': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'Review': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Completed': return { bg: '#D1FAE5', text: '#059669' };
      case 'Blocked': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Loading calendar...</div>;

  return (
    <div style={{ display: 'flex', gap: '16px', maxWidth: '1600px', margin: '0 auto', height: '100%', alignItems: 'flex-start' }}>
      
      {/* LEFT SIDEBAR: AGENDA */}
      <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#111827' }}>Schedule</h1>
          <button onClick={handleOpenNewTask} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer' }}>
            <Plus size={16} />
          </button>
        </div>

        {/* Mini Calendar (Static Visual for Navigation) */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() - 1); setViewDate(d); }} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}><ChevronLeft size={14}/></button>
              <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() + 1); setViewDate(d); }} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}><ChevronRight size={14}/></button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '0.7rem', color: '#6B7280', marginBottom: '4px' }}>
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          {/* Mocked mini grid for aesthetic density */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
            {Array.from({length: 35}).map((_, i) => (
              <div key={i} style={{ 
                height: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.75rem',
                color: (i > 3 && i < 30) ? '#374151' : '#D1D5DB',
                backgroundColor: i === 15 ? '#EEF2FF' : 'transparent',
                borderRadius: '4px',
                fontWeight: i === 15 ? 600 : 400
              }}>
                {(i % 30) + 1}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button onClick={() => setViewDate(new Date())} style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Today</button>
          </div>
        </div>

        {/* Agenda Lists */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {overdueTasks.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12}/> Overdue</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {overdueTasks.map(t => (
                  <div key={t.id} onClick={() => handleOpenEditTask(t)} style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FCA5A5', cursor: 'pointer' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#991B1B', marginBottom: '4px' }}>{t.title}</div>
                    <div style={{ fontSize: '0.7rem', color: '#DC2626' }}>Due: {t.dueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', marginBottom: '8px' }}>Today</div>
            {todayTasks.length === 0 ? <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>No tasks due today.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todayTasks.map(t => (
                  <div key={t.id} onClick={() => handleOpenEditTask(t)} style={{ padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>{t.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{t.estimatedHours}h est.</span>
                       <span style={{ backgroundColor: getStatusColor(t.status).bg, color: getStatusColor(t.status).text, padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', marginBottom: '8px' }}>Upcoming</div>
            {upcomingTasks.length === 0 ? <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>No upcoming tasks.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingTasks.map(t => (
                  <div key={t.id} onClick={() => handleOpenEditTask(t)} style={{ padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>{t.title}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Due: {t.dueDate}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT MAIN AREA: TIMELINE (GANTT) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* Timeline Header Toolbar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>Project Timeline</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() - 7); setViewDate(d); }} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}><ChevronLeft size={14}/></button>
              <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate() + 7); setViewDate(d); }} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}><ChevronRight size={14}/></button>
            </div>
            <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
              {timelineStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(timelineStart.getTime() + 27 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.75rem', color: '#374151', outline: 'none', cursor: 'pointer' }}>
                <option value="All">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
             </select>
          </div>
        </div>

        {/* Timeline Grid Area */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          
          {/* Grid Header (Days) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, minmax(40px, 1fr))', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: '#FFFFFF', zIndex: 10 }}>
            {timelineDays.map((d, i) => {
              const isToday = d.getTime() === today.getTime();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div key={i} style={{ 
                  padding: '8px 4px', 
                  textAlign: 'center', 
                  borderRight: '1px solid #F3F4F6',
                  backgroundColor: isToday ? '#EEF2FF' : (isWeekend ? '#F9FAFB' : '#FFFFFF')
                }}>
                  <div style={{ fontSize: '0.65rem', color: isToday ? '#4F46E5' : '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>{d.toLocaleDateString('en-US', { weekday: 'short' })[0]}</div>
                  <div style={{ fontSize: '0.75rem', color: isToday ? '#4F46E5' : '#374151', fontWeight: isToday ? 700 : 500, marginTop: '2px' }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Grid Body (Lanes) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, minmax(40px, 1fr))', position: 'absolute', top: '41px', bottom: 0, left: 0, right: 0, zIndex: 0 }}>
             {timelineDays.map((d, i) => {
               const isToday = d.getTime() === today.getTime();
               const isWeekend = d.getDay() === 0 || d.getDay() === 6;
               return (
                 <div key={i} style={{ 
                   borderRight: '1px solid #F3F4F6',
                   backgroundColor: isToday ? 'rgba(79, 70, 229, 0.03)' : (isWeekend ? '#F9FAFB' : 'transparent'),
                   height: '100%'
                 }} />
               );
             })}
          </div>

          {/* Timeline Tasks (Bars) */}
          <div style={{ position: 'relative', zIndex: 1, padding: '16px 0', minHeight: '100%' }}>
             {timelineTasks.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', fontSize: '0.875rem' }}>No tasks in this timeframe.</div>
             ) : (
               timelineTasks.map(t => {
                 const color = getStatusColor(t.status);
                 return (
                   <div key={t.id} style={{ 
                     display: 'grid', 
                     gridTemplateColumns: 'repeat(28, minmax(40px, 1fr))',
                     marginBottom: '8px',
                     padding: '0 4px',
                     alignItems: 'center'
                   }}>
                     <div 
                       onClick={() => handleOpenEditTask(t)}
                       style={{ 
                         gridColumn: `${t.startCol + 1} / span ${t.span}`,
                         backgroundColor: color.bg,
                         border: `1px solid ${color.text}40`,
                         borderRadius: '4px',
                         padding: '4px 8px',
                         fontSize: '0.75rem',
                         fontWeight: 500,
                         color: color.text,
                         whiteSpace: 'nowrap',
                         overflow: 'hidden',
                         textOverflow: 'ellipsis',
                         cursor: 'pointer',
                         boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '6px'
                       }}
                       title={`${t.title} (${t.status})`}
                     >
                       <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color.text, flexShrink: 0 }}></div>
                       {t.title}
                     </div>
                   </div>
                 );
               })
             )}
          </div>

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
