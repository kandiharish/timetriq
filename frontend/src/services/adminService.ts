import { auth } from '../core/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const token = await user.getIdToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API request failed');
  }

  return response.json();
}

export const adminService = {
  getUsers: async (): Promise<any[]> => {
    return fetchWithAuth(`${API_URL}/admin/users`);
  },
  nagTimesheets: async (): Promise<any> => {
    return fetchWithAuth(`${API_URL}/admin/timesheets/nag`, { method: 'POST' });
  }
};
