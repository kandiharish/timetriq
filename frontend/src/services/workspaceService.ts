import { auth } from '../core/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

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

export interface HierarchyList {
  id: string;
  name: string;
}

export interface HierarchyFolder {
  id: string;
  name: string;
  lists: HierarchyList[];
  members?: string[];
}

export interface HierarchySpace {
  id: string;
  name: string;
  folders: HierarchyFolder[];
}

export const workspaceService = {
  getHierarchy: async (): Promise<HierarchySpace[]> => {
    try {
      return await fetchWithAuth(`${API_URL}/workspace/hierarchy`);
    } catch (e) {
      console.warn("Backend not available, using personal local storage for workspace hierarchy.");
      return JSON.parse(localStorage.getItem('timetriq_hierarchy') || '[]');
    }
  },

  createSpace: async (data: { name: string; description?: string }) => {
    try {
      return await fetchWithAuth(`${API_URL}/workspace/spaces`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn("Backend not available, saving space to local storage.");
      const hierarchy = JSON.parse(localStorage.getItem('timetriq_hierarchy') || '[]');
      const newSpace = { id: `space-${Date.now()}`, name: data.name, folders: [] };
      hierarchy.push(newSpace);
      localStorage.setItem('timetriq_hierarchy', JSON.stringify(hierarchy));
      return newSpace;
    }
  },

  createFolder: async (data: { name: string; space_id: string; description?: string; members?: string[] }) => {
    try {
      return await fetchWithAuth(`${API_URL}/workspace/folders`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn("Backend not available, saving folder to local storage.");
      const hierarchy = JSON.parse(localStorage.getItem('timetriq_hierarchy') || '[]');
      const space = hierarchy.find((s: any) => s.id === data.space_id);
      if (!space) throw new Error("Space not found");
      const newFolder = { id: `folder-${Date.now()}`, name: data.name, lists: [] };
      space.folders.push(newFolder);
      localStorage.setItem('timetriq_hierarchy', JSON.stringify(hierarchy));
      return newFolder;
    }
  },

  assignFolderMembers: async (folderId: string, members: string[]) => {
    try {
      return await fetchWithAuth(`${API_URL}/workspace/folders/${folderId}/members`, {
        method: 'PATCH',
        body: JSON.stringify({ members }),
      });
    } catch (e) {
      console.warn("Backend not available, skipping member assignment.");
      return { members };
    }
  },

  createList: async (data: { name: string; folder_id: string; description?: string }) => {
    try {
      return await fetchWithAuth(`${API_URL}/workspace/lists`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn("Backend not available, saving list to local storage.");
      const hierarchy = JSON.parse(localStorage.getItem('timetriq_hierarchy') || '[]');
      let targetFolder = null;
      for (const s of hierarchy) {
        targetFolder = s.folders.find((f: any) => f.id === data.folder_id);
        if (targetFolder) break;
      }
      if (!targetFolder) throw new Error("Folder not found");
      const newList = { id: `list-${Date.now()}`, name: data.name };
      targetFolder.lists.push(newList);
      localStorage.setItem('timetriq_hierarchy', JSON.stringify(hierarchy));
      return newList;
    }
  },
};
