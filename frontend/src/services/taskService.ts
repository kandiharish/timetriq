import { auth } from '../core/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assignedUserId: string;
  priority: string;
  estimatedHours: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  description?: string;
  status: string;
  actualHours?: number;
  order?: number;
}

export interface TaskCreate {
  title: string;
  projectId: string;
  assignedUserId: string;
  priority: string;
  estimatedHours: number;
  startDate: string;
  dueDate: string;
  description?: string;
  status?: string;
  order?: number;
}

const getHeaders = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
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
      console.warn("Backend not available, using personal local storage.");
      const data: Task[] = JSON.parse(localStorage.getItem('timetriq_tasks') || '[]');
      return data.filter(t => t.title && t.title.trim() !== '');
    }
  },

  createTask: async (task: TaskCreate): Promise<Task> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(task)
      });
      if (!response.ok) throw new Error('Failed to create task');
      return await response.json();
    } catch (e) {
      console.warn("Backend not available, saving to personal local storage.");
      const tasks = JSON.parse(localStorage.getItem('timetriq_tasks') || '[]');
      const newTask: Task = { ...task, id: Date.now().toString(), status: task.status || 'Todo' };
      tasks.push(newTask);
      localStorage.setItem('timetriq_tasks', JSON.stringify(tasks));
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
      if (!response.ok) throw new Error('Failed to delete task');
    } catch (e) {
      console.warn("Backend not available, deleting from personal local storage.");
      let tasks = JSON.parse(localStorage.getItem('timetriq_tasks') || '[]');
      tasks = tasks.filter((t: any) => t.id !== id);
      localStorage.setItem('timetriq_tasks', JSON.stringify(tasks));
    }
  },

  updateTask: async (id: string, task: TaskCreate): Promise<Task> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(task)
      });
      if (!response.ok) throw new Error('Failed to update task');
      return await response.json();
    } catch (e) {
      console.warn("Backend not available, updating in personal local storage.");
      let tasks = JSON.parse(localStorage.getItem('timetriq_tasks') || '[]');
      const index = tasks.findIndex((t: any) => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...task };
        localStorage.setItem('timetriq_tasks', JSON.stringify(tasks));
        return tasks[index];
      }
      throw new Error('Task not found in local storage');
    }
  }
};
