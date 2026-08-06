import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { leaveService } from '../services/leaveService';
import type { LeaveRequest, LeaveType } from '../services/leaveService';
import { useNotifications } from '../context/NotificationContext';
import { Calendar, Check, X, FileText } from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'MyLeaves' | 'Requests'>('MyLeaves');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [leaveType, setLeaveType] = useState<LeaveType>('Sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [managerId, setManagerId] = useState('harsh@verveadvisory.com'); 
  const [ccUser, setCcUser] = useState('');

  const isManager = hasRole(['Manager', 'Admin']);

  const fetchLeaves = async () => {
    if (!user) return;
    setLoading(true);
    if (activeTab === 'MyLeaves') {
      const data = await leaveService.getMyLeaves(user.uid);
      setLeaves(data);
    } else if (isManager && user.email) {
      const data = await leaveService.getLeavesForManager(user.email);
      setLeaves(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, [activeTab, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await leaveService.submitLeaveRequest({
        userId: user.uid,
        managerId,
        ccUserIds: ccUser ? [ccUser] : [],
        leaveType,
        startDate,
        endDate,
        reason
      });
      addNotification({
        title: 'Leave Request Submitted',
        body: `Your ${leaveType} leave request has been sent to your manager.`
      });
      setLeaveType('Sick');
      setStartDate('');
      setEndDate('');
      setReason('');
      setCcUser('');
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert('Failed to submit leave request');
    }
  };

  const handleStatusUpdate = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await leaveService.updateLeaveStatus(id, status);
      addNotification({
        title: `Leave ${status}`,
        body: `You have ${status.toLowerCase()} a leave request.`
      });
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert('Failed to update leave status');
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Leave Management</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Apply for leaves and track their status</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E5E7EB', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('MyLeaves')}
          style={{
            padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem',
            borderBottom: activeTab === 'MyLeaves' ? '2px solid #4F46E5' : '2px solid transparent',
            color: activeTab === 'MyLeaves' ? '#4F46E5' : '#6B7280',
            fontWeight: activeTab === 'MyLeaves' ? 600 : 500
          }}
        >
          My Leaves
        </button>
        {isManager && (
          <button
            onClick={() => setActiveTab('Requests')}
            style={{
              padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem',
              borderBottom: activeTab === 'Requests' ? '2px solid #4F46E5' : '2px solid transparent',
              color: activeTab === 'Requests' ? '#4F46E5' : '#6B7280',
              fontWeight: activeTab === 'Requests' ? 600 : 500
            }}
          >
            Team Requests
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'MyLeaves' ? '1fr 2fr' : '1fr', gap: '32px' }}>
        {activeTab === 'MyLeaves' && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '20px' }}>Apply for Leave</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Leave Type</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}>
                  <option value="Sick">Sick Leave</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Casual">Casual</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Start Date</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>End Date</label>
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Manager to notify</label>
                <select value={managerId} onChange={(e) => setManagerId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}>
                  <option value="harsh@verveadvisory.com">Harsh (Manager)</option>
                  <option value="satyam@verveadvisory.com">Satyam (Manager)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>CC (HR / Others) Optional</label>
                <select value={ccUser} onChange={(e) => setCcUser(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}>
                  <option value="">None</option>
                  <option value="vishaka@verveadvisory.com">Vishaka (HR)</option>
                  <option value="reena@verveadvisory.com">Reena (HR)</option>
                  <option value="harshitha@verveadvisory.com">Harshitha (HR)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Reason</label>
                <textarea required value={reason} onChange={e => setReason(e.target.value)} rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', resize: 'vertical' }} />
              </div>
              <button type="submit" style={{ backgroundColor: '#4F46E5', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Submit Request</button>
            </form>
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '20px' }}>{activeTab === 'MyLeaves' ? 'Leave History' : 'Pending Requests'}</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : leaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
              <FileText size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              No leave requests found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {leaves.map(leave => (
                <div key={leave.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{leave.leaveType} Leave</span>
                      <span style={{ 
                        fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                        backgroundColor: leave.status === 'Approved' ? '#D1FAE5' : leave.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                        color: leave.status === 'Approved' ? '#065F46' : leave.status === 'Rejected' ? '#991B1B' : '#92400E'
                      }}>
                        {leave.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem', color: '#6B7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {leave.startDate} to {leave.endDate}</span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: '#4B5563' }}>{leave.reason}</p>
                  </div>
                  
                  {activeTab === 'Requests' && leave.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleStatusUpdate(leave.id, 'Approved')} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                        <Check size={14} /> Approve
                      </button>
                      <button onClick={() => handleStatusUpdate(leave.id, 'Rejected')} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
