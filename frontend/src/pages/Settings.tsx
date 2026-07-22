import React, { useEffect, useState } from 'react';
import { settingsService } from '../services/settingsService';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Monday' },
  { id: 1, name: 'Tuesday' },
  { id: 2, name: 'Wednesday' },
  { id: 3, name: 'Thursday' },
  { id: 4, name: 'Friday' },
  { id: 5, name: 'Saturday' },
  { id: 6, name: 'Sunday' },
];

export const Settings: React.FC = () => {
  const [dailyCapacity, setDailyCapacity] = useState<number>(8);
  const [workingDays, setWorkingDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setDailyCapacity(data.daily_capacity);
        setWorkingDays(data.working_days);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleDayToggle = (dayId: number) => {
    setWorkingDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await settingsService.updateSettings({
        daily_capacity: dailyCapacity,
        working_days: workingDays
      });
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 'var(--spacing-8)' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--spacing-6)' }}>User Settings</h1>
      
      {message && (
        <div style={{ 
          padding: 'var(--spacing-4)', 
          marginBottom: 'var(--spacing-6)', 
          borderRadius: 'var(--radius-md)',
          backgroundColor: message.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-6)' }}>Working Capacity</h2>
        
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-2)' }}>Daily Capacity (Hours)</label>
          <input 
            type="number" 
            min="1" max="24" step="0.5"
            value={dailyCapacity}
            onChange={(e) => setDailyCapacity(parseFloat(e.target.value))}
            style={{ 
              width: '100%', 
              padding: 'var(--spacing-2)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem'
            }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
            The total number of hours you are available to work per day.
          </p>
        </div>

        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--spacing-3)' }}>Working Days</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--spacing-3)' }}>
            {DAYS_OF_WEEK.map(day => (
              <label key={day.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={workingDays.includes(day.id)}
                  onChange={() => handleDayToggle(day.id)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: '0.875rem' }}>{day.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving || workingDays.length === 0}
          style={{ 
            backgroundColor: 'var(--color-primary)', 
            color: 'white', 
            padding: 'var(--spacing-3) var(--spacing-6)', 
            border: 'none', 
            borderRadius: 'var(--radius-md)', 
            fontWeight: 600,
            cursor: (saving || workingDays.length === 0) ? 'not-allowed' : 'pointer',
            opacity: (saving || workingDays.length === 0) ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};
