import React, { useEffect, useState, useRef } from 'react';
import { taskService, type Task } from '../services/taskService';
import { TaskForm } from '../components/TaskForm';
import { GripVertical, MoreVertical, Search, CheckCircle2, Circle, PlayCircle, Clock, Calendar as CalendarIcon, X, Plus, Trash2, Check } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableRowProps {
  task: Task;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onLogTime: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (task: Task) => void;
  isOverdue: boolean;
}

const SortableRow: React.FC<SortableRowProps> = ({ task, isSelected, onToggleSelect, onLogTime, onDelete, onViewDetails, isOverdue }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isSelected ? '#F3F4F6' : 'white',
    borderBottom: '1px solid #F3F4F6'
  };

  const actualHours = task.actualHours || 0;
  const remaining = Math.max(task.estimatedHours - actualHours, 0);
  const progress = task.estimatedHours > 0 ? Math.min(Math.round((actualHours / task.estimatedHours) * 100), 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return { bg: '#F3F4F6', text: '#374151' };
      case 'In Progress': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'Review': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Completed': return { bg: '#D1FAE5', text: '#059669' };
      case 'Blocked': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return { bg: '#D1FAE5', text: '#059669' };
      case 'Medium': return { bg: '#FEF3C7', text: '#D97706' };
      case 'High': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'Critical': return { bg: '#FECACA', text: '#991B1B' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const statusColors = getStatusColor(task.status);
  const prioColors = getPriorityColor(task.priority);
  const progColor = task.status === 'Completed' ? '#059669' : (task.status === 'In Progress' ? '#2563EB' : '#D1D5DB');

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={{ padding: '8px 0', width: '25%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div {...attributes} {...listeners} style={{ cursor: 'grab', marginTop: '2px' }} onClick={e => e.stopPropagation()}>
            <GripVertical size={14} color="#D1D5DB" />
          </div>
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            onClick={e => e.stopPropagation()}
            style={{ marginTop: '2px', cursor: 'pointer' }}
          />
          <div onClick={() => onViewDetails(task)} style={{ cursor: 'pointer' }}>
            <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.8125rem', marginBottom: '2px' }}>{task.title}</div>
            {task.description && <div style={{ fontSize: '0.7rem', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{task.description}</div>}
          </div>
        </div>
      </td>
      <td style={{ padding: '8px 0' }}>
        <span style={{ backgroundColor: prioColors.bg, color: prioColors.text, padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
          {task.priority}
        </span>
      </td>
      <td style={{ padding: '8px 0' }}>
        <span style={{ backgroundColor: statusColors.bg, color: statusColors.text, padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
          {task.status}
        </span>
      </td>
      <td style={{ padding: '8px 0', color: '#4B5563', fontSize: '0.8125rem' }}>{task.estimatedHours}h</td>
      <td style={{ padding: '8px 0', color: '#4B5563', fontSize: '0.8125rem' }}>{actualHours.toFixed(1)}h</td>
      <td style={{ padding: '8px 0', color: '#4B5563', fontSize: '0.8125rem' }}>{remaining.toFixed(1)}h</td>
      <td style={{ padding: '8px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '4px', backgroundColor: '#F3F4F6', borderRadius: '2px', minWidth: '40px' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progColor, borderRadius: '2px' }}></div>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#6B7280', minWidth: '24px' }}>{progress}%</span>
        </div>
      </td>
      <td style={{ padding: '8px 0', color: isOverdue ? '#DC2626' : '#4B5563', fontSize: '0.8125rem' }}>
        {task.dueDate}
      </td>
      <td style={{ padding: '8px 0', color: '#6B7280', fontSize: '0.8125rem' }}>
        {task.startDate || '—'}
      </td>
      <td style={{ padding: '8px 0' }} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ padding: '2px', cursor: 'pointer', borderRadius: '4px', display: 'inline-flex' }}
          >
            <MoreVertical size={14} color="#6B7280" />
          </div>
          
          {showDropdown && (
            <div style={{ 
              position: 'absolute', right: 0, top: '100%', marginTop: '4px', 
              backgroundColor: 'white', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
              border: '1px solid var(--color-border)', minWidth: '140px', zIndex: 10 
            }}>
              <div 
                onClick={() => { setShowDropdown(false); onLogTime(task.id); }}
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: '#374151', borderBottom: '1px solid #F3F4F6' }}
              >
                <PlayCircle size={14} color="#4F46E5" /> Start Timer
              </div>
              <div 
                onClick={() => { setShowDropdown(false); onDelete(task.id); }}
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: '#DC2626' }}
              >
                <Trash2 size={14} color="#DC2626" /> Delete
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeDetailsTask, setActiveDetailsTask] = useState<Task | null>(null);
  
  // State for the editable modal to allow typing without instant API calls blocking
  const [modalDraft, setModalDraft] = useState<Task | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setShowForm(true);
      // Clean up the URL so refreshing doesn't keep opening it
      navigate('/tasks', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (activeDetailsTask) {
      setModalDraft(activeDetailsTask);
    } else {
      setModalDraft(null);
    }
  }, [activeDetailsTask]);

  const handleModalSave = async (field: keyof Task, value: any) => {
    if (!modalDraft) return;
    const updated = { ...modalDraft, [field]: value };
    setModalDraft(updated);
    
    // Auto-save to backend
    try {
      const savedTask = await taskService.updateTask(updated.id, updated as any);
      setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
      // Update the underlying task so it stays in sync
      setActiveDetailsTask(savedTask);
    } catch(e) {
      console.error("Auto-save failed", e);
    }
  };

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');
  
  const { startTimer } = useTimer();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let data = await taskService.getTasks();
      // Sort by order field
      data = data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setTasks(data);
    } catch (err: any) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over?.id);
      
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);
      
      // Update orders in backend (simple implementation: just update the moved task)
      // For a robust system, you'd batch update, but we'll do a basic update for now
      try {
        const taskToUpdate = newTasks[newIndex];
        await taskService.updateTask(taskToUpdate.id, {
          title: taskToUpdate.title,
          projectId: taskToUpdate.projectId,
          assignedUserId: taskToUpdate.assignedUserId,
          priority: taskToUpdate.priority,
          estimatedHours: taskToUpdate.estimatedHours,
          startDate: taskToUpdate.startDate,
          dueDate: taskToUpdate.dueDate,
          status: taskToUpdate.status,
          order: newIndex // Use index as new order
        });
      } catch (e) {
        console.error("Failed to update order");
      }
    }
  };

  const handleInlineSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inlineTaskTitle.trim()) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const newTask = await taskService.createTask({
          title: inlineTaskTitle.trim(),
          projectId: 'default',
          assignedUserId: 'self',
          priority: 'Medium',
          estimatedHours: 1,
          startDate: today,
          dueDate: today,
          status: 'Todo',
          order: tasks.length
        });
        setTasks(prev => [...prev, newTask]);
        setInlineTaskTitle('');
      } catch (err) {
        console.error("Failed to create inline task", err);
      }
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedTaskIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };
  
  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        setTasks(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  const handleBulkComplete = async () => {
    try {
      await Promise.all(selectedTaskIds.map(async id => {
        const task = tasks.find(t => t.id === id);
        if (task) {
          await taskService.updateTask(id, {
            ...task,
            status: 'Completed'
          });
        }
      }));
      setSelectedTaskIds([]);
      fetchTasks();
    } catch (e) {
      console.error("Bulk complete failed", e);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedTaskIds.length} tasks?`)) {
      try {
        await Promise.all(selectedTaskIds.map(id => taskService.deleteTask(id)));
        setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
        setSelectedTaskIds([]);
      } catch (e) {
        console.error("Bulk delete failed", e);
      }
    }
  };

  // Derived stats
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const todoCount = tasks.filter(t => t.status === 'Todo').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  
  const today = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(t => t.dueDate < today && t.status !== 'Completed').length;
  
  const totalEst = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const totalAct = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

  // Filtered Tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  const statCardStyle = { flex: 1, minWidth: '140px', backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', gap: '8px', alignItems: 'center' };

  if (loading && tasks.length === 0) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>Loading tasks...</div>;
  }

  return (
    <div style={{ padding: '0', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 4px 0', color: '#111827' }}>My Tasks</h1>
          <p style={{ color: '#6B7280', fontSize: '0.75rem', margin: 0 }}>Organize, plan, and track your work.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-primary)', 
            color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', 
            fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Plus size={14} /> New Task
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={statCardStyle}>
          <div style={{ backgroundColor: '#EEF2FF', padding: '6px', borderRadius: '6px', color: '#4F46E5' }}><CheckCircle2 size={16} /></div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>Total Tasks</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{totalTasks}</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ backgroundColor: '#EFF6FF', padding: '6px', borderRadius: '6px', color: '#3B82F6' }}><Circle size={16} /></div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>In Progress</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{inProgressCount}</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ backgroundColor: '#FFFBEB', padding: '6px', borderRadius: '6px', color: '#D97706' }}><Clock size={16} /></div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>To Do</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{todoCount}</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ backgroundColor: '#ECFDF5', padding: '6px', borderRadius: '6px', color: '#059669' }}><CheckCircle2 size={16} /></div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>Completed</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{completedCount}</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ backgroundColor: '#FEF2F2', padding: '6px', borderRadius: '6px', color: '#DC2626' }}><CalendarIcon size={16} /></div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>Overdue</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{overdueCount}</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ backgroundColor: '#F0FDF4', padding: '6px', borderRadius: '6px', color: '#0891B2' }}><Clock size={16} /></div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>Est. Hours</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{totalEst}h</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ backgroundColor: '#FAF5FF', padding: '6px', borderRadius: '6px', color: '#9333EA' }}><Clock size={16} /></div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>Log Hours</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{totalAct.toFixed(1)}h</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', width: '250px' }}>
            <Search size={16} color="#9CA3AF" style={{ marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search tasks by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.875rem', color: '#6B7280', marginRight: '8px' }}>Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '0.875rem', fontWeight: 500, backgroundColor: 'transparent', cursor: 'pointer' }}>
              <option value="All">All</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.875rem', color: '#6B7280', marginRight: '8px' }}>Priority:</span>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '0.875rem', fontWeight: 500, backgroundColor: 'transparent', cursor: 'pointer' }}>
              <option value="All">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All') && (
            <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#6B7280', fontSize: '0.875rem', cursor: 'pointer' }}>
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', paddingBottom: '60px' }}>
        <div style={{ overflowX: 'auto', padding: '0 24px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: '#6B7280', borderBottom: '1px solid var(--color-border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '14px' }}></div>
                    <input type="checkbox" checked={selectedTaskIds.length > 0 && selectedTaskIds.length === filteredTasks.length} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                    Task Title
                  </th>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}>Priority</th>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}>Est. Hours</th>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}>Logged Hours</th>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}>Remaining</th>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}>Progress</th>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}>Due Date</th>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}>Created</th>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}></th>
                </tr>
              </thead>
              <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr><td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No tasks found matching your filters.</td></tr>
                  ) : filteredTasks.map(task => (
                    <SortableRow 
                      key={task.id} 
                      task={task} 
                      isSelected={selectedTaskIds.includes(task.id)}
                      onToggleSelect={toggleSelect}
                      onLogTime={startTimer}
                      onDelete={handleDelete}
                      onViewDetails={setActiveDetailsTask}
                      isOverdue={task.dueDate < today && task.status !== 'Completed'}
                    />
                  ))}
                  
                  {/* Inline Creation Row */}
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    <td colSpan={10} style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '24px' }}>
                        <Plus size={14} color="#9CA3AF" />
                        <input 
                          type="text" 
                          placeholder="Type task title and press Enter to add..." 
                          value={inlineTaskTitle}
                          onChange={(e) => setInlineTaskTitle(e.target.value)}
                          onKeyDown={handleInlineSubmit}
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: '#111827', width: '100%' }}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedTaskIds.length > 0 && (
        <div style={{ 
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', 
          backgroundColor: '#111827', color: 'white', padding: '12px 24px', borderRadius: '100px',
          display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 100 
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selectedTaskIds.length} tasks selected</span>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#374151' }}></div>
          <button onClick={handleBulkComplete} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#D1FAE5', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
            <Check size={16} /> Mark Completed
          </button>
          <button onClick={handleBulkDelete} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#FECACA', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
            <Trash2 size={16} /> Delete
          </button>
          <button onClick={() => setSelectedTaskIds([])} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', marginLeft: '12px' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Task Creation Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '450px', maxWidth: '90%' }}>
            <TaskForm 
              onSuccess={() => { setShowForm(false); fetchTasks(); }} 
              onCancel={() => { setShowForm(false); }} 
            />
          </div>
        </div>
      )}

      {/* Task Auto-Save Modal */}
      {modalDraft && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '550px', maxWidth: '90%', padding: '32px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setActiveDetailsTask(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
            >
              <X size={20} />
            </button>
            
            <input 
              type="text" 
              value={modalDraft.title}
              onChange={(e) => setModalDraft({ ...modalDraft, title: e.target.value })}
              onBlur={(e) => handleModalSave('title', e.target.value)}
              style={{ width: '90%', margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: 700, color: '#111827', border: 'none', outline: 'none', background: 'transparent' }}
              placeholder="Task Title"
            />
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <select 
                value={modalDraft.status}
                onChange={(e) => handleModalSave('status', e.target.value)}
                style={{ backgroundColor: '#F3F4F6', color: '#374151', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600, border: 'none', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
                <option value="Blocked">Blocked</option>
              </select>

              <select 
                value={modalDraft.priority}
                onChange={(e) => handleModalSave('priority', e.target.value)}
                style={{ backgroundColor: '#F3F4F6', color: '#374151', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600, border: 'none', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0 0 8px 0', fontWeight: 600 }}>Description</h3>
              <textarea 
                value={modalDraft.description || ''}
                onChange={(e) => setModalDraft({ ...modalDraft, description: e.target.value })}
                onBlur={(e) => handleModalSave('description', e.target.value)}
                placeholder="Add a detailed description..."
                style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.875rem', color: '#374151', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>Est. Hours</div>
                <input 
                  type="number"
                  value={modalDraft.estimatedHours}
                  onChange={(e) => setModalDraft({ ...modalDraft, estimatedHours: parseFloat(e.target.value) || 0 })}
                  onBlur={(e) => handleModalSave('estimatedHours', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>Logged Hours</div>
                <div style={{ fontWeight: 600, color: '#111827', padding: '8px 0' }}>{(modalDraft.actualHours || 0).toFixed(1)}h</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>Start Date</div>
                <input 
                  type="date"
                  value={modalDraft.startDate}
                  onChange={(e) => handleModalSave('startDate', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>Due Date</div>
                <input 
                  type="date"
                  value={modalDraft.dueDate}
                  onChange={(e) => handleModalSave('dueDate', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={12} color="#10B981" /> All edits saved automatically
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
