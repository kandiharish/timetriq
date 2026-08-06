import { auth } from '../core/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api/v1';

export interface TimeEntry {
  id: string;
  task_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  hours_worked: number;
  notes?: string;
  tags?: string;
}

export interface TimeEntryCreate {
  task_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  hours_worked: number;
  notes?: string;
  tags?: string;
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

export const timeService = {
  getAllTimeEntries: async (): Promise<TimeEntry[]> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/time-entries/`, { headers });
      if (!response.ok) throw new Error('Failed to fetch all time entries');
      return await response.json();
    } catch (e) {
      console.warn("Backend not available, using personal local storage for time entries.");
      const uid = auth.currentUser?.uid || 'guest';
      return JSON.parse(localStorage.getItem(`timetriq_time_entries_${uid}`) || '[]');
    }
  },

  getTimeEntries: async (taskId: string): Promise<TimeEntry[]> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/time-entries/task/${taskId}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch time entries');
      return await response.json();
    } catch (e) {
      console.warn("Backend not available, using personal local storage for time entries.");
      const uid = auth.currentUser?.uid || 'guest';
      const entries = JSON.parse(localStorage.getItem(`timetriq_time_entries_${uid}`) || '[]');
      return entries.filter((e: any) => e.task_id === taskId);
    }
  },

  createTimeEntry: async (entry: TimeEntryCreate): Promise<TimeEntry> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/time-entries/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(entry)
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to create time entry');
      }
      return await response.json();
    } catch (e) {
      console.warn("Backend not available, saving time entry to personal local storage.");
      const uid = auth.currentUser?.uid || 'guest';
      const entries = JSON.parse(localStorage.getItem(`timetriq_time_entries_${uid}`) || '[]');
      const newEntry = { ...entry, id: Date.now().toString() };
      entries.push(newEntry);
      localStorage.setItem(`timetriq_time_entries_${uid}`, JSON.stringify(entries));

      // Update actualHours in local storage task
      const tasks = JSON.parse(localStorage.getItem(`timetriq_tasks_${uid}`) || '[]');
      const updatedTasks = tasks.map((t: any) => {
        if (t.id === entry.task_id) {
          return { ...t, actualHours: (t.actualHours || 0) + entry.hours_worked };
        }
        return t;
      });
      localStorage.setItem(`timetriq_tasks_${uid}`, JSON.stringify(updatedTasks));

      // Update actualHours in shared tasks
      const sharedTasks = JSON.parse(localStorage.getItem('timetriq_shared_tasks') || '[]');
      const updatedSharedTasks = sharedTasks.map((t: any) => {
        if (t.id === entry.task_id) {
          return { ...t, actualHours: (t.actualHours || 0) + entry.hours_worked };
        }
        return t;
      });
      localStorage.setItem('timetriq_shared_tasks', JSON.stringify(updatedSharedTasks));

      return newEntry;
    }
  },

  deleteTimeEntry: async (id: string): Promise<void> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/time-entries/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) throw new Error('Failed to delete time entry');
    } catch (e) {
      console.warn("Backend not available, deleting time entry from personal local storage.");
      const uid = auth.currentUser?.uid || 'guest';
      let entries = JSON.parse(localStorage.getItem(`timetriq_time_entries_${uid}`) || '[]');
      const targetEntry = entries.find((e: any) => e.id === id);
      entries = entries.filter((e: any) => e.id !== id);
      localStorage.setItem(`timetriq_time_entries_${uid}`, JSON.stringify(entries));

      if (targetEntry) {
        const tasks = JSON.parse(localStorage.getItem(`timetriq_tasks_${uid}`) || '[]');
        const updatedTasks = tasks.map((t: any) => {
          if (t.id === targetEntry.task_id) {
            return { ...t, actualHours: Math.max(0, (t.actualHours || 0) - targetEntry.hours_worked) };
          }
          return t;
        });
        localStorage.setItem(`timetriq_tasks_${uid}`, JSON.stringify(updatedTasks));

        const sharedTasks = JSON.parse(localStorage.getItem('timetriq_shared_tasks') || '[]');
        const updatedSharedTasks = sharedTasks.map((t: any) => {
          if (t.id === targetEntry.task_id) {
            return { ...t, actualHours: Math.max(0, (t.actualHours || 0) - targetEntry.hours_worked) };
          }
          return t;
        });
        localStorage.setItem('timetriq_shared_tasks', JSON.stringify(updatedSharedTasks));
      }
    }
  }
};
