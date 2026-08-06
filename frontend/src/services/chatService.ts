import { db } from '../core/firebase';
// Force Vite HMR reload
import { collection, doc, setDoc, onSnapshot, query, getDocs, updateDoc, where, orderBy, deleteDoc } from 'firebase/firestore';

export interface ChatRoom {
  id: string;
  name: string;
  type: 'Team' | 'Space' | 'Folder' | 'Direct';
  teamId?: string;
  spaceId?: string;
  folderId?: string;
  participants?: string[]; // user IDs for direct messages
  createdBy: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  message: string;
  attachments?: { name: string; url: string; type: string }[];
  replyTo?: string; // message ID
  edited?: boolean;
  editedAt?: string;
  createdAt: string; // ISO string
  readBy?: string[]; // user IDs
}

export const chatService = {
  // Create a new chat room
  createRoom: async (room: Omit<ChatRoom, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const roomRef = doc(collection(db, 'chatRooms'));
      const newRoom: ChatRoom = {
        ...room,
        id: roomRef.id,
        createdAt: new Date().toISOString()
      };
      await setDoc(roomRef, newRoom);
      return roomRef.id;
    } catch (error) {
      console.error("Failed to create chat room", error);
      throw error;
    }
  },

  // Fetch rooms user has access to
  // For simplicity, we just fetch all Team/Space rooms and direct messages
  getUserRooms: async (userId: string): Promise<ChatRoom[]> => {
    try {
      // In a real scenario with strict rules, this would be highly filtered.
      // For now, we'll fetch team chats and direct messages where user is participant.
      const q = query(collection(db, 'chatRooms'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const rooms: ChatRoom[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as ChatRoom;
        if (data.type === 'Direct' && !data.participants?.includes(userId)) {
          return; // Skip DMs not involving the user
        }
        rooms.push(data);
      });
      return rooms;
    } catch (error) {
      console.error("Failed to fetch chat rooms", error);
      return [];
    }
  },

  // Send a message
  sendMessage: async (msg: Omit<ChatMessage, 'id' | 'createdAt' | 'readBy'>): Promise<void> => {
    try {
      const msgRef = doc(collection(db, 'messages'));
      const newMsg: ChatMessage = {
        ...msg,
        id: msgRef.id,
        createdAt: new Date().toISOString(),
        readBy: [msg.senderId]
      };
      await setDoc(msgRef, newMsg);
    } catch (error) {
      console.error("Failed to send message", error);
      throw error;
    }
  },

  // Subscribe to messages in a room
  subscribeToMessages: (roomId: string, callback: (messages: ChatMessage[]) => void) => {
    const q = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', roomId),
      // Firebase requires index for multiple fields, so we might sort locally if index is missing
      // orderBy('createdAt', 'asc') 
    );
    
    return onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach(doc => msgs.push(doc.data() as ChatMessage));
      // Sort locally to avoid needing composite index immediately
      msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(msgs);
    }, (error) => {
      console.error("Error listening to messages", error);
    });
  },

  // Mark message as read
  markAsRead: async (messageId: string, userId: string, currentReadBy: string[]) => {
    if (currentReadBy.includes(userId)) return;
    try {
      const msgRef = doc(db, 'messages', messageId);
      await updateDoc(msgRef, {
        readBy: [...currentReadBy, userId]
      });
    } catch (error) {
      console.error("Failed to mark message read", error);
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  }
};
