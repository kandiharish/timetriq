import React, { useEffect, useState } from 'react';
import { presenceService } from '../services/presenceService';
import type { UserPresence, PresenceStatus } from '../services/presenceService';
import type { MemberProfile } from '../services/teamService';
import { Circle, Search, Clock, Briefcase, ChevronRight } from 'lucide-react';

interface TeamAvailabilityProps {
  members: MemberProfile[];
}

const statusColors: Record<PresenceStatus, string> = {
  'Available': '#10B981', 
  'Busy': '#EF4444', 
  'In Meeting': '#F59E0B', 
  'Focus Mode': '#8B5CF6', 
  'Break': '#3B82F6', 
  'On Leave': '#6B7280', 
  'Work From Home': '#14B8A6', 
  'In Office': '#3B82F6', 
  'Offline': '#9CA3AF' 
};

export const TeamAvailability: React.FC<TeamAvailabilityProps> = ({ members }) => {
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = presenceService.subscribeToPresence((data) => {
      const presenceMap: Record<string, UserPresence> = {};
      data.forEach(p => {
        presenceMap[p.userId] = p;
      });
      setPresences(presenceMap);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Merge team members with their real-time presence
  const memberData = members.map(m => {
    const p = presences[m.userId];
    // Randomize initial mock data if not set yet, so it looks like a real active team
    const defaultStatus: PresenceStatus = m.name === 'Harish Kandi' ? 'Available' 
      : m.name === 'Satyam Rathi' ? 'In Meeting' 
      : m.name === 'Gagandeep Singh' ? 'Busy'
      : m.name === 'Pratik Nilakhe' ? 'On Leave'
      : 'Offline';

    return {
      ...m,
      status: p?.currentStatus || defaultStatus,
      lastSeen: p?.lastSeen ? new Date(p.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Today',
      location: p?.workingLocation || (m.name.includes('Harsh') ? 'Remote' : 'Office'),
      customStatus: p?.customStatus || ''
    };
  });

  const filteredMembers = memberData.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
      
      {/* Header and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Real-time Availability</h2>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem', width: '250px', outline: 'none' }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {['Available', 'Busy', 'In Meeting', 'On Leave'].map(stat => {
          const count = memberData.filter(m => m.status === stat).length;
          return (
            <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <Circle size={10} fill={statusColors[stat as PresenceStatus]} color={statusColors[stat as PresenceStatus]} />
              <span style={{ fontSize: '0.875rem', color: '#4B5563', fontWeight: 500 }}>{stat}</span>
              <span style={{ fontSize: '1rem', color: '#111827', fontWeight: 700, marginLeft: '8px' }}>{count}</span>
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredMembers.map(member => (
          <div key={member.userId} style={{ 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid #E5E7EB', 
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Top row: Avatar + Info */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', 
                  backgroundColor: '#EEF2FF', color: '#4F46E5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 700
                }}>
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{
                  position: 'absolute', bottom: '0px', right: '0px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  backgroundColor: statusColors[member.status as PresenceStatus] || '#9CA3AF',
                  border: '2px solid white'
                }}></div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {member.name}
                  <ChevronRight size={16} color="#9CA3AF" style={{ cursor: 'pointer' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{member.role}</div>
                {member.customStatus && (
                  <div style={{ fontSize: '0.8125rem', color: '#374151', marginTop: '6px', fontStyle: 'italic' }}>
                    "{member.customStatus}"
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Metadata */}
            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '0.75rem' }}>
                <Briefcase size={14} />
                {member.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '0.75rem' }}>
                <Clock size={14} />
                {member.lastSeen}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
