import React, { useState, useEffect } from 'react';
import { timeService, type TimeEntry } from '../services/timeService';
import { useAuth } from './AuthContext';
import { parseEstimatedTime, formatHoursCompact } from '../lib/utils';

interface TimeEntryFormProps {
  taskId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ taskId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);

  // Form State
  const [timeInput, setTimeInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Create a default start time (e.g. current hour rounded down)
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    return d.toTimeString().slice(0, 5); // "HH:MM"
  });
  
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toTimeString().slice(0, 5);
  });
  
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  // Auto-recalculate endTime when timeInput changes
  useEffect(() => {
    if (!timeInput) return;
    const { hours } = parseEstimatedTime(timeInput);
    if (hours > 0 && startTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(sh, sm, 0, 0);
      
      const totalMinutes = hours * 60;
      startDate.setMinutes(startDate.getMinutes() + totalMinutes);
      
      setEndTime(startDate.toTimeString().slice(0, 5));
    }
  }, [timeInput, startTime]);

  // Auto-recalculate timeInput when endTime changes
  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    if (startTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = newEndTime.split(':').map(Number);
      
      let startMins = sh * 60 + sm;
      let endMins = eh * 60 + em;
      
      // Handle overnight tracking if end time is earlier than start time
      if (endMins < startMins) {
        endMins += 24 * 60;
      }
      
      const diffHours = (endMins - startMins) / 60;
      setTimeInput(formatHoursCompact(diffHours));
    }
  };

  const fetchEntries = async () => {
    try {
      const entries = await timeService.getTimeEntries(taskId);
      setRecentEntries(entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error('Failed to fetch recent entries', err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we have a valid duration
      let { hours } = parseEstimatedTime(timeInput);
      if (hours <= 0) {
        // Fallback to time diff
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        let diffMins = (eh * 60 + em) - (sh * 60 + sm);
        if (diffMins < 0) diffMins += 24 * 60;
        hours = diffMins / 60;
      }
      
      if (hours <= 0) throw new Error("Please enter a valid time duration");

      // Construct ISO datetimes
      const startDt = new Date(`${selectedDate}T${startTime}:00`);
      const endDt = new Date(`${selectedDate}T${endTime}:00`);
      
      // If end time is next day
      if (endDt < startDt) {
        endDt.setDate(endDt.getDate() + 1);
      }

      await timeService.createTimeEntry({
        task_id: taskId,
        date: selectedDate,
        start_time: startDt.toISOString(),
        end_time: endDt.toISOString(),
        hours_worked: hours,
        notes: notes,
        tags: tags || undefined
      });
      
      setTimeInput('');
      setNotes('');
      setTags('');
      fetchEntries();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to log time');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this time entry?')) return;
    try {
      await timeService.deleteTimeEntry(id);
      fetchEntries();
    } catch (err) {
      console.error('Failed to delete time entry', err);
    }
  };

  const totalRecentHours = recentEntries.reduce((sum, e) => sum + e.hours_worked, 0);

  const formatTimeStr = (isoStr?: string) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  
  const formatDateStr = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-border)', marginTop: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      {/* Top Input Area */}
      <div style={{ padding: '16px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Time on all tasks</h4>
        
        {error && <div style={{ color: '#EF4444', marginBottom: '12px', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Duration Input */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input 
              type="text" 
              placeholder="Enter time (ex: 3h 20m) or start timer" 
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9375rem', color: '#111827' }}
            />
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF' }}>
              <span style={{ fontSize: '1.2rem' }}>▶️</span>
            </div>
          </div>

          {/* Time Slot Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {/* Date & Time Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4B5563', fontSize: '0.875rem' }}>
              <span style={{ width: '20px', textAlign: 'center' }}>🕒</span>
              <input 
                type="date" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', cursor: 'pointer', padding: 0 }}
                />
                <span>—</span>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={e => handleEndTimeChange(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', cursor: 'pointer', padding: 0 }}
                />
              </div>
            </div>

            {/* Notes Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4B5563', fontSize: '0.875rem' }}>
              <span style={{ width: '20px', textAlign: 'center' }}>📝</span>
              <input 
                type="text" 
                placeholder="Notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: '#374151', padding: '4px 0' }}
              />
            </div>
            
            {/* Tags Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4B5563', fontSize: '0.875rem' }}>
              <span style={{ width: '20px', textAlign: 'center' }}>🏷️</span>
              <input 
                type="text" 
                placeholder="Add tags (comma separated, optional)"
                value={tags}
                onChange={e => setTags(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: '#374151', padding: '4px 0' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onCancel} style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: '#6B7280', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#111827', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>Save</button>
          </div>
        </form>
      </div>

      {/* Time Entries List */}
      {recentEntries.length > 0 && (
        <div style={{ borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Time Entries</span>
          </div>
          
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                  {user?.displayName?.substring(0,2).toUpperCase() || 'ME'}
                </div>
                <span style={{ fontWeight: 600, color: '#111827' }}>{user?.displayName || 'Harish Kandi'}</span>
              </div>
              <span style={{ fontWeight: 600, color: '#111827' }}>{formatHoursCompact(totalRecentHours)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentEntries.map(entry => (
                <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4B5563', fontSize: '0.8125rem' }}>
                    <span>{formatDateStr(entry.date)}, {formatTimeStr(entry.start_time)} - {formatTimeStr(entry.end_time)}</span>
                    <span style={{ color: '#9CA3AF' }}>🕒</span>
                    {entry.notes && <span style={{ marginLeft: '4px', fontStyle: 'italic', color: '#6B7280' }}>- {entry.notes}</span>}
                    {entry.tags && <span style={{ marginLeft: '4px', padding: '2px 6px', backgroundColor: '#F3F4F6', color: '#6B7280', borderRadius: '4px', fontSize: '0.7rem' }}>{entry.tags}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 500, color: '#374151', fontSize: '0.8125rem' }}>{formatHoursCompact(entry.hours_worked)}</span>
                    <button onClick={() => handleDelete(entry.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }} title="Delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
