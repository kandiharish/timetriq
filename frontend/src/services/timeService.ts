import { auth } from '../core/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface TimeEntry {
  id: string;
  task_id: string;
  date: string;
  hours_worked: number;
  notes?: string;
}

export interface TimeEntryCreate {
  task_id: string;
  date: string;
  hours_worked: number;
  notes?: string;
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
      return JSON.parse(localStorage.getItem('timetriq_time_entries') || '[]');
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
      const entries = JSON.parse(localStorage.getItem('timetriq_time_entries') || '[]');
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
      const entries = JSON.parse(localStorage.getItem('timetriq_time_entries') || '[]');
      const newEntry = { ...entry, id: Date.now().toString() };
      entries.push(newEntry);
      localStorage.setItem('timetriq_time_entries', JSON.stringify(entries));
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
      let entries = JSON.parse(localStorage.getItem('timetriq_time_entries') || '[]');
      entries = entries.filter((e: any) => e.id !== id);
      localStorage.setItem('timetriq_time_entries', JSON.stringify(entries));
    }
  }
};
