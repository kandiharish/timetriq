import React from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../services/taskService';
import { Star, Clock } from 'lucide-react';
import { SAMPLE_TEAM_MEMBERS } from '../services/taskService';

// Kanban Card Component
const KanbanCard = ({ task, onClick, onToggleStar, isOverlay = false }: { task: Task, onClick: () => void, onToggleStar: (id: string) => void, isOverlay?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const prioColors = {
    Low: { bg: '#D1FAE5', text: '#059669' },
    Medium: { bg: '#FEF3C7', text: '#D97706' },
    High: { bg: '#FEE2E2', text: '#DC2626' },
    Critical: { bg: '#FECACA', text: '#991B1B' },
  }[task.priority] || { bg: '#F3F4F6', text: '#374151' };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: isOverlay ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
        border: '1px solid #E5E7EB',
        marginBottom: '8px',
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ backgroundColor: prioColors.bg, color: prioColors.text, padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>
          {task.priority}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(task.id); }}
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking star
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: task.isStarred ? '#F59E0B' : '#C4C9D4' }}
        >
          <Star size={14} fill={task.isStarred ? '#F59E0B' : 'none'} />
        </button>
      </div>

      <div onClick={onClick} onPointerDown={(e) => e.stopPropagation()} style={{ cursor: 'pointer', fontWeight: 600, color: '#111827', fontSize: '0.8125rem', marginBottom: '6px', lineHeight: 1.4 }}>
        {task.title}
      </div>

      {task.dueDate && (
        <div style={{ fontSize: '0.7rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
          <Clock size={12} /> {task.dueDate}
        </div>
      )}

      {/* Assignees */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {(() => {
          const allIds = (task.assignees && task.assignees.length > 0) ? task.assignees : (task.assignedUserId ? [task.assignedUserId] : []);
          if (allIds.length === 0) return null;
          return (
            <div style={{ display: 'flex', gap: '-4px' }}>
              {allIds.slice(0, 3).map((id, i) => {
                const m = SAMPLE_TEAM_MEMBERS.find(x => x.id === id) || { color: '#9CA3AF', initials: id.substring(0,2).toUpperCase() };
                return (
                  <div key={id} style={{
                    width: '20px', height: '20px', borderRadius: '50%', backgroundColor: m.color, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700,
                    border: '2px solid white', zIndex: 3 - i, position: 'relative', marginLeft: i > 0 ? '-6px' : 0
                  }}>
                    {m.initials}
                  </div>
                )
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// Kanban Column Component
import { useDroppable } from '@dnd-kit/core';

const KanbanColumn = ({ status, tasks, onClickTask, onToggleStar }: { status: string, tasks: Task[], onClickTask: (task: Task) => void, onToggleStar: (id: string) => void }) => {
  const { setNodeRef } = useDroppable({
    id: status,
    data: { type: 'Column', status }
  });

  return (
    <div style={{
      flex: '1 1 250px',
      minWidth: '250px',
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', margin: 0 }}>{status}</h3>
        <span style={{ fontSize: '0.75rem', color: '#6B7280', backgroundColor: '#E5E7EB', padding: '2px 6px', borderRadius: '12px' }}>{tasks.length}</span>
      </div>

      <div ref={setNodeRef} style={{ flex: 1, minHeight: '150px' }}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard key={task.id} task={task} onClick={() => onClickTask(task)} onToggleStar={onToggleStar} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

// Main Board Component
interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
  onClickTask: (task: Task) => void;
  onToggleStar: (id: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskStatusChange, onClickTask, onToggleStar }) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const COLUMNS = ['Todo', 'In Progress', 'Review', 'Blocked', 'Completed'];

  const handleDragStart = (event: any) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: any) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';
    const isOverTask = over.data.current?.type === 'Task';

    if (isActiveTask) {
      let newStatus = '';
      if (isOverColumn) {
        newStatus = overId;
      } else if (isOverTask) {
        newStatus = over.data.current.task.status;
      }
      
      const task = tasks.find(t => t.id === activeId);
      if (task && newStatus && task.status !== newStatus) {
        onTaskStatusChange(activeId, newStatus);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', alignItems: 'flex-start', minHeight: '600px' }}>
        {COLUMNS.map(status => (
          <KanbanColumn 
            key={status} 
            status={status} 
            tasks={tasks.filter(t => t.status === status)} 
            onClickTask={onClickTask} 
            onToggleStar={onToggleStar} 
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} onClick={() => {}} onToggleStar={() => {}} isOverlay={true} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
