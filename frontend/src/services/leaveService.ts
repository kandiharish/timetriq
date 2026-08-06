import { db } from '../core/firebase';
import { collection, doc, setDoc, query, getDocs, updateDoc, where } from 'firebase/firestore';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type LeaveType = 'Sick' | 'Vacation' | 'Casual' | 'Other';

export interface LeaveRequest {
  id: string;
  userId: string;
  managerId: string;
  ccUserIds: string[];
  leaveType: LeaveType;
  startDate: string; // ISO String (YYYY-MM-DD)
  endDate: string; // ISO String (YYYY-MM-DD)
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

export const leaveService = {
  submitLeaveRequest: async (leaveReq: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): Promise<string> => {
    try {
      const leaveRef = doc(collection(db, 'leaveRequests'));
      const newLeave: LeaveRequest = {
        ...leaveReq,
        id: leaveRef.id,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      await setDoc(leaveRef, newLeave);
      return leaveRef.id;
    } catch (error) {
      console.error("Failed to submit leave request", error);
      throw error;
    }
  },

  updateLeaveStatus: async (id: string, status: LeaveStatus): Promise<void> => {
    try {
      const leaveRef = doc(db, 'leaveRequests', id);
      await updateDoc(leaveRef, { status });
    } catch (error) {
      console.error("Failed to update leave status", error);
      throw error;
    }
  },

  getMyLeaves: async (userId: string): Promise<LeaveRequest[]> => {
    try {
      const q = query(
        collection(db, 'leaveRequests'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const leaves: LeaveRequest[] = [];
      snapshot.forEach(doc => leaves.push(doc.data() as LeaveRequest));
      return leaves.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Failed to fetch leaves", error);
      return [];
    }
  },

  getLeavesForManager: async (email: string): Promise<LeaveRequest[]> => {
    try {
      const qManager = query(
        collection(db, 'leaveRequests'),
        where('managerId', '==', email)
      );
      const qCc = query(
        collection(db, 'leaveRequests'),
        where('ccUserIds', 'array-contains', email)
      );
      
      const [snap1, snap2] = await Promise.all([getDocs(qManager), getDocs(qCc)]);
      const leavesMap = new Map<string, LeaveRequest>();
      
      snap1.forEach(doc => leavesMap.set(doc.id, doc.data() as LeaveRequest));
      snap2.forEach(doc => leavesMap.set(doc.id, doc.data() as LeaveRequest));
      
      return Array.from(leavesMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Failed to fetch manager/HR leaves", error);
      return [];
    }
  }
};
