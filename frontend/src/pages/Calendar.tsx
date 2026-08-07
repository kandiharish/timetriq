import React, { useEffect, useState, useMemo } from 'react';
import { taskService, type Task } from '../services/taskService';
import { TaskForm } from '../components/TaskForm';
import { CustomSelect } from '../components/CustomSelect';
import { MonthCalendar } from '../components/MonthCalendar';
import { WeeklyCalendar } from '../components/calendar/WeeklyCalendar';
import { BiWeeklyCalendar } from '../components/calendar/BiWeeklyCalendar';
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const TaskCarousel = ({ title, tasks, theme, onEdit }: { title: string, tasks: Task[], theme: 'red' | 'blue' | 'gray', onEdit: (t:Task)=>void }) => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 3;
  const pages = Math.ceil(tasks.length / itemsPerPage);
  
  const currentTasks = tasks.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  
  const themeColors = {
    red: { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', header: '#DC2626' },
    blue: { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF', header: '#2563EB' },
    gray: { bg: '#F9FAFB', border: '#E5E7EB', text: '#374151', header: '#4B5563' },
  };
  const colors = themeColors[theme];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.header, textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {theme === 'red' && <AlertCircle size={14}/>} {title}
          <span style={{ backgroundColor: colors.bg, padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', color: colors.text }}>{tasks.length}</span>
        </h3>
        {pages > 1 && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={{ border: '1px solid var(--color-border)', borderRadius: '4px', background: 'white', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}><ChevronLeft size={14}/></button>
            <button onClick={() => setPage(Math.min(pages - 1, page + 1))} disabled={page === pages - 1} style={{ border: '1px solid var(--color-border)', borderRadius: '4px', background: 'white', cursor: page === pages - 1 ? 'default' : 'pointer', opacity: page === pages - 1 ? 0.5 : 1 }}><ChevronRight size={14}/></button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
        {tasks.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#9CA3AF', fontSize: '0.875rem' }}>No {title.toLowerCase()} tasks.</div>
        ) : (
          currentTasks.map(t => (
            <div key={t.id} onClick={() => onEdit(t)} style={{ flex: 1, backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.1s', minWidth: 0 }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.text, marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.title}>{t.title}</div>
                <div style={{ fontSize: '0.75rem', color: colors.header }}>Due: {t.dueDate}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{t.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const Calendar: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  
  // For TaskForm Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly' | 'biweekly'>('monthly');

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1600px', margin: '0 auto', height: '100%', alignItems: 'flex-start' }}>
      
      {/* TOP ROW: Sidebar + Calendar */}
      <div style={{ display: 'flex', gap: '16px', width: '100%', flex: 1, minHeight: 0 }}>
        
        {/* LEFT SIDEBAR: AGENDA (Now just Mini Calendar) */}
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
          {/* Functional Mini Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
            {(() => {
              const mYear = viewDate.getFullYear();
              const mMonth = viewDate.getMonth();
              const daysInMonth = new Date(mYear, mMonth + 1, 0).getDate();
              const firstDay = new Date(mYear, mMonth, 1).getDay();
              const todayStr = new Date().toDateString();

              const cells = [];
              for (let i = 0; i < firstDay; i++) {
                cells.push(<div key={`b-${i}`} />);
              }
              for (let d = 1; d <= daysInMonth; d++) {
                const dateObj = new Date(mYear, mMonth, d);
                const isToday = dateObj.toDateString() === todayStr;
                const isSelected = viewDate.toDateString() === dateObj.toDateString();
                cells.push(
                  <div 
                    key={`d-${d}`}
                    onClick={() => setViewDate(dateObj)}
                    style={{ 
                      height: '24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.75rem',
                      color: isSelected ? '#4F46E5' : '#374151',
                      backgroundColor: isSelected ? '#EEF2FF' : 'transparent',
                      borderRadius: '4px',
                      fontWeight: isSelected ? 600 : (isToday ? 700 : 400),
                      cursor: 'pointer',
                      border: isToday && !isSelected ? '1px solid #E5E7EB' : 'none'
                    }}
                  >
                    {d}
                  </div>
                );
              }
              return cells;
            })()}
          </div>
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button onClick={() => setViewDate(new Date())} style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Today</button>
          </div>
        </div>
        </div>

      {/* RIGHT MAIN AREA: TIMELINE (GANTT) */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* Timeline Header Toolbar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '6px', padding: '2px' }}>
              <button 
                onClick={() => setViewMode('timeline')} 
                style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: viewMode === 'timeline' ? 'white' : 'transparent', color: viewMode === 'timeline' ? '#111827' : '#6B7280', boxShadow: viewMode === 'timeline' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
              >
                Timeline
              </button>
              <button 
                onClick={() => setViewMode('calendar')} 
                style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: viewMode === 'calendar' ? 'white' : 'transparent', color: viewMode === 'calendar' ? '#111827' : '#6B7280', boxShadow: viewMode === 'calendar' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
              >
                Calendar
              </button>
            </div>
            
            <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB', margin: '0 4px' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => { 
                const d = new Date(viewDate); 
                if (viewMode === 'timeline') {
                  d.setDate(d.getDate() - 7); 
                } else {
                  if (calendarView === 'monthly') d.setMonth(d.getMonth() - 1);
                  else if (calendarView === 'weekly') d.setDate(d.getDate() - 7);
                  else d.setDate(d.getDate() - 14);
                }
                setViewDate(d); 
              }} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}><ChevronLeft size={14}/></button>
              <button onClick={() => { 
                const d = new Date(viewDate); 
                if (viewMode === 'timeline') {
                  d.setDate(d.getDate() + 7); 
                } else {
                  if (calendarView === 'monthly') d.setMonth(d.getMonth() + 1);
                  else if (calendarView === 'weekly') d.setDate(d.getDate() + 7);
                  else d.setDate(d.getDate() + 14);
                }
                setViewDate(d); 
              }} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', color: '#374151', flexShrink: 0 }}><ChevronRight size={14}/></button>
            </div>
            <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {viewMode === 'timeline' ? (
                <>{timelineStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(timelineStart.getTime() + 27 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
              ) : calendarView === 'monthly' ? (
                <>{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</>
              ) : calendarView === 'weekly' ? (
                <>{(() => {
                  const d = new Date(viewDate);
                  d.setDate(d.getDate() - d.getDay());
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                })()} - {(() => {
                  const d = new Date(viewDate);
                  d.setDate(d.getDate() - d.getDay() + 6);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                })()}</>
              ) : (
                <>{(() => {
                  const d = new Date(viewDate);
                  d.setDate(d.getDate() - d.getDay());
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                })()} - {(() => {
                  const d = new Date(viewDate);
                  d.setDate(d.getDate() - d.getDay() + 13);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                })()}</>
              )}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             {viewMode === 'calendar' && (
               <CustomSelect 
                 value={calendarView} 
                 onChange={(v) => setCalendarView(v as 'monthly' | 'weekly' | 'biweekly')} 
                 options={[
                   {value: 'monthly', label: 'Monthly'},
                   {value: 'weekly', label: 'Weekly'},
                   {value: 'biweekly', label: 'Bi-Weekly'}
                 ]} 
                 buttonStyle={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.75rem', fontWeight: 600, color: '#374151', minWidth: '110px' }} 
               />
             )}
             <CustomSelect 
                value={statusFilter} 
                onChange={setStatusFilter} 
                options={[
                  {value: 'All', label: 'All Statuses'},
                  {value: 'Todo', label: 'Todo'},
                  {value: 'In Progress', label: 'In Progress'},
                  {value: 'Review', label: 'Review'},
                  {value: 'Completed', label: 'Completed'}
                ]} 
                buttonStyle={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.75rem', color: '#374151', minWidth: '130px' }} 
             />
          </div>
        </div>

        {/* Grid Area */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {viewMode === 'calendar' ? (
            <div style={{ padding: '16px', flex: 1, boxSizing: 'border-box' }}>
              {calendarView === 'monthly' && (
                <MonthCalendar 
                  currentDate={viewDate} 
                  tasks={tasks.filter(t => statusFilter === 'All' || t.status === statusFilter)} 
                  onTaskClick={handleOpenEditTask} 
                  onDateClick={(date) => setViewDate(date)}
                />
              )}
              {calendarView === 'weekly' && (
                <WeeklyCalendar 
                  currentDate={viewDate} 
                  tasks={tasks.filter(t => statusFilter === 'All' || t.status === statusFilter)} 
                  onTaskClick={handleOpenEditTask} 
                />
              )}
              {calendarView === 'biweekly' && (
                <BiWeeklyCalendar 
                  currentDate={viewDate} 
                  tasks={tasks.filter(t => statusFilter === 'All' || t.status === statusFilter)} 
                  onTaskClick={handleOpenEditTask} 
                />
              )}
            </div>
          ) : (
            <div style={{ minWidth: '1400px', height: '100%', position: 'relative' }}>
              {/* Grid Header (Days) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, minmax(50px, 1fr))', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: '#FFFFFF', zIndex: 10 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, minmax(50px, 1fr))', position: 'absolute', top: '41px', bottom: 0, left: 0, right: 0, zIndex: 0 }}>
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
                         gridTemplateColumns: 'repeat(28, minmax(50px, 1fr))',
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
          )}
        </div>
      </div>
      </div>

      {/* BOTTOM ROW: Paginated Task Carousels */}
      <div style={{ display: 'flex', gap: '16px', width: '100%', height: '170px', flexShrink: 0 }}>
        <TaskCarousel title="Overdue" tasks={overdueTasks} theme="red" onEdit={handleOpenEditTask} />
        <TaskCarousel title="Today" tasks={todayTasks} theme="blue" onEdit={handleOpenEditTask} />
        <TaskCarousel title="Upcoming" tasks={upcomingTasks} theme="gray" onEdit={handleOpenEditTask} />
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
