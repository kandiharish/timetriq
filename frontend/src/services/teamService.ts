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

export interface MemberProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  color?: string;
  icon?: string;
  assignedSpaces?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: MemberProfile[];
}

export const teamService = {
  getTeams: async (): Promise<Team[]> => {
    try {
      const teams = await fetchWithAuth(`${API_URL}/teams`);
      
      // Inject Team Aaron mock data
      const mockMembers = [
        "Satyam Rathi", "Gagandeep Singh", "Harsh Jain", "Pratik Nilakhe", 
        "Mahadev Thawani", "Preet Khandelwal", "Trinath Kethavath", 
        "Shashank Channawar", "Harshvardhan Patil", "Rukaiya Rangoonwala", 
        "Harish Kandi", "Prem Duseja", "Palash Somani", "Tushar Gurnani", 
        "Tarun Ghumnani", "Manasvi More"
      ].map((name, i) => ({
        userId: `mock-user-${i}`,
        name,
        email: `${name.split(' ')[0].toLowerCase()}@example.com`,
        role: name === 'Satyam Rathi' ? 'Manager' : 'Employee',
        designation: 'Software Engineer'
      }));

      const teamAaron: Team = {
        id: 'team-aaron',
        name: 'Team Aaron',
        description: 'Special Event & Projects Team',
        managerId: 'mock-user-0', // Satyam Rathi
        color: '#8B5CF6',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: mockMembers
      };

      return [...teams, teamAaron];
    } catch (e) {
      // Return just mock if API fails
      const mockMembers = [
        "Satyam Rathi", "Gagandeep Singh", "Harsh Jain", "Pratik Nilakhe", 
        "Mahadev Thawani", "Preet Khandelwal", "Trinath Kethavath", 
        "Shashank Channawar", "Harshvardhan Patil", "Rukaiya Rangoonwala", 
        "Harish Kandi", "Prem Duseja", "Palash Somani", "Tushar Gurnani", 
        "Tarun Ghumnani", "Manasvi More"
      ].map((name, i) => ({
        userId: `mock-user-${i}`,
        name,
        email: `${name.split(' ')[0].toLowerCase()}@example.com`,
        role: name === 'Satyam Rathi' ? 'Manager' : 'Employee',
        designation: 'Software Engineer'
      }));
      return [{
        id: 'team-aaron',
        name: 'Team Aaron',
        description: 'Special Event & Projects Team',
        managerId: 'mock-user-0',
        color: '#8B5CF6',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: mockMembers
      }];
    }
  },

  getAllUsers: async (): Promise<any[]> => {
    return fetchWithAuth(`${API_URL}/users`);
  },

  createTeam: async (data: { name: string; description?: string; managerId: string; color?: string; icon?: string }): Promise<Team> => {
    return fetchWithAuth(`${API_URL}/teams`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  addMember: async (teamId: string, userId: string): Promise<void> => {
    return fetchWithAuth(`${API_URL}/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ teamId, userId }),
    });
  },
};
