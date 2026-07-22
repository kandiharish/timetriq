import React, { useState, useEffect } from 'react';
import { timeService, type TimeEntryCreate, type TimeEntry } from '../services/timeService';

interface TimeEntryFormProps {
  taskId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ taskId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<TimeEntryCreate>({
    task_id: taskId,
    date: new Date().toISOString().split('T')[0],
    hours_worked: 1,
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const entries = await timeService.getTimeEntries(taskId);
        setRecentEntries(entries);
      } catch (err) {
        console.error('Failed to fetch recent entries', err);
      }
    };
    fetchEntries();
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await timeService.createTimeEntry(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to log time');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours_worked' ? Number(value) : value
    }));
  };

  return (
    <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginTop: 'var(--spacing-4)' }}>
      <h4 style={{ marginBottom: 'var(--spacing-3)' }}>Log Time</h4>
      {error && <div style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-3)', fontSize: '0.875rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: 'var(--spacing-1)' }}>Date</label>
          <input required type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: 'var(--spacing-1)' }}>Hours</label>
          <input required type="number" min="0.1" max="24" step="0.1" name="hours_worked" value={formData.hours_worked || ''} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: 'var(--spacing-1)' }}>Notes (Optional)</label>
          <input type="text" name="notes" value={formData.notes} onChange={handleChange} style={{ width: '100%', padding: 'var(--spacing-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: '1.25rem' }}>
          <button type="submit" disabled={loading} style={{ padding: 'var(--spacing-2) var(--spacing-3)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Save</button>
          <button type="button" onClick={onCancel} style={{ padding: 'var(--spacing-2) var(--spacing-3)', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>

      {recentEntries.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
          <h5 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-2)' }}>Recent Entries</h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
            {recentEntries.map(entry => (
              <li key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-1) 0' }}>
                <span>{entry.date} - {entry.notes || 'No notes'}</span>
                <span style={{ fontWeight: 600 }}>{entry.hours_worked} hrs</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
