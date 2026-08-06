import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { workspaceService } from '../../services/workspaceService';

interface WorkspaceItemModalProps {
  type: 'space' | 'folder' | 'list';
  parentId?: string; // space_id for folder, folder_id for list
  onClose: () => void;
  onSuccess: () => void;
}

export const WorkspaceItemModal: React.FC<WorkspaceItemModalProps> = ({ type, parentId, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === 'folder' || type === 'space') {
      adminService.getUsers()
        .then(users => setAllUsers(users.filter((u: any) => u.role.toLowerCase() === 'employee')))
        .catch(e => console.error("Failed to fetch users", e));
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (type === 'space') {
        await workspaceService.createSpace({ name, description });
      } else if (type === 'folder' && parentId) {
        await workspaceService.createFolder({ name, space_id: parentId, description, members: assignees });
      } else if (type === 'list' && parentId) {
        await workspaceService.createList({ name, folder_id: parentId, description });
      }
      onSuccess();
    } catch (e) {
      console.error(e);
      alert("Failed to create " + type);
    } finally {
      setLoading(false);
    }
  };

  const title = type === 'space' ? 'Create Space' : type === 'folder' ? 'Create Folder' : 'Create List';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '420px', maxWidth: '90%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Name *</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder={`Enter ${type} name`}
              required
              autoFocus
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Optional details..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', minHeight: '60px', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          {(type === 'folder' || type === 'space') && allUsers.length > 0 && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                <User size={14} /> Assign Employees
              </label>
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '8px', backgroundColor: '#F9FAFB' }}>
                {allUsers.map(user => (
                  <label key={user.uid} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={assignees.includes(user.uid)}
                      onChange={(e) => {
                        if (e.target.checked) setAssignees([...assignees, user.uid]);
                        else setAssignees(assignees.filter(id => id !== user.uid));
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: '#111827' }}>{user.displayName || user.email}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '8px 16px', backgroundColor: '#4F46E5', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500, color: 'white', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating...' : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
