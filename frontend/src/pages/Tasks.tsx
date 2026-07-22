import React, { useEffect, useState } from 'react';
import { taskService, type Task } from '../services/taskService';
import { timeService } from '../services/timeService';
import { TaskForm } from '../components/TaskForm';
import { GripVertical, Search, CheckCircle2, Circle, Clock, Calendar as CalendarIcon, X, Plus, Trash2, Check, Play, Pause, XCircle, Target } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { formatHoursCompact, parseEstimatedTime, formatHours } from '../lib/utils';

interface SortableRowProps {
  task: Task;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onLogTime: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (task: Task) => void;
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
  onTimeLogged: () => void;
  isOverdue: boolean;
  onStartFocus: (task: Task) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({ task, isSelected, onToggleSelect, onLogTime, onDelete, onViewDetails, onStatusChange, onTimeLogged, isOverdue, onStartFocus }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  
  const { timers, startTimer, pauseTimer, stopTimer, cancelTimer, getLiveElapsedSeconds } = useTimer();
  const taskTimer = timers[task.id];
  const isRunning = taskTimer && taskTimer.startTime !== null;
  const isPaused = taskTimer && taskTimer.startTime === null;
  const elapsed = getLiveElapsedSeconds(task.id);

  const formatTimerDisplay = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  };
  
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
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: statusColors.bg,
            color: statusColors.text,
            padding: '3px 16px 3px 8px',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: 600,
            border: '1px solid transparent',
            cursor: 'pointer',
            outline: 'none',
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(statusColors.text)}' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center',
            appearance: 'none',
            WebkitAppearance: 'none',
            minWidth: '95px',
            textAlign: 'left'
          }}
        >
          <option value="Todo" style={{ backgroundColor: 'white', color: '#374151' }}>Todo</option>
          <option value="In Progress" style={{ backgroundColor: 'white', color: '#2563EB' }}>In Progress</option>
          <option value="Review" style={{ backgroundColor: 'white', color: '#D97706' }}>Review</option>
          <option value="Completed" style={{ backgroundColor: 'white', color: '#059669' }}>Completed</option>
          <option value="Blocked" style={{ backgroundColor: 'white', color: '#DC2626' }}>Blocked</option>
        </select>
      </td>
      <td style={{ padding: '8px 0', color: '#4B5563', fontSize: '0.8125rem' }}>{formatHoursCompact(task.estimatedHours)}</td>
      <td style={{ padding: '8px 0', color: '#4B5563', fontSize: '0.8125rem' }}>{formatHoursCompact(actualHours)}</td>
      <td style={{ padding: '8px 0', color: '#4B5563', fontSize: '0.8125rem' }}>{formatHoursCompact(remaining)}</td>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
          {/* Active / Paused Ticker */}
          {(isRunning || isPaused) && (
            <span style={{ 
              fontSize: '0.65rem', 
              fontFamily: 'monospace', 
              fontWeight: 700, 
              color: isRunning ? '#DC2626' : '#4B5563',
              backgroundColor: isRunning ? '#FEF2F2' : '#F3F4F6',
              padding: '2px 6px',
              borderRadius: '4px',
              border: isRunning ? '1px solid #FECACA' : '1px solid #E5E7EB',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isRunning && <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#DC2626', animation: 'pulse 1.5s infinite' }}></span>}
              {formatTimerDisplay(elapsed)}
            </span>
          )}

          {/* Timer controls */}
          {!taskTimer && (
            <button 
              onClick={() => startTimer(task.id, task.title)} 
              title="Start Timer" 
              className="btn-paper-icon"
            >
              <Play size={12} color="#4F46E5" />
            </button>
          )}

          {isRunning && (
            <button 
              onClick={() => pauseTimer(task.id)} 
              title="Pause Timer" 
              className="btn-paper-icon"
            >
              <Pause size={12} color="#D97706" />
            </button>
          )}

          {isPaused && (
            <button 
              onClick={() => startTimer(task.id, task.title)} 
              title="Resume Timer" 
              className="btn-paper-icon"
            >
              <Play size={12} color="#10B981" />
            </button>
          )}

          {(isRunning || isPaused) && (
            <>
              <button 
                onClick={async () => {
                  await stopTimer(task.id);
                  onTimeLogged();
                }} 
                title="Save & Log Time" 
                className="btn-paper-icon"
              >
                <CheckCircle2 size={12} color="#10B981" />
              </button>
              <button 
                onClick={() => cancelTimer(task.id)} 
                title="Cancel Timer" 
                className="btn-paper-icon"
              >
                <XCircle size={12} color="#EF4444" />
              </button>
            </>
          )}

          {/* Log Manual Time */}
          <button 
            onClick={() => onLogTime(task.id)} 
            title="Log Time Manually" 
            className="btn-paper-icon"
          >
            <Plus size={12} color="#4B5563" />
          </button>

          {/* Target Focus */}
          <button 
            onClick={() => onStartFocus(task)} 
            title="Start Focus Sprint" 
            className="btn-paper-icon"
          >
            <Target size={12} color="#DC2626" />
          </button>

          {/* Delete Task */}
          <button 
            onClick={() => onDelete(task.id)} 
            title="Delete Task" 
            className="btn-paper-icon"
          >
            <Trash2 size={12} color="#EF4444" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const Tasks: React.FC = () => {
  const { timers, focusSession, startFocus, pauseFocus, stopFocus, resetFocus } = useTimer();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeDetailsTask, setActiveDetailsTask] = useState<Task | null>(null);
  
  // State for the editable modal to allow typing without instant API calls blocking
  const [modalDraft, setModalDraft] = useState<Task | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ 
    message: string; 
    onConfirm: () => void; 
    confirmText?: string;
    cancelText?: string;
  } | null>(null);
  const [logTimeTaskId, setLogTimeTaskId] = useState<string | null>(null);
  const [manualTimeInput, setManualTimeInput] = useState('');
  const [manualSuggestion, setManualSuggestion] = useState<{ hours: number; text: string } | null>(null);

  useEffect(() => {
    setManualTimeInput('');
    setManualSuggestion(null);
  }, [logTimeTaskId]);

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const [modalEstTimeInput, setModalEstTimeInput] = useState('');
  const [modalSuggestion, setModalSuggestion] = useState<{ hours: number; text: string } | null>(null);

  useEffect(() => {
    if (activeDetailsTask) {
      setModalDraft(activeDetailsTask);
      setModalEstTimeInput(activeDetailsTask.estimatedHours ? formatHours(activeDetailsTask.estimatedHours) : '');
      setModalSuggestion(null);
    } else {
      setModalDraft(null);
      setModalEstTimeInput('');
      setModalSuggestion(null);
    }
  }, [activeDetailsTask]);

  const handleModalEstTimeChange = (value: string) => {
    setModalEstTimeInput(value);
    
    const { hours, needsClarification } = parseEstimatedTime(value);
    if (needsClarification && value.trim()) {
      const parsedInt = parseInt(value.trim(), 10);
      if (!isNaN(parsedInt)) {
        setModalSuggestion({
          hours: parsedInt,
          text: `Did you mean ${parsedInt} hours or ${parsedInt} minutes?`
        });
      } else {
        setModalSuggestion(null);
      }
    } else {
      setModalSuggestion(null);
      if (modalDraft) {
        setModalDraft({
          ...modalDraft,
          estimatedHours: hours
        });
      }
    }
  };

  const handleModalEstTimeBlur = () => {
    if (modalSuggestion) {
      const hours = modalSuggestion.hours;
      setModalEstTimeInput(`${hours} hours`);
      setModalSuggestion(null);
      handleModalSave('estimatedHours', hours);
    } else {
      const { hours } = parseEstimatedTime(modalEstTimeInput);
      setModalEstTimeInput(hours > 0 ? formatHours(hours) : '');
      handleModalSave('estimatedHours', hours);
    }
  };

  const handleManualTimeChange = (value: string) => {
    setManualTimeInput(value);
    
    const { needsClarification } = parseEstimatedTime(value);
    if (needsClarification && value.trim()) {
      const parsedInt = parseInt(value.trim(), 10);
      if (!isNaN(parsedInt)) {
        setManualSuggestion({
          hours: parsedInt,
          text: `Did you mean ${parsedInt} hours or ${parsedInt} minutes?`
        });
      } else {
        setManualSuggestion(null);
      }
    } else {
      setManualSuggestion(null);
    }
  };

  const handleManualTimeBlur = () => {
    if (manualSuggestion) {
      const hours = manualSuggestion.hours;
      setManualTimeInput(`${hours} hours`);
      setManualSuggestion(null);
    } else {
      const { hours } = parseEstimatedTime(manualTimeInput);
      setManualTimeInput(hours > 0 ? formatHours(hours) : '');
    }
  };

  const handleModalSave = async (field: keyof Task, value: any) => {
    if (!modalDraft) return;

    if (field === 'status' && value === 'Completed') {
      const actualHours = modalDraft.actualHours || 0;
      if (actualHours <= 0) {
        showToast("Cannot mark task as Completed without logging hours first!", 'error');
        // Revert status state in modalDraft
        setModalDraft(prev => prev ? { ...prev, status: activeDetailsTask?.status || 'Todo' } : null);
        return;
      }
    }

    const updated = { ...modalDraft, [field]: value };
    setModalDraft(updated);
    
    // Auto-save to backend
    try {
      const savedTask = await taskService.updateTask(updated.id, updated as any);
      setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
      // Update the underlying task so it stays in sync
      setActiveDetailsTask(savedTask);
    } catch(e: any) {
      showToast(e.message || "Auto-save failed", 'error');
      // Revert modalDraft
      setModalDraft(activeDetailsTask);
    }
  };

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');

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
  
  const handleStatusChange = async (id: string, newStatus: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (newStatus === 'Completed' && (!task.actualHours || task.actualHours <= 0)) {
      showToast("Cannot mark task as Completed without logging hours first!", 'error');
      return;
    }

    try {
      const updatedTask = await taskService.updateTask(id, {
        ...task,
        status: newStatus
      });
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      showToast("Status updated successfully", 'success');
    } catch (e: any) {
      showToast(e.message || "Failed to update status", 'error');
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await taskService.deleteTask(id);
          setTasks(prev => prev.filter(t => t.id !== id));
          showToast('Task deleted successfully', 'success');
        } catch (err) {
          showToast('Failed to delete task', 'error');
        }
      }
    });
  };

  const handleBulkComplete = async () => {
    const invalidTasks = selectedTaskIds
      .map(id => tasks.find(t => t.id === id))
      .filter(task => task && (!task.actualHours || task.actualHours <= 0));

    if (invalidTasks.length > 0) {
      showToast(`Cannot mark ${invalidTasks.length} task(s) as Completed because they have no logged hours. Please log hours first.`, 'error');
      return;
    }

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
      showToast("Selected tasks marked as Completed", 'success');
    } catch (e: any) {
      showToast(e.message || "Bulk complete failed", 'error');
    }
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      message: `Are you sure you want to delete the ${selectedTaskIds.length} selected task(s)? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await Promise.all(selectedTaskIds.map(id => taskService.deleteTask(id)));
          setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
          setSelectedTaskIds([]);
          showToast('Selected tasks deleted successfully', 'success');
        } catch (e) {
          showToast('Failed to delete some tasks', 'error');
        }
      }
    });
  };

  const handleStartFocusSprint = (task: Task) => {
    const focusDuration = Number(localStorage.getItem('timetriq_focus_duration') || '25');
    startFocus(task.id, task.title, focusDuration);
    showToast(`Started Focus Sprint for "${task.title}"`, 'success');
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
          className="btn-paper btn-paper-primary"
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
                        onLogTime={setLogTimeTaskId}
                        onDelete={handleDelete}
                        onViewDetails={setActiveDetailsTask}
                        onStatusChange={handleStatusChange}
                        onTimeLogged={fetchTasks}
                        isOverdue={task.dueDate < today && task.status !== 'Completed'}
                        onStartFocus={handleStartFocusSprint}
                      />
                    ))}
                    
                    {/* Inline Creation Row */}
                    <tr style={{ backgroundColor: '#F9FAFB' }}>
                      <td style={{ padding: '12px 8px 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px' }}></div>
                        <input type="checkbox" disabled style={{ opacity: 0.5 }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>+ Quick Add</span>
                      </td>
                      <td colSpan={9} style={{ padding: '12px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '4px 8px', backgroundColor: '#FFFFFF', width: '90%' }}>
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
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>Est. Time</div>
                <input 
                  type="text"
                  placeholder="e.g. 4h 34m"
                  value={modalEstTimeInput}
                  onChange={(e) => handleModalEstTimeChange(e.target.value)}
                  onBlur={handleModalEstTimeBlur}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none' }}
                />
                {modalSuggestion && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    padding: '8px 12px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    color: '#1E40AF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    zIndex: 50,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <span>{modalSuggestion.text}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const cleanVal = `${modalSuggestion.hours} hours`;
                          setModalEstTimeInput(cleanVal);
                          setModalSuggestion(null);
                          handleModalSave('estimatedHours', modalSuggestion.hours);
                        }}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        {modalSuggestion.hours} hrs
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const cleanVal = `${modalSuggestion.hours} minutes`;
                          setModalEstTimeInput(cleanVal);
                          const minsAsHours = parseFloat((modalSuggestion.hours / 60).toFixed(2));
                          setModalSuggestion(null);
                          handleModalSave('estimatedHours', minsAsHours);
                        }}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        {modalSuggestion.hours} mins
                      </button>
                    </div>
                  </div>
                )}
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

      {/* Custom Styles for slideIn Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}} />

      {/* In-App Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: toast.type === 'error' ? '#EF4444' : (toast.type === 'success' ? '#10B981' : '#3B82F6'),
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease-out',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}>
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {confirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(2px)',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E5E7EB',
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Confirm Action</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.875rem', color: '#4B5563', lineHeight: '1.5' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setConfirmDialog(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                }}
              >
                {confirmDialog.cancelText || 'Cancel'}
              </button>
              <button 
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                }}
              >
                {confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {logTimeTaskId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '400px',
            maxWidth: '90%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Log Time Manually</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8125rem', color: '#6B7280' }}>
              Logging time for: <strong>{tasks.find(t => t.id === logTimeTaskId)?.title}</strong>
            </p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const { hours } = parseEstimatedTime(manualTimeInput);
              if (hours <= 0) {
                showToast("Invalid time format (e.g. use 1.5, 2h, or 1h 30m).", "error");
                return;
              }
              
              const form = e.currentTarget;
              const notesVal = (form.elements.namedItem('notes') as HTMLInputElement).value;
              
              try {
                await timeService.createTimeEntry({
                  task_id: logTimeTaskId,
                  date: new Date().toISOString().split('T')[0],
                  hours_worked: hours,
                  notes: notesVal || 'Logged manually'
                });
                showToast("Time logged successfully!", "success");
                setLogTimeTaskId(null);
                fetchTasks();
              } catch (err: any) {
                showToast(err.message || "Failed to log time", "error");
              }
            }}>
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Time Spent</label>
                <input 
                  required 
                  type="text" 
                  name="time" 
                  placeholder="e.g. 1.5, 2h 30m, 45m" 
                  value={manualTimeInput}
                  onChange={(e) => handleManualTimeChange(e.target.value)}
                  onBlur={handleManualTimeBlur}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none' }} 
                />
                
                {manualSuggestion && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    padding: '8px 12px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    color: '#1E40AF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    zIndex: 50,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <span>{manualSuggestion.text}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const val = `${manualSuggestion.hours} hours`;
                          setManualTimeInput(val);
                          setManualSuggestion(null);
                        }}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#4F46E5',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        {manualSuggestion.hours} hrs
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const val = `${manualSuggestion.hours} minutes`;
                          setManualTimeInput(val);
                          setManualSuggestion(null);
                        }}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        {manualSuggestion.hours} mins
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Notes</label>
                <input type="text" name="notes" placeholder="What did you do?" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setLogTimeTaskId(null)} className="btn-paper">Cancel</button>
                <button type="submit" className="btn-paper btn-paper-primary">Log Time</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {focusSession && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#38BDF8',
              backgroundColor: '#0369A1',
              padding: '4px 12px',
              borderRadius: '20px'
            }}>
              Focus Sprint Mode
            </span>
            
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              {focusSession.taskTitle}
            </h2>

            <div style={{
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              border: '8px solid #1E293B',
              borderTopColor: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.5rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              position: 'relative',
              boxShadow: '0 0 40px rgba(56, 189, 248, 0.1)'
            }}>
              <div style={{
                position: 'absolute',
                fontSize: '3.5rem',
                fontWeight: 700,
                color: '#F8FAFC',
                transform: 'none'
              }}>
                {Math.floor(focusSession.timeLeft / 60)}:{(focusSession.timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {focusSession.timeLeft === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                <div style={{ fontSize: '1rem', color: '#34D399', fontWeight: 600 }}>🎉 Sprint Session Finished!</div>
                <button
                  onClick={() => {
                    const loggedTimeVal = (focusSession.duration / 3600).toFixed(2);
                    setManualTimeInput(`${loggedTimeVal} hours`);
                    setLogTimeTaskId(focusSession.taskId);
                    stopFocus();
                  }}
                  className="btn-paper btn-paper-primary"
                  style={{ width: '100%', fontSize: '0.875rem', padding: '12px' }}
                >
                  Log Sprint Time Now
                </button>
                <button
                  onClick={stopFocus}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  Close Focus Mode
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                {focusSession.isRunning ? (
                  <button
                    onClick={pauseFocus}
                    className="btn-paper"
                    style={{ padding: '10px 24px', backgroundColor: '#F59E0B', color: '#111827', border: 'none' }}
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={resetFocus}
                    className="btn-paper btn-paper-primary"
                    style={{ padding: '10px 24px' }}
                  >
                    Resume
                  </button>
                )}
                
                <button
                  onClick={stopFocus}
                  className="btn-paper btn-paper-danger"
                  style={{ padding: '10px 24px' }}
                >
                  Quit Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
