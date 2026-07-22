import React, { useEffect, useState } from 'react';
import { dashboardService, type DashboardMetrics } from '../services/dashboardService';
import { taskService, type Task } from '../services/taskService';
import { timeService, type TimeEntry } from '../services/timeService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { ClipboardList, Clock, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [actuals, setActuals] = useState<Record<string, number>>({});

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

        const actualsMap: Record<string, number> = {};
        entriesData.forEach(entry => {
          actualsMap[entry.task_id] = (actualsMap[entry.task_id] || 0) + entry.hours_worked;
        });
        setActuals(actualsMap);
      } catch (err) {
        setError("Failed to connect to the backend server.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 'var(--spacing-8)' }}>Loading your dashboard...</div>;
  if (error || !metrics) return <div style={{ padding: 'var(--spacing-8)', color: 'var(--color-error)' }}>{error || 'Failed to load'}</div>;

  // Calculate top-level stats
  const totalTasks = tasks.length;
  const plannedHours = tasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const loggedHours = timeEntries.reduce((acc, e) => acc + e.hours_worked, 0);
  const remainingCapacity = Math.max(metrics.weekly_capacity - loggedHours, 0);
  const avgProgress = totalTasks > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / totalTasks) * 100) : 0;
  const capacityPercentage = metrics.weekly_capacity > 0 ? Math.min((loggedHours / metrics.weekly_capacity) * 100, 100) : 0;

  // Filter tasks for "My Tasks"
  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'All') return true;
    return t.status === activeTab;
  }).slice(0, 5); // limit to 5

  const projectColors = ['#4F46E5', '#10B981', '#F59E0B', '#E5E7EB'];
  
  // Calculate project distribution
  const projectStats: Record<string, number> = {};
  tasks.forEach(t => {
    const proj = t.projectId || 'Uncategorized';
    projectStats[proj] = (projectStats[proj] || 0) + 1;
  });
  const projectData = Object.entries(projectStats).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0,4);
  const totalProjectTasks = Object.values(projectStats).reduce((a,b) => a+b, 0);
  if (projectData.length > 0 && totalProjectTasks > 0) {
     projectData.forEach(p => p.value = Math.round((p.value / totalProjectTasks) * 100));
  }

  // Calculate recent activity
  const recentActivity = timeEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((e) => {
     const task = tasks.find(t => t.id === e.task_id);
     return {
       id: e.id,
       text: `Logged ${e.hours_worked}h on ${task?.title || 'Unknown Task'}`,
       time: e.date,
       user: 'Me'
     };
  });

  // Basic weekly/monthly agg data for charts (mock logic based on real entries)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const weeklyData = last7Days.map(date => {
     const entriesForDay = timeEntries.filter(e => e.date === date);
     const logged = entriesForDay.reduce((acc, e) => acc + e.hours_worked, 0);
     const planned = 8; // Assumed 8 hrs planned per day
     return {
       name: date.split('-').slice(1).join('/'),
       planned,
       actual: logged
     };
  });

  let cumulativeEst = 0;
  let cumulativeAct = 0;
  const lineData = last7Days.map(date => {
     const entriesForDay = timeEntries.filter(e => e.date === date);
     cumulativeAct += entriesForDay.reduce((acc, e) => acc + e.hours_worked, 0);
     cumulativeEst += 8;
     return {
       name: date.split('-').slice(1).join('/'),
       estimated: cumulativeEst,
       actual: cumulativeAct
     };
  });

  const cardStyle = { backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-5)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' as const };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 4px 0' }}>Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>Overview of your work, progress and capacity.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-surface)', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
             Filters
          </button>
        </div>
      </div>

      {/* Top Cards */}
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

      {/* Middle Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-6)' }}>
        
        {/* My Tasks */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--spacing-5) var(--spacing-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>My Tasks</h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500, cursor: 'pointer' }}>View All Tasks →</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-6)', padding: '0 var(--spacing-6)', borderBottom: '1px solid var(--color-border)' }}>
            {['All', 'In Progress', 'Review', 'Completed', 'Blocked', 'Todo'].map(tab => (
              <div 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={{ padding: '12px 0', borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: activeTab === tab ? 600 : 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                {tab}
              </div>
            ))}
          </div>
          <div style={{ padding: 'var(--spacing-2) var(--spacing-6)' }}>
            {filteredTasks.length === 0 ? (
               <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No tasks found for this filter.</div>
            ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '12px 0', fontWeight: 500 }}>Task</th>
                  <th style={{ padding: '12px 0', fontWeight: 500 }}>Priority</th>
                  <th style={{ padding: '12px 0', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '12px 0', fontWeight: 500 }}>Est. Hours</th>
                  <th style={{ padding: '12px 0', fontWeight: 500 }}>Act. Hours</th>
                  <th style={{ padding: '12px 0', fontWeight: 500 }}>Rem. Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t, i) => {
                  const act = actuals[t.id] || 0;
                  const rem = Math.max(t.estimatedHours - act, 0);
                  
                  return (
                  <tr key={t.id} style={{ borderBottom: i === filteredTasks.length - 1 ? 'none' : '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div>{t.title}</div>
                    </td>
                    <td style={{ padding: '12px 0', color: t.priority === 'High' ? 'var(--color-error)' : t.priority === 'Medium' ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 500 }}>{t.priority || 'Low'}</td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: t.status === 'In Progress' ? 'var(--color-primary-light)' : t.status === 'Review' ? '#F3E8FF' : 'var(--color-background)', color: t.status === 'In Progress' ? 'var(--color-primary)' : t.status === 'Review' ? '#9333EA' : 'var(--color-text-secondary)' }}>{t.status}</span>
                    </td>
                    <td style={{ padding: '12px 0' }}>{t.estimatedHours}h</td>
                    <td style={{ padding: '12px 0' }}>{act}h</td>
                    <td style={{ padding: '12px 0' }}>{rem}h</td>
                  </tr>
                )})}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Capacity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div style={{ ...cardStyle }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px 0' }}>Capacity Utilization</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative', height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{value: capacityPercentage}, {value: 100 - capacityPercentage}]} innerRadius={50} outerRadius={65} dataKey="value" stroke="none">
                      <Cell fill="var(--color-primary)" />
                      <Cell fill="var(--color-border)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{Math.round(capacityPercentage)}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Utilized</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div> <span style={{ fontWeight: 500 }}>Utilized ({loggedHours}h)</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></div> <span style={{ fontWeight: 500 }}>Remaining ({remainingCapacity}h)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - 2x2 Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-6)' }}>
        
        {/* Weekly Workload Bar Chart */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 16px 0' }}>Weekly Workload</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} tickFormatter={(val) => `${val}h`} />
                <Tooltip cursor={{ fill: 'var(--color-surface-hover)' }} />
                <Bar dataKey="planned" fill="var(--color-primary)" radius={[2, 2, 0, 0]} barSize={10} />
                <Bar dataKey="actual" fill="var(--color-success)" radius={[2, 2, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '0.75rem', fontWeight: 500 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--color-primary)' }}></div> Planned</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--color-success)' }}></div> Logged</div>
          </div>
        </div>

        {/* Estimated vs Actual Line Chart */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 16px 0' }}>Estimated vs Actual</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} tickFormatter={(val) => `${val}h`} />
                <Tooltip />
                <Area type="monotone" dataKey="estimated" stroke="var(--color-primary)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                <Area type="monotone" dataKey="actual" stroke="var(--color-success)" strokeWidth={2} fill="var(--color-success)" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '0.75rem', fontWeight: 500 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '2px', backgroundColor: 'var(--color-primary)', borderTop: '2px dashed var(--color-primary)' }}></div> Estimated Hours</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '2px', backgroundColor: 'var(--color-success)' }}></div> Actual Hours</div>
          </div>
        </div>

        {/* Top Projects */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 16px 0' }}>Top Projects</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '160px' }}>
            <div style={{ flex: 1, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {projectData.length > 0 ? (
                    <Pie data={projectData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                      {projectData.map((_, i) => <Cell key={i} fill={projectColors[i % projectColors.length]} />)}
                    </Pie>
                  ) : (
                    <Pie data={[{value:100}]} innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                      <Cell fill="var(--color-border)" />
                    </Pie>
                  )}
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
               {projectData.length > 0 ? projectData.map((p, i) => (
                 <div key={i}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: projectColors[i % projectColors.length] }}></div> {p.name}</div>
                   <div style={{ paddingLeft: '14px', fontWeight: 600, marginTop: '2px' }}>{p.value}%</div>
                 </div>
               )) : (
                 <div style={{ color: 'var(--color-text-secondary)' }}>No project data</div>
               )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 16px 0' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {recentActivity.length > 0 ? recentActivity.map((act) => (
              <div key={act.id} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                  {act.user.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{act.text}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{act.time}</div>
                </div>
              </div>
            )) : (
               <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginTop: '24px' }}>No recent activity</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
