import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../core/firebase';

export interface ChecklistItem {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  order: number;
  createdBy: string;
  createdAt: string | Date | any;
  updatedAt: string | Date | any;
}

const COLLECTION_NAME = 'taskChecklists';

export const checklistService = {
  getChecklistItems: async (taskId: string): Promise<ChecklistItem[]> => {
    let items: ChecklistItem[] = [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('taskId', '==', taskId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        const data = doc.data();
        items.push({ id: doc.id, ...data } as ChecklistItem);
      });
    } catch (error) {
      console.warn("Failed to fetch checklist from Firestore, falling back to local storage", error);
    }

    const stored = JSON.parse(localStorage.getItem(`timetriq_checklists_${taskId}`) || '[]');
    
    const merged = [...items, ...stored];
    const uniqueIds = new Set();
    const uniqueItems = merged.filter(item => {
      if (uniqueIds.has(item.id)) return false;
      uniqueIds.add(item.id);
      return true;
    });

    return uniqueItems.sort((a, b) => a.order - b.order);
  },

  addChecklistItem: async (taskId: string, title: string, order: number): Promise<ChecklistItem> => {
    const newItem = {
      taskId,
      title,
      completed: false,
      order,
      createdBy: auth.currentUser?.uid || 'guest',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newItem);
      return { id: docRef.id, ...newItem, createdAt: new Date(), updatedAt: new Date() } as ChecklistItem;
    } catch (error) {
      console.warn("Failed to add checklist to Firestore, falling back to local storage", error);
      const id = Date.now().toString();
      const item: ChecklistItem = { ...newItem, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ChecklistItem;
      const stored = JSON.parse(localStorage.getItem(`timetriq_checklists_${taskId}`) || '[]');
      stored.push(item);
      localStorage.setItem(`timetriq_checklists_${taskId}`, JSON.stringify(stored));
      return item;
    }
  },

  updateChecklistItem: async (id: string, taskId: string, updates: Partial<ChecklistItem>): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    } catch (error) {
      console.warn("Failed to update checklist in Firestore, falling back to local storage", error);
      const stored = JSON.parse(localStorage.getItem(`timetriq_checklists_${taskId}`) || '[]');
      const index = stored.findIndex((i: any) => i.id === id);
      if (index !== -1) {
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(`timetriq_checklists_${taskId}`, JSON.stringify(stored));
      }
    }
  },

  deleteChecklistItem: async (id: string, taskId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.warn("Failed to delete checklist in Firestore, falling back to local storage", error);
      let stored = JSON.parse(localStorage.getItem(`timetriq_checklists_${taskId}`) || '[]');
      stored = stored.filter((i: any) => i.id !== id);
      localStorage.setItem(`timetriq_checklists_${taskId}`, JSON.stringify(stored));
    }
  },

  reorderItems: async (taskId: string, items: ChecklistItem[]): Promise<void> => {
    try {
      const batch = writeBatch(db);
      items.forEach((item, index) => {
        if (!item.id.startsWith('local_')) {
            const docRef = doc(db, COLLECTION_NAME, item.id);
            batch.update(docRef, { order: index, updatedAt: serverTimestamp() });
        }
      });
      await batch.commit();
    } catch (error) {
      console.warn("Failed to reorder checklist in Firestore, falling back to local storage", error);
      const stored = items.map((item, index) => ({ ...item, order: index, updatedAt: new Date().toISOString() }));
      localStorage.setItem(`timetriq_checklists_${taskId}`, JSON.stringify(stored));
    }
  }
};
