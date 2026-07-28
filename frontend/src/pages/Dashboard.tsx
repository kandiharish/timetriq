import React, { useEffect, useState } from 'react';
import { dashboardService, type DashboardMetrics } from '../services/dashboardService';
import { taskService, type Task } from '../services/taskService';
import { timeService, type TimeEntry } from '../services/timeService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ClipboardList, Clock, Activity, Plus } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, tasksData, entriesData] = await Promise.all([
          dashboardService.getMetrics(),
          taskService.getTasks(),
          timeService.getAllTimeEntries()
        ]);
        setMetrics(dashboardData);
        setTasks(tasksData);
        setTimeEntries(entriesData);
      } catch (err) {
        setError("Failed to connect to the backend server.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.addEventListener('timeEntryAdded', fetchData);
    return () => window.removeEventListener('timeEntryAdded', fetchData);
  }, []);

  if (loading) return <div style={{ padding: 'var(--spacing-8)' }}>Loading your dashboard...</div>;
  if (error || !metrics) return <div style={{ padding: 'var(--spacing-8)', color: 'var(--color-error)' }}>{error || 'Failed to load'}</div>;

  const totalTasks = tasks.length;
  const plannedHours = parseFloat(tasks.reduce((acc, t) => acc + t.estimatedHours, 0).toFixed(2));
  const loggedHours = parseFloat(timeEntries.reduce((acc, e) => acc + e.hours_worked, 0).toFixed(2));
  const remainingCapacity = parseFloat(Math.max(metrics.weekly_capacity - loggedHours, 0).toFixed(2));
  const avgProgress = totalTasks > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / totalTasks) * 100) : 0;

  // Banner Styles
  const bannerStyle = { backgroundColor: '#FEF3C7', padding: '16px', borderRadius: '8px', border: '1px solid #FDE68A', marginBottom: '24px', color: '#92400E', fontSize: '0.875rem', fontWeight: 500 };
  const cardStyle = { backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' as const };
  const headerStyle = { fontSize: '0.875rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px' };
  
  // Data calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate < todayStr);
  const unscheduledTasks = tasks.filter(t => !t.dueDate);
  const noEstimateTasks = tasks.filter(t => !t.estimatedHours || t.estimatedHours === 0);
  const unassignedTasks = tasks.filter(t => !t.projectId); // Mocking unassigned as no project for now
  
  const statusCounts = { 'Todo': 0, 'In Progress': 0, 'Review': 0, 'Completed': 0 };
  tasks.forEach(t => { if (t.status in statusCounts) statusCounts[t.status as keyof typeof statusCounts]++; });
  const pieData = Object.entries(statusCounts).filter(([_,v]) => v>0).map(([name, value]) => ({ name, value }));
  const COLORS = ['#9CA3AF', '#3B82F6', '#8B5CF6', '#10B981'];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return '#10B981';
      case 'In Progress': return '#3B82F6';
      case 'Review': return '#8B5CF6';
      default: return '#9CA3AF';
    }
  };

  const EmptyState = ({ message = "No Results" }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', fontSize: '0.875rem', padding: '24px 0' }}>{message}</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* 5 Top Cards (Kept as requested) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-4)' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '10px', borderRadius: '12px' }}><ClipboardList size={20} color="var(--color-primary)" /></div>
            <div><div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Tasks</div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalTasks}</div></div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#D1FAE5', padding: '10px', borderRadius: '12px' }}><Clock size={20} color="#10B981" /></div>
            <div><div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Planned Hours</div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{plannedHours}h</div></div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#FEF3C7', padding: '10px', borderRadius: '12px' }}><Clock size={20} color="#F59E0B" /></div>
            <div><div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Logged Hours</div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{loggedHours}h</div></div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#F3E8FF', padding: '10px', borderRadius: '12px' }}><Activity size={20} color="#9333EA" /></div>
            <div><div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Remaining Capacity</div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{remainingCapacity}h</div></div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#E0F2FE', padding: '10px', borderRadius: '12px' }}><Activity size={20} color="#0EA5E9" /></div>
            <div><div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Avg. Progress</div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{avgProgress}%</div></div>
          </div>
        </div>
      </div>

      {/* General Overview Banner */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 8px 0' }}>General Overview</h2>
        <div style={bannerStyle}>👋 This will help to understand the totality of the work that a person has</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: 'var(--spacing-4)' }}>
          {/* Total Tasks Box */}
          <div style={{ ...cardStyle, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{...headerStyle, width: '100%'}}>Total Tasks</div>
            <div style={{ fontSize: '5rem', fontWeight: 400, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>{totalTasks}</div>
          </div>
          
          {/* Overall Tasks List */}
          <div style={cardStyle}>
            <div style={headerStyle}>✅ Overall Tasks</div>
            {tasks.slice(0,4).map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', padding: '12px 0', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 500 }}>{t.title}</span>
                <span style={{ color: getStatusColor(t.status), fontWeight: 600, backgroundColor: 'var(--color-background)', padding: '2px 8px', borderRadius: '4px' }}>{t.status}</span>
                <span>{t.dueDate || '-'}</span>
              </div>
            ))}
          </div>

          {/* Workload by Status Pie */}
          <div style={cardStyle}>
            <div style={headerStyle}>Workload by Status</div>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Overview Banner */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 8px 0', marginTop: '16px' }}>Daily Overview</h2>
        <div style={{ ...bannerStyle, backgroundColor: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>This will help to understand the totality of the work that a person has TODAY.</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
          <div style={cardStyle}>
            <div style={headerStyle}>Timesheet</div>
            {timeEntries.filter(e => e.date === todayStr).length > 0 ? (
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 500, borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{user?.displayName?.[0] || 'U'}</div>
                   <span>{user?.displayName || 'Me'}</span>
                 </div>
                 <span style={{ fontWeight: 600 }}>{timeEntries.filter(e => e.date === todayStr).reduce((a,b) => a + b.hours_worked, 0).toFixed(2)} h</span>
               </div>
            ) : <EmptyState />}
          </div>
          <div style={cardStyle}>
            <div style={headerStyle}>Work Done today</div>
            <EmptyState />
          </div>
        </div>
      </div>

      {/* Status Wise Task Overview */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 8px 0', marginTop: '16px' }}>Status Wise Task Overview</h2>
        <div style={{ ...bannerStyle, backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}>👍 This will help to understand the different status of the overall work.</div>
        
        {/* Tasks without estimates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3.5fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
          <div style={{ ...cardStyle, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{...headerStyle, width: '100%'}}>Tasks without Estimates</div>
            <div style={{ fontSize: '5rem', fontWeight: 400, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>{noEstimateTasks.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={headerStyle}>Task List</div>
            {noEstimateTasks.length === 0 ? <EmptyState /> : noEstimateTasks.slice(0,5).map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', padding: '12px 0', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 500, flex: 2 }}>{t.title}</span>
                <span style={{ flex: 1 }}>{t.dueDate || '-'}</span>
                <span style={{ flex: 1 }}>-</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3.5fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
          <div style={{ ...cardStyle, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{...headerStyle, width: '100%'}}>Overdue Tasks</div>
            <div style={{ fontSize: '5rem', fontWeight: 400, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>{overdueTasks.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={headerStyle}>Overdue Tasks</div>
            {overdueTasks.length === 0 ? <EmptyState /> : overdueTasks.slice(0,5).map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', padding: '12px 0', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 500, flex: 2 }}>{t.title}</span>
                <span style={{ flex: 1, color: getStatusColor(t.status), fontWeight: 600, backgroundColor: 'var(--color-background)', padding: '2px 8px', borderRadius: '4px' }}>{t.status}</span>
                <span style={{ flex: 1, color: 'var(--color-error)' }}>{t.dueDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Unassigned */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3.5fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
          <div style={{ ...cardStyle, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{...headerStyle, width: '100%'}}>Unassigned Tasks</div>
            <div style={{ fontSize: '5rem', fontWeight: 400, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>{unassignedTasks.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={headerStyle}>Unassigned Tasks</div>
            {unassignedTasks.length === 0 ? <EmptyState /> : unassignedTasks.slice(0,5).map(t => (
               <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', padding: '12px 0', fontSize: '0.75rem' }}>
                 <span style={{ fontWeight: 500, flex: 2 }}>{t.title}</span>
                 <span style={{ flex: 1 }}>{t.dueDate || '-'}</span>
               </div>
            ))}
          </div>
        </div>

        {/* Unscheduled */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3.5fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
          <div style={{ ...cardStyle, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{...headerStyle, width: '100%'}}>Unscheduled Tasks</div>
            <div style={{ fontSize: '5rem', fontWeight: 400, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>{unscheduledTasks.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={headerStyle}>Unscheduled Tasks</div>
            {unscheduledTasks.length === 0 ? <EmptyState /> : unscheduledTasks.slice(0,5).map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', padding: '12px 0', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 500, flex: 2 }}>{t.title}</span>
                <span style={{ flex: 1, color: getStatusColor(t.status), fontWeight: 600, backgroundColor: 'var(--color-background)', padding: '2px 8px', borderRadius: '4px' }}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
