import React, { useEffect, useState, useMemo } from 'react';
import { taskService, type Task } from '../services/taskService';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatHoursCompact } from '../lib/utils';

export const Reports: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Failed to load report data', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Identify tasks that are Over budget (actualHours > estimatedHours)
  const overBudgetTasks = useMemo(() => {
    return tasks
      .filter(t => (t.actualHours || 0) > (t.estimatedHours || 0) && (t.estimatedHours || 0) > 0)
      .map(t => {
        const overrun = (t.actualHours || 0) - (t.estimatedHours || 0);
        return {
          ...t,
          overrun
        };
      })
      .sort((a, b) => b.overrun - a.overrun);
  }, [tasks]);

  // 2. Estimation accuracy stats
  const stats = useMemo(() => {
    const estimatedTasks = tasks.filter(t => (t.estimatedHours || 0) > 0);
    const completedWithEstimate = estimatedTasks.filter(t => t.status === 'Completed');
    
    let totalEst = 0;
    let totalAct = 0;
    completedWithEstimate.forEach(t => {
      totalEst += t.estimatedHours || 0;
      totalAct += t.actualHours || 0;
    });

    const diff = totalAct - totalEst;
    const percentage = totalEst > 0 ? Math.round((totalAct / totalEst) * 100) : 100;

    return {
      totalEst,
      totalAct,
      diff,
      percentage,
      count: completedWithEstimate.length
    };
  }, [tasks]);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Loading Reports...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>Estimation & Budget Reports</h1>
        <p style={{ color: '#6B7280', fontSize: '0.8125rem', margin: 0 }}>Review estimation accuracy and tasks exceeding target hours.</p>
      </div>

      {/* Accuracy card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{
          backgroundColor: stats.diff > 0 ? '#FEF2F2' : '#ECFDF5',
          color: stats.diff > 0 ? '#DC2626' : '#10B981',
          padding: '16px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {stats.diff > 0 ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
        </div>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
            Estimation Drift: {stats.percentage}%
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.5 }}>
            Across {stats.count} completed tasks, you estimated <strong>{stats.totalEst.toFixed(1)}h</strong> and spent <strong>{stats.totalAct.toFixed(1)}h</strong>.
            {stats.diff > 0 ? (
              <span> You spent <strong style={{ color: '#DC2626' }}>{stats.diff.toFixed(1)} hours more</strong> than estimated.</span>
            ) : stats.diff < 0 ? (
              <span> You completed tasks <strong style={{ color: '#10B981' }}>{Math.abs(stats.diff).toFixed(1)} hours faster</strong> than expected!</span>
            ) : (
              <span> Your estimates were exactly spot-on!</span>
            )}
          </p>
        </div>
      </div>

      {/* Over-Budget Tasks */}
      <div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} color="#EF4444" /> Over-Budget Tasks
        </h2>
        
        {overBudgetTasks.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
            🎉 Excellent work! None of your tasks exceeded their estimated hours.
          </div>
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#F9FAFB', color: '#4B5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Task Title</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Estimate</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Spent</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Overrun</th>
                </tr>
              </thead>
              <tbody>
                {overBudgetTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 600, color: '#111827' }}>{task.title}</td>
                    <td style={{ padding: '12px 20px', color: '#4B5563' }}>{formatHoursCompact(task.estimatedHours)}</td>
                    <td style={{ padding: '12px 20px', color: '#4B5563' }}>{formatHoursCompact(task.actualHours || 0)}</td>
                    <td style={{ padding: '12px 20px', color: '#DC2626', fontWeight: 600 }}>+{formatHoursCompact(task.overrun)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
