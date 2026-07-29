import React, { useEffect, useState } from 'react';
import { dashboardService, type DashboardMetrics } from '../services/dashboardService';
import { taskService, type Task } from '../services/taskService';
import { timeService, type TimeEntry } from '../services/timeService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { ClipboardList, Clock, Activity } from 'lucide-react';
import { TimesheetGrid } from '../components/TimesheetGrid';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>(undefined);

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
  const plannedHoursTotal = tasks.reduce((acc, t) => acc + (Number(t.estimatedHours) || 0), 0);
  const plannedHours = parseFloat(plannedHoursTotal.toFixed(2));
  
  const loggedHoursTotal = timeEntries.reduce((acc, e) => acc + (Number(e.hours_worked) || 0), 0);
  const loggedHours = parseFloat(loggedHoursTotal.toFixed(2));
  
  const weeklyCap = Number(metrics.weekly_capacity) || 40;
  const remainingCapacity = parseFloat(Math.max(weeklyCap - loggedHoursTotal, 0).toFixed(2));
  


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
  const pieData = Object.entries(statusCounts)
    .filter(([_,v]) => v>0)
    .map(([name, value]) => {
      let displayName = name.toUpperCase();
      if (name === 'Review') displayName = 'PENDING FROM REVIEWER';
      if (name === 'Todo') displayName = 'TO DO';
      return { name: displayName, value };
    });
    
  const getStatusChartColor = (name: string) => {
    switch(name) {
      case 'IN PROGRESS': return '#6366f1';
      case 'TO DO': return '#8c92a1';
      case 'PENDING FROM REVIEWER': return '#a78bfa';
      case 'COMPLETED': return '#10b981';
      default: return '#9ca3af';
    }
  };

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

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, value, name } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    
    // Draw a line from the pie to the label
    const lineX = cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN);
    const lineY = cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN);
    
    return (
      <g>
        <polyline points={`${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${cy + outerRadius * Math.sin(-midAngle * RADIAN)} ${lineX},${lineY} ${x},${lineY}`} stroke="#9ca3af" fill="none" />
        <text 
          x={x + (x > cx ? 5 : -5)} 
          y={lineY} 
          fill="#374151" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize="10px"
          fontWeight="700"
        >
          {name} <span style={{ fontWeight: 'normal' }}>{value}</span>
        </text>
      </g>
    );
  };

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
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={0} 
                    outerRadius={65} 
                    paddingAngle={0} 
                    dataKey="value" 
                    stroke="#ffffff"
                    strokeWidth={2}
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(undefined)}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => <Cell key={i} fill={getStatusChartColor(entry.name)} />)}
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
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div style={cardStyle}>
            <div style={headerStyle}>Work Done today</div>
            <EmptyState />
          </div>
          <div style={{ padding: '24px 0' }}>
            <TimesheetGrid />
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
