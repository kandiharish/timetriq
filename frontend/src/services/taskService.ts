import { auth } from '../core/firebase';
// Force Vite HMR reload

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api/v1';

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assignedUserId: string;
  assignees?: string[];      // member IDs from SAMPLE_TEAM_MEMBERS
  assignedBy?: string;       // display name of user who created/assigned the task
  assignedByUid?: string;    // uid of user who created/assigned the task
  priority: string;
  estimatedHours: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  description?: string;
  status: string;
  actualHours?: number;
  order?: number;
  isStarred?: boolean;
  dependencies?: string[];
  isArchived?: boolean;
}

// Sample team members available for assignment
export const SAMPLE_TEAM_MEMBERS = [
  { id: 'harsh', name: 'Harsh Jain (Manager)', initials: 'HJ', color: '#7C3AED' },
  { id: 'sathyam',    name: 'Sathyam (Manager)',    initials: 'SA', color: '#059669' },
  { id: 'vishaka',   name: 'Vishaka (HR)',    initials: 'VS', color: '#DC2626' },
  { id: 'harish_kandi', name: 'Harish Kandi', initials: 'HK', color: '#2563EB' },
  { id: 'myself',    name: 'Myself',     initials: 'ME', color: '#2563EB' },
];

export interface TaskCreate {
  title: string;
  projectId: string;
  assignedUserId: string;
  assignees?: string[];
  assignedBy?: string;
  assignedByUid?: string;
  priority: string;
  estimatedHours: number;
  startDate: string;
  dueDate: string;
  description?: string;
  status?: string;
  order?: number;
  actualHours?: number;
  isStarred?: boolean;
  dependencies?: string[];
  isArchived?: boolean;
}

const getHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    // No auth, skip backend
    throw new Error('NETWORK_SKIP: User not authenticated');
  }
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};


// Store task to a shared localStorage key so assignees can see it
const persistTaskToAssignees = (task: Task) => {
  // Write to a global shared tasks store
  const sharedKey = 'timetriq_shared_tasks';
  const sharedTasks: Task[] = JSON.parse(localStorage.getItem(sharedKey) || '[]');
  const existingIdx = sharedTasks.findIndex(t => t.id === task.id);
  if (existingIdx !== -1) {
    sharedTasks[existingIdx] = task;
  } else {
    sharedTasks.push(task);
  }
  localStorage.setItem(sharedKey, JSON.stringify(sharedTasks));
};

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/`, { headers });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data: Task[] = await response.json();
      return data.filter(t => t.title && t.title.trim() !== '');
    } catch (e) {
      console.warn("Backend not available, using local storage.");
      const uid = auth.currentUser?.uid || 'guest';
      // Merge personal tasks + shared tasks assigned to this user
      const personalTasks: Task[] = JSON.parse(localStorage.getItem(`timetriq_tasks_${uid}`) || '[]');
      const sharedTasks: Task[] = JSON.parse(localStorage.getItem('timetriq_shared_tasks') || '[]');
      // Include shared tasks where this user is an assignee (by uid ownership) or created by this user
      const mySharedTasks = sharedTasks.filter(t => t.assignedByUid === uid || (t.assignees && t.assignees.length > 0));
      // Merge, deduplicate by id
      const allIds = new Set(personalTasks.map(t => t.id));
      const merged = [...personalTasks];
      for (const t of mySharedTasks) {
        if (!allIds.has(t.id)) merged.push(t);
      }
      return merged.filter(t => t.title && t.title.trim() !== '');
    }
  },

  createTask: async (task: TaskCreate): Promise<Task> => {
    try {
      const headers = await getHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(task),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to create task');
      }
      return await response.json();
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      console.warn("Backend not available, saving to local storage.");
      if (task.status === 'Completed') {
        throw new Error('Cannot mark task as Completed without logging hours first.');
      }
      const uid = auth.currentUser?.uid || 'guest';
      const key = `timetriq_tasks_${uid}`;
      const tasks = JSON.parse(localStorage.getItem(key) || '[]');
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        status: task.status || 'Todo',
        actualHours: 0,
        assignedBy: task.assignedBy || auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown',
        assignedByUid: uid,
      };
      tasks.push(newTask);
      localStorage.setItem(key, JSON.stringify(tasks));
      // Also persist to shared store if there are assignees
      if (newTask.assignees && newTask.assignees.length > 0) {
        persistTaskToAssignees(newTask);
      }
      return newTask;
    }
  },

  deleteTask: async (id: string): Promise<void> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to delete task');
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      console.warn("Backend not available, deleting from local storage.");
      const uid = auth.currentUser?.uid || 'guest';
      const key = `timetriq_tasks_${uid}`;
      let tasks = JSON.parse(localStorage.getItem(key) || '[]');
      tasks = tasks.filter((t: any) => t.id !== id);
      localStorage.setItem(key, JSON.stringify(tasks));
      // Also remove from shared store
      const sharedKey = 'timetriq_shared_tasks';
      let shared: Task[] = JSON.parse(localStorage.getItem(sharedKey) || '[]');
      shared = shared.filter((t) => t.id !== id);
      localStorage.setItem(sharedKey, JSON.stringify(shared));
    }
  },

  toggleTaskStar: async (id: string): Promise<Task> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/star`, {
        method: 'POST',   // backend uses @router.post for this endpoint
        headers
      });
      if (!response.ok) {
        // Throw with status info so the catch block can handle gracefully
        throw new Error(`HTTP_${response.status}`);
      }
      return await response.json();
    } catch (e: any) {
      // Fall back to localStorage silently for network/auth/4xx issues
      const msg = e?.message || '';
      if (!msg.includes('HTTP_404') && !msg.includes('HTTP_405') && !msg.includes('Task not found')) {
        console.warn('Star toggle: falling back to local storage.', msg);
      }
      const uid = auth.currentUser?.uid || 'guest';
      const key = `timetriq_tasks_${uid}`;
      let tasks: Task[] = JSON.parse(localStorage.getItem(key) || '[]');
      const index = tasks.findIndex((t: Task) => t.id === id);

      if (index !== -1) {
        tasks[index] = { ...tasks[index], isStarred: !tasks[index].isStarred };
        localStorage.setItem(key, JSON.stringify(tasks));
        // Also sync to shared store if needed
        const sharedKey = 'timetriq_shared_tasks';
        const shared: Task[] = JSON.parse(localStorage.getItem(sharedKey) || '[]');
        const si = shared.findIndex(t => t.id === id);
        if (si !== -1) {
          shared[si] = { ...shared[si], isStarred: tasks[index].isStarred };
          localStorage.setItem(sharedKey, JSON.stringify(shared));
        }
        return tasks[index];
      }

      // Try shared store
      const sharedKey = 'timetriq_shared_tasks';
      const sharedTasks: Task[] = JSON.parse(localStorage.getItem(sharedKey) || '[]');
      const si = sharedTasks.findIndex(t => t.id === id);
      if (si !== -1) {
        sharedTasks[si] = { ...sharedTasks[si], isStarred: !sharedTasks[si].isStarred };
        localStorage.setItem(sharedKey, JSON.stringify(sharedTasks));
        return sharedTasks[si];
      }

      // Task not found in any store — build a minimal stub that correctly toggles
      // by reading the current tasks from localStorage and flipping its star state
      const allTasks: Task[] = [
        ...JSON.parse(localStorage.getItem(`timetriq_tasks_${auth.currentUser?.uid || 'guest'}`) || '[]'),
        ...JSON.parse(localStorage.getItem('timetriq_shared_tasks') || '[]')
      ];
      const existing = allTasks.find(t => t.id === id);
      return { id, isStarred: existing ? !existing.isStarred : false } as Task;
    }
  },

  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    try {
      const headers = await getHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(task),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to update task');
      }
      return await response.json();
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      console.warn("Backend not available, updating in local storage.");
      const uid = auth.currentUser?.uid || 'guest';
      const key = `timetriq_tasks_${uid}`;
      let tasks = JSON.parse(localStorage.getItem(key) || '[]');
      const index = tasks.findIndex((t: any) => t.id === id);
      if (index !== -1) {
        const existingTask = tasks[index];
        const newStatus = task.status;
        const actualHours = existingTask.actualHours || 0;
        if (newStatus === 'Completed' && actualHours <= 0) {
          throw new Error('Cannot mark task as Completed without logging hours first!');
        }
        
        // Remove actualHours from the incoming task payload so we don't overwrite the existing one
        const { actualHours: _, ...taskUpdates } = task as any;
        
        tasks[index] = { ...existingTask, ...taskUpdates };
        localStorage.setItem(key, JSON.stringify(tasks));
        // Sync to shared store
        const sharedKey = 'timetriq_shared_tasks';
        const shared: Task[] = JSON.parse(localStorage.getItem(sharedKey) || '[]');
        const si = shared.findIndex(t => t.id === id);
        if (si !== -1) {
          shared[si] = { ...shared[si], ...taskUpdates };
          localStorage.setItem(sharedKey, JSON.stringify(shared));
        } else if (tasks[index].assignees && tasks[index].assignees.length > 0) {
          persistTaskToAssignees(tasks[index]);
        }
        return tasks[index];
      } else {
        const sharedKey = 'timetriq_shared_tasks';
        const sharedTasks = JSON.parse(localStorage.getItem(sharedKey) || '[]');
        const sharedIndex = sharedTasks.findIndex((t: Task) => t.id === id);
        if (sharedIndex !== -1) {
          const existingTask = sharedTasks[sharedIndex];
          const newStatus = task.status;
          const actualHours = existingTask.actualHours || 0;
          if (newStatus === 'Completed' && actualHours <= 0) {
            throw new Error('Cannot mark task as Completed without logging hours first!');
          }
          const { actualHours: _, ...taskUpdates } = task as any;
          sharedTasks[sharedIndex] = { ...existingTask, ...taskUpdates };
          localStorage.setItem(sharedKey, JSON.stringify(sharedTasks));
          // Also update personal task store if present
          const pt: Task[] = JSON.parse(localStorage.getItem(key) || '[]');
          const pi = pt.findIndex(t => t.id === id);
          if (pi !== -1) {
            pt[pi] = { ...pt[pi], ...taskUpdates };
            localStorage.setItem(key, JSON.stringify(pt));
          }
          return sharedTasks[sharedIndex];
        }
      }
      throw new Error('Task not found in local storage');
    }
  }
};

