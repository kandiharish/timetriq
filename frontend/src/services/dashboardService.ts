import { auth } from '../core/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface OverBudgetTask {
  task_id: string;
  task_name: string;
  variance: number;
}

export interface DashboardMetrics {
  active_tasks: number;
  completed_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  weekly_capacity: number;
  variance: number;
  over_budget_tasks: OverBudgetTask[];
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

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/dashboard/`, { headers });
      if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
      return await response.json();
    } catch (error) {
      console.warn("Backend not available, using personal mock data fallback.", error);
      return {
        active_tasks: 5,
        completed_tasks: 12,
        total_estimated_hours: 35,
        total_actual_hours: 28,
        weekly_capacity: 40,
        variance: -7,
        over_budget_tasks: [
          { task_id: '1', task_name: 'UI Redesign', variance: 2 },
          { task_id: '2', task_name: 'Database Migration', variance: 5 }
        ]
      };
    }
  }
};
