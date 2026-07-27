import React, { useState } from 'react';
import { taskService, type Task, type TaskCreate } from '../services/taskService';
import { parseEstimatedTime, formatHours } from '../lib/utils';

interface TaskFormProps {
  initialTask?: Task;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<TaskCreate>({
    title: initialTask?.title || '',
    projectId: 'Personal',
    assignedUserId: 'Me',
    priority: initialTask?.priority || 'Medium',
    estimatedHours: initialTask?.estimatedHours || 0,
    startDate: initialTask?.startDate || '',
    dueDate: initialTask?.dueDate || '',
    description: initialTask?.description || '',
    status: initialTask?.status || 'Todo'
  });
  
  const [estTimeInput, setEstTimeInput] = useState(
    initialTask?.estimatedHours ? formatHours(initialTask.estimatedHours) : ''
   );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Perform a final parse and validation
    const { hours } = parseEstimatedTime(estTimeInput);
    
    // Status validation
    if (formData.status === 'Completed' && hours <= 0) {
      setError("Cannot mark task as Completed without logging hours first.");
      return;
    }
    
    const finalFormData = {
      ...formData,
      estimatedHours: hours
    };

    try {
      setLoading(true);
      setError(null);
      if (initialTask) {
        await taskService.updateTask(initialTask.id, finalFormData);
      } else {
        await taskService.createTask(finalFormData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleEstTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEstTimeInput(value);
    const { hours } = parseEstimatedTime(value);
    setFormData(prev => ({ ...prev, estimatedHours: hours }));
  };

  const handleEstTimeBlur = () => {
    const { hours } = parseEstimatedTime(estTimeInput);
    setEstTimeInput(hours > 0 ? formatHours(hours) : '');
    setFormData(prev => ({ ...prev, estimatedHours: hours }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const inputStyle = { width: '100%', padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.8125rem', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' };

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #E5E7EB' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: '0 0 20px 0' }}>{initialTask ? 'Edit Task' : 'Create New Task'}</h2>
      {error && <div style={{ color: '#DC2626', backgroundColor: '#FEF2F2', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8125rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div>
          <label style={labelStyle}>Task Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} style={{...inputStyle, backgroundColor: 'var(--color-background)'}}>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} style={{...inputStyle, backgroundColor: 'var(--color-background)'}}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Estimated Time</label>
            <input
              required
              type="text"
              placeholder="e.g. 3 → 3h, 3.4 → 3h 40m, 30m"
              name="estimatedHours"
              value={estTimeInput}
              onChange={handleEstTimeChange}
              onBlur={handleEstTimeBlur}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start Date</label>
            <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Due Date</label>
            <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px' }} />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 16px', backgroundColor: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontSize: '0.8125rem' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontSize: '0.8125rem' }}>
            {loading ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </form>
    </div>
  );
};
