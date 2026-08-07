import React, { useState, useEffect } from 'react';
import { checklistService, type ChecklistItem } from '../../services/checklistService';
import { CheckSquare, Square, Trash2, GripVertical, Plus } from 'lucide-react';

interface TaskChecklistProps {
  taskId: string;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({ taskId }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null);

  useEffect(() => {
    loadItems();
  }, [taskId]);

  const loadItems = async () => {
    setLoading(true);
    const fetchedItems = await checklistService.getChecklistItems(taskId);
    setItems(fetchedItems.sort((a, b) => a.order - b.order));
    setLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    
    const title = newItemTitle.trim();
    setNewItemTitle('');
    
    const newOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) + 1 : 0;
    
    // Optimistic UI update
    const tempId = 'temp_' + Date.now();
    const tempItem: ChecklistItem = {
      id: tempId,
      taskId,
      title,
      completed: false,
      order: newOrder,
      createdBy: 'me',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setItems([...items, tempItem]);
    
    const addedItem = await checklistService.addChecklistItem(taskId, title, newOrder);
    setItems(prev => prev.map(i => i.id === tempId ? addedItem : i));
  };

  const toggleComplete = async (item: ChecklistItem) => {
    const updatedStatus = !item.completed;
    
    // Optimistic update
    setItems(items.map(i => i.id === item.id ? { ...i, completed: updatedStatus } : i));
    
    if (!item.id.startsWith('temp_')) {
      await checklistService.updateChecklistItem(item.id, taskId, { completed: updatedStatus });
    }
  };

  const handleDelete = async (id: string) => {
    setItems(items.filter(i => i.id !== id));
    if (!id.startsWith('temp_')) {
      await checklistService.deleteChecklistItem(id, taskId);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox
    e.dataTransfer.setData('text/plain', 'dummy');
  };

  const handleDragOver = (index: number) => {
    if (draggedItemIdx === null || draggedItemIdx === index) return;
    
    const newItems = [...items];
    const draggedItem = newItems[draggedItemIdx];
    
    newItems.splice(draggedItemIdx, 1);
    newItems.splice(index, 0, draggedItem);
    
    setDraggedItemIdx(index);
    setItems(newItems);
  };

  const handleDragEnd = async () => {
    setDraggedItemIdx(null);
    // Update order in DB
    const updatedItems = items.map((item, idx) => ({ ...item, order: idx }));
    setItems(updatedItems);
    await checklistService.reorderItems(taskId, updatedItems);
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  if (loading) {
    return <div style={{ fontSize: '0.875rem', color: '#6B7280', padding: '16px 0' }}>Loading checklist...</div>;
  }

  return (
    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', margin: 0 }}>Checklist</h3>
        {totalCount > 0 && (
          <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
            {completedCount} / {totalCount} ({progressPercent}%)
          </span>
        )}
      </div>

      {totalCount > 0 && (
        <div style={{ width: '100%', height: '6px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
          <div 
            style={{ 
              height: '100%', 
              backgroundColor: progressPercent === 100 ? '#10B981' : '#4F46E5', 
              width: `${progressPercent}%`,
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }} 
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {items.map((item, index) => (
          <div 
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={() => handleDragOver(index)}
            onDragEnd={handleDragEnd}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '8px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              opacity: draggedItemIdx === index ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            <div style={{ cursor: 'grab', color: '#D1D5DB', display: 'flex' }}>
              <GripVertical size={16} />
            </div>
            
            <button 
              type="button"
              onClick={() => toggleComplete(item)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: item.completed ? '#10B981' : '#9CA3AF' }}
            >
              {item.completed ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
            
            <span style={{ 
              flex: 1, 
              fontSize: '0.875rem', 
              color: item.completed ? '#9CA3AF' : '#111827',
              textDecoration: item.completed ? 'line-through' : 'none',
              transition: 'all 0.2s'
            }}>
              {item.title}
            </span>
            
            <button 
              type="button"
              onClick={() => handleDelete(item.id)}
              style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#EF4444', opacity: 0.7 }}
              title="Delete item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Add an item"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
        <button 
          type="submit"
          disabled={!newItemTitle.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 12px',
            backgroundColor: newItemTitle.trim() ? '#4F46E5' : '#F3F4F6',
            color: newItemTitle.trim() ? 'white' : '#9CA3AF',
            border: 'none',
            borderRadius: '6px',
            cursor: newItemTitle.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
};
