import { auth } from '../core/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface UserSettings {
  user_id: string;
  daily_capacity: number;
  working_days: number[];
}

export interface UserSettingsUpdate {
  daily_capacity: number;
  working_days: number[];
}

class SettingsService {
  private async getHeaders() {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getSettings(): Promise<UserSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        headers: await this.getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return await response.json();
    } catch (e) {
      console.warn("Backend not available, using personal local storage for settings.");
      const defaultSettings = { user_id: 'local', daily_capacity: 8, working_days: [1, 2, 3, 4, 5] };
      return JSON.parse(localStorage.getItem('timetriq_settings') || JSON.stringify(defaultSettings));
    }
  }

  async updateSettings(settings: UserSettingsUpdate): Promise<UserSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: await this.getHeaders(),
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return await response.json();
    } catch (e) {
      console.warn("Backend not available, saving settings to personal local storage.");
      const updatedSettings = { ...settings, user_id: 'local' };
      localStorage.setItem('timetriq_settings', JSON.stringify(updatedSettings));
      return updatedSettings;
    }
  }
}

export const settingsService = new SettingsService();
