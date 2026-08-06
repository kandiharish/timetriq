import React, { useState, useRef, useEffect } from 'react';
import { taskService, type TaskCreate, type Task } from '../services/taskService';
import { useAuth } from './AuthContext';
import { User, ChevronDown, X, Check } from 'lucide-react';

interface TaskFormProps {
  initialTask?: Task;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock users as requested
    const MOCK_USERS = [
      { id: 'harsh', name: 'Harsh (Manager)', initials: 'HA', color: '#4F46E5', role: 'Manager' },
      { id: 'sathyam', name: 'Sathyam (Manager)', initials: 'SA', color: '#059669', role: 'Manager' },
      { id: 'vishaka', name: 'Vishaka (HR)', initials: 'VI', color: '#D97706', role: 'HR' },
      { id: 'sakshi', name: 'Sakshi (HR)', initials: 'SA', color: '#DC2626', role: 'HR' },
      { id: 'harish_kandi', name: 'Harish Kandi (Employee)', initials: 'HK', color: '#2563EB', role: 'Employee' },
      { id: 'pradeep', name: 'Pradeep (Member)', initials: 'PR', color: '#7C3AED', role: 'Team Member' },
      { id: 'ramu', name: 'Ramu (Member)', initials: 'RA', color: '#2563EB', role: 'Team Member' },
      { id: 'rahul', name: 'Rahul (Member)', initials: 'RA', color: '#0891B2', role: 'Team Member' },
      { id: 'dev', name: 'Dev (Member)', initials: 'DE', color: '#16A34A', role: 'Team Member' },
    ];
    setTeamMembers(MOCK_USERS);
  }, []);

  const currentUserDisplayName = user?.displayName || user?.email || 'Unknown';

  const [form, setForm] = useState<TaskCreate>({
    title: initialTask?.title || '',
    projectId: initialTask?.projectId || 'default',
    assignedUserId: initialTask?.assignedUserId || '',
    assignees: initialTask?.assignees || [],
    assignedBy: initialTask?.assignedBy || currentUserDisplayName,
    assignedByUid: initialTask?.assignedByUid || user?.uid || '',
    priority: initialTask?.priority || '',
    estimatedHours: initialTask?.estimatedHours || ('' as any),
    startDate: initialTask?.startDate || '',
    dueDate: initialTask?.dueDate || '',
    description: initialTask?.description || '',
    status: initialTask?.status || 'Todo',
    actualHours: initialTask?.actualHours || 0,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleAssignee = (memberId: string) => {
    const current = form.assignees || [];
    if (current.includes(memberId)) {
      setForm({ ...form, assignees: current.filter(a => a !== memberId) });
    } else {
      setForm({ ...form, assignees: [...current, memberId] });
    }
  };

  const removeAssignee = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setForm({ ...form, assignees: (form.assignees || []).filter(a => a !== memberId) });
  };

  const selectedMembers = teamMembers.filter(m => (form.assignees || []).includes(m.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.priority) {
      setError('Priority is required');
      return;
    }
    if (!form.estimatedHours || form.estimatedHours <= 0) {
      setError('Estimated hours are required');
      return;
    }
    if (!form.startDate || !form.dueDate) {
      setError('Start Date and Due Date are required');
      return;
    }
    if ((!form.assignees || form.assignees.length === 0) && !form.assignedUserId) {
      setError('Assignee is required');
      return;
    }
    if (form.status === 'Completed' && (!initialTask?.actualHours || initialTask.actualHours <= 0)) {
      setError('Cannot mark task as Completed without logging hours first!');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (initialTask && initialTask.id) {
        await taskService.updateTask(initialTask.id, form);
      } else {
        await taskService.createTask(form);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FAFAFA',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
    letterSpacing: '0.01em',
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '14px',
      padding: '28px',
      boxShadow: '0 20px 60px -10px rgba(0,0,0,0.15)',
      maxHeight: '90vh',
      overflowY: 'auto',
      width: '100%',
      maxWidth: '520px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            {initialTask && initialTask.id ? 'Edit Task' : 'New Task'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
            Assigned by: <strong>{form.assignedBy === currentUserDisplayName ? 'You' : form.assignedBy}</strong>
          </p>
        </div>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Title */}
        <div>
          <label style={labelStyle}>Task Title *</label>
          <input
            style={inputStyle}
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="What needs to be done?"
            required
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, minHeight: '72px', resize: 'vertical', lineHeight: 1.5 }}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Add more details about this task..."
          />
        </div>

        {/* Assignees Dropdown */}
        <div>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={13} /> Assignees
            </span>
          </label>

          {/* Selected assignee chips shown above dropdown trigger */}
          {selectedMembers.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {selectedMembers.map(member => (
                <span
                  key={member.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px 3px 4px',
                    borderRadius: '20px',
                    backgroundColor: member.color + '18',
                    border: `1.5px solid ${member.color}50`,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: member.color,
                  }}
                >
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    backgroundColor: member.color, color: 'white',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: 800, flexShrink: 0,
                  }}>
                    {member.initials}
                  </span>
                  {member.name}
                  <button
                    type="button"
                    onClick={(e) => removeAssignee(member.id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', color: member.color, opacity: 0.7 }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Dropdown trigger */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${dropdownOpen ? '#4F46E5' : '#E5E7EB'}`,
                backgroundColor: '#FAFAFA',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                color: selectedMembers.length === 0 ? '#9CA3AF' : '#374151',
                boxShadow: dropdownOpen ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {selectedMembers.length === 0 ? (
                  <>
                    <User size={14} color="#9CA3AF" />
                    Add assignees...
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '-4px' }}>
                      {selectedMembers.slice(0, 3).map((m, i) => (
                        <span key={m.id} style={{
                          width: '22px', height: '22px', borderRadius: '50%',
                          backgroundColor: m.color, color: 'white',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.55rem', fontWeight: 800,
                          marginLeft: i === 0 ? 0 : '-6px',
                          border: '2px solid white',
                          zIndex: 3 - i,
                          position: 'relative',
                        }}>
                          {m.initials}
                        </span>
                      ))}
                    </div>
                    <span style={{ color: '#374151' }}>
                      {selectedMembers.length === 1
                        ? selectedMembers[0].name
                        : `${selectedMembers.length} assignees`}
                    </span>
                  </>
                )}
              </span>
              <ChevronDown
                size={15}
                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: '#6B7280' }}
              />
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 50,
                overflow: 'hidden',
              }}>
                <div style={{ padding: '8px', borderBottom: '1px solid #F3F4F6', fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'center' }}>
                  Click to select / deselect
                </div>
                {teamMembers.map(member => {
                  const isSelected = (form.assignees || []).includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleAssignee(member.id)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: 'none',
                        backgroundColor: isSelected ? member.color + '0D' : 'white',
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                        borderBottom: '1px solid #F9FAFB',
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F9FAFB'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isSelected ? member.color + '0D' : 'white'; }}
                    >
                      {/* Avatar */}
                      <span style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: member.color, color: 'white',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 800, flexShrink: 0,
                      }}>
                        {member.initials}
                      </span>
                      {/* Name */}
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{member.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                          {member.id === 'myself' ? 'Assign to yourself' : 'Team member'}
                        </div>
                      </div>
                      {/* Checkmark */}
                      {isSelected && (
                        <span style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          backgroundColor: member.color, color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Check size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Status & Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Status *</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              required
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Blocked">Blocked</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority *</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              required
            >
              <option value="" disabled>Select Priority...</option>
              <option value="Low">🟢  Low</option>
              <option value="Medium">🟡  Medium</option>
              <option value="High">🔴  High</option>
              <option value="Critical">🚨  Critical</option>
            </select>
          </div>
        </div>

        {/* Hours */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Estimated Hours *</label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              style={inputStyle}
              value={form.estimatedHours}
              onChange={e => setForm({ ...form, estimatedHours: parseFloat(e.target.value) || ('' as any) })}
              required
              placeholder="e.g., 2.5"
            />
          </div>
          <div>
            <label style={labelStyle}>Logged Hours</label>
            <input
              type="number"
              min="0"
              step="0.25"
              style={inputStyle}
              value={form.actualHours}
              onChange={e => setForm({ ...form, actualHours: parseFloat(e.target.value) || 0 })}
              placeholder="e.g., 1.5"
            />
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Start Date *</label>
            <input
              type="date"
              style={inputStyle}
              value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Due Date *</label>
            <input
              type="date"
              style={inputStyle}
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #F3F4F6', marginTop: '4px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '9px 18px', border: '1px solid #E5E7EB', borderRadius: '8px', background: 'white', color: '#374151', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '9px 22px',
              background: loading ? '#A5B4FC' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 2px 8px rgba(79,70,229,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Saving…' : (initialTask && initialTask.id) ? '✓ Update Task' : '+ Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};
