import React, { useEffect, useState, useMemo } from 'react';
import { taskService, type Task } from '../services/taskService';
import { timeService, type TimeEntry } from '../services/timeService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Filter, Clock, Target, Briefcase } from 'lucide-react';

type DateRange = '7days' | '30days' | 'all';

export const Reports: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30days');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedEntries] = await Promise.all([
        taskService.getTasks(),
        timeService.getAllTimeEntries()
      ]);
      setTasks(fetchedTasks);
      setTimeEntries(fetchedEntries);
    } catch (err) {
      console.error('Failed to load report data', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper mapping
  const taskMap = useMemo(() => {
    const map: Record<string, Task> = {};
    tasks.forEach(t => map[t.id] = t);
    return map;
  }, [tasks]);

  // Filtered Entries based on Date Range
  const filteredEntries = useMemo(() => {
    if (dateRange === 'all') return timeEntries;
    
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - (dateRange === '7days' ? 7 : 30));
    cutoff.setHours(0, 0, 0, 0);

    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoff;
    });
  }, [timeEntries, dateRange]);

  // KPI Calculations
  const { totalHours, topProject, accuracyObj } = useMemo(() => {
    let total = 0;
    const projectHours: Record<string, number> = {};
    const taskHours: Record<string, number> = {};

    filteredEntries.forEach(entry => {
      total += entry.hours_worked;
      
      const task = taskMap[entry.task_id];
      const proj = task?.projectId || 'Uncategorized';
      
      projectHours[proj] = (projectHours[proj] || 0) + entry.hours_worked;
      taskHours[entry.task_id] = (taskHours[entry.task_id] || 0) + entry.hours_worked;
    });

    let highestProj = 'None';
    let highestHours = 0;
    Object.entries(projectHours).forEach(([proj, hrs]) => {
      if (hrs > highestHours) {
        highestHours = hrs;
        highestProj = proj;
      }
    });

    // Estimation Accuracy (for tasks worked on in this period)
    let totalEst = 0;
    let totalAct = 0;
    Object.keys(taskHours).forEach(taskId => {
      const task = taskMap[taskId];
      if (task) {
        totalEst += task.estimatedHours || 0;
        totalAct += task.actualHours || 0; // we use the global actualHours to judge if it was over/under
      }
    });

    const variance = totalAct - totalEst;
    let accuracyStr = 'Perfectly Estimated';
    let accuracyColor = '#059669'; // Green
    if (variance > 0) {
      accuracyStr = `Overestimated by ${variance.toFixed(1)}h`;
      accuracyColor = '#DC2626'; // Red
    } else if (variance < 0) {
      accuracyStr = `Under by ${Math.abs(variance).toFixed(1)}h`;
      accuracyColor = '#059669'; // Green (faster than expected)
    }

    if (totalEst === 0) accuracyStr = 'No estimates found';

    return { 
      totalHours: total, 
      topProject: { name: highestProj, hours: highestHours },
      accuracyObj: { text: accuracyStr, color: accuracyColor }
    };
  }, [filteredEntries, taskMap]);

  // Chart 1: Daily Trend
  const dailyTrendData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    
    // Pre-fill days to ensure zeroes are plotted
    if (dateRange !== 'all') {
      const days = dateRange === '7days' ? 7 : 30;
      for(let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyMap[d.toISOString().split('T')[0]] = 0;
      }
    }

    filteredEntries.forEach(entry => {
      const d = entry.date.split('T')[0];
      if (dailyMap[d] !== undefined || dateRange === 'all') {
        dailyMap[d] = (dailyMap[d] || 0) + entry.hours_worked;
      }
    });

    return Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, hours]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: Number(hours.toFixed(1))
      }));
  }, [filteredEntries, dateRange]);

  // Chart 2: Project Distribution (Pie)
  const projectPieData = useMemo(() => {
    const projectHours: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      const task = taskMap[entry.task_id];
      const proj = task?.projectId || 'Uncategorized';
      projectHours[proj] = (projectHours[proj] || 0) + entry.hours_worked;
    });

    return Object.entries(projectHours)
      .filter(([_, hours]) => hours > 0)
      .map(([name, hours]) => ({
        name,
        value: Number(hours.toFixed(1))
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEntries, taskMap]);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#6B7280'];

  if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Generating reports...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Executive Reports</h1>
          <p style={{ color: '#6B7280', margin: '4px 0 0 0', fontSize: '0.875rem' }}>Analyze performance, estimation accuracy, and time allocation.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <Filter size={16} color="#6B7280" style={{ marginLeft: '8px' }} />
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '6px 12px', fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', marginBottom: '12px' }}>
            <Clock size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total Logged Time</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>{totalHours.toFixed(1)}h</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', marginBottom: '12px' }}>
            <Target size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Estimation Accuracy</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: accuracyObj.color, marginTop: '8px' }}>
            {accuracyObj.text}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', marginBottom: '12px' }}>
            <Briefcase size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Top Project</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {topProject.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>{topProject.hours.toFixed(1)} hours logged</div>
        </div>
      </div>

      {/* Visualizations Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        
        {/* Bar Chart */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 24px 0', color: '#111827' }}>Daily Time Trend</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ backgroundColor: '#111827', color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '0.875rem' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="hours" name="Hours Logged" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 24px 0', color: '#111827' }}>Project Distribution</h3>
          <div style={{ height: '300px', width: '100%' }}>
            {projectPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectPieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {projectPieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '0.875rem' }}
                    itemStyle={{ color: '#FFFFFF' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.75rem', color: '#374151' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>
                No project data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The Ledger (Data Table) */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#111827' }}>Time Ledger</h3>
          <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>{filteredEntries.length} entries found</span>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Project</th>
                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Task</th>
                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Notes</th>
                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>
                    No time entries found for the selected period.
                  </td>
                </tr>
              ) : (
                [...filteredEntries]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort newest first
                  .map((entry) => {
                    const task = taskMap[entry.task_id];
                    return (
                      <tr key={entry.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px 20px', fontSize: '0.8125rem', color: '#374151', whiteSpace: 'nowrap' }}>
                          {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.8125rem', color: '#4F46E5', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {task?.projectId || 'Uncategorized'}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.8125rem', color: '#111827', fontWeight: 500, maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task?.title || 'Unknown Task'}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.8125rem', color: '#6B7280', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {entry.notes || '-'}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.8125rem', color: '#111827', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {entry.hours_worked.toFixed(2)}h
                        </td>
                      </tr>
                    );
                })
              )}
            </tbody>
            {filteredEntries.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#F9FAFB' }}>
                  <td colSpan={4} style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: 600, color: '#111827', textAlign: 'right' }}>Total Hours in Period:</td>
                  <td style={{ padding: '16px 20px', fontSize: '1rem', fontWeight: 700, color: '#4F46E5', textAlign: 'right' }}>{totalHours.toFixed(2)}h</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
    </div>
  );
};
