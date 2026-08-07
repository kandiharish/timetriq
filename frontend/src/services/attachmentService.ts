import { collection, doc, addDoc, deleteDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../core/firebase';

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  downloadUrl: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: string | Date | any;
}

const COLLECTION_NAME = 'taskAttachments';

export const attachmentService = {
  getAttachments: async (taskId: string): Promise<TaskAttachment[]> => {
    let items: TaskAttachment[] = [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('taskId', '==', taskId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        const data = doc.data();
        items.push({ id: doc.id, ...data } as TaskAttachment);
      });
    } catch (error) {
      console.warn("Failed to fetch attachments from Firestore, falling back to local storage", error);
    }
    
    // Always append items saved via the offline fallback in local storage
    const stored = JSON.parse(localStorage.getItem(`timetriq_attachments_${taskId}`) || '[]');
    
    // Merge and remove duplicates (in case of id collisions, though unlikely)
    const merged = [...items, ...stored];
    const uniqueIds = new Set();
    const uniqueItems = merged.filter(item => {
      if (uniqueIds.has(item.id)) return false;
      uniqueIds.add(item.id);
      return true;
    });

    // Sort by uploadedAt descending (newest first)
    return uniqueItems.sort((a, b) => {
      const dateA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt || 0).getTime();
      const dateB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt || 0).getTime();
      return dateB - dateA;
    });
  },

  uploadAttachment: async (
    taskId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<TaskAttachment> => {
    return new Promise((resolve, reject) => {
      const url = `https://api.cloudinary.com/v1_1/dqhmpnoqk/auto/upload`;
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'timetriq');

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            const downloadUrl = response.secure_url;
            const user = auth.currentUser;
            
            const newAttachment = {
              taskId,
              fileName: file.name,
              fileType: file.type || 'application/octet-stream',
              fileSize: file.size,
              storagePath: response.public_id, // Store Cloudinary public_id
              downloadUrl,
              uploadedBy: user?.uid || 'guest',
              uploadedByName: user?.displayName || user?.email || 'Unknown',
              uploadedAt: serverTimestamp()
            };

            // Save metadata to Firestore
            let attachmentData: TaskAttachment;
            try {
              const docRef = await addDoc(collection(db, COLLECTION_NAME), newAttachment);
              attachmentData = { id: docRef.id, ...newAttachment, uploadedAt: new Date() } as TaskAttachment;
            } catch (firestoreError) {
              console.warn("Failed to save attachment metadata to Firestore, using local storage", firestoreError);
              const id = Date.now().toString();
              attachmentData = { ...newAttachment, id, uploadedAt: new Date().toISOString() } as TaskAttachment;
              const stored = JSON.parse(localStorage.getItem(`timetriq_attachments_${taskId}`) || '[]');
              stored.unshift(attachmentData);
              localStorage.setItem(`timetriq_attachments_${taskId}`, JSON.stringify(stored));
            }

            resolve(attachmentData);
          } catch (error) {
            reject(error);
          }
        } else {
          console.warn("Cloudinary upload failed, falling back to local base64 storage", xhr.responseText);
          try {
            const fallbackAttachment = await saveToLocalStorageFallback(taskId, file);
            resolve(fallbackAttachment);
          } catch (e) {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener('error', async () => {
        console.warn("Cloudinary network error, falling back to local base64 storage");
        try {
          const fallbackAttachment = await saveToLocalStorageFallback(taskId, file);
          resolve(fallbackAttachment);
        } catch (e) {
          reject(new Error("Network error occurred during upload"));
        }
      });

      xhr.open('POST', url, true);
      xhr.send(formData);
    });
  },

  deleteAttachment: async (attachment: TaskAttachment): Promise<void> => {
    // Note: Deleting from Cloudinary via frontend (unsigned) is not supported securely.
    // In a real app, a backend endpoint is needed to delete the Cloudinary resource.
    // Here we just remove the metadata from our records.
    try {
      if (!attachment.id.startsWith('local_')) {
        await deleteDoc(doc(db, COLLECTION_NAME, attachment.id));
      }
    } catch (error) {
      console.warn("Failed to delete attachment from Firestore, attempting local storage fallback", error);
      let stored = JSON.parse(localStorage.getItem(`timetriq_attachments_${attachment.taskId}`) || '[]');
      stored = stored.filter((i: any) => i.id !== attachment.id);
      localStorage.setItem(`timetriq_attachments_${attachment.taskId}`, JSON.stringify(stored));
    }
  }
};

async function saveToLocalStorageFallback(taskId: string, file: File): Promise<TaskAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      const user = auth.currentUser;
      const newAttachment: TaskAttachment = {
        id: Date.now().toString(),
        taskId,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        storagePath: `local_${taskId}_${file.name}`,
        downloadUrl: base64Url,
        uploadedBy: user?.uid || 'guest',
        uploadedByName: user?.displayName || user?.email || 'Unknown',
        uploadedAt: new Date().toISOString()
      };
      
      const stored = JSON.parse(localStorage.getItem(`timetriq_attachments_${taskId}`) || '[]');
      stored.unshift(newAttachment);
      
      // Handle QuotaExceededError which is common for large base64 strings
      try {
        localStorage.setItem(`timetriq_attachments_${taskId}`, JSON.stringify(stored));
        resolve(newAttachment);
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          reject(new Error("File is too large to save offline. (Local storage full)"));
        } else {
          reject(e);
        }
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file for local fallback"));
    reader.readAsDataURL(file);
  });
}
