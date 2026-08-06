import React, { useEffect, useState } from 'react';
import { teamService } from '../../services/teamService';
import type { Team } from '../../services/teamService';
import { Users } from 'lucide-react';

export const MyTeamTab: React.FC = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For Employees, getTeams returns only their team
    teamService.getTeams()
      .then(teams => {
        if (teams.length > 0) setTeam(teams[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load team', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading your team...</div>;
  }

  if (!team) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <Users size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Not assigned to a team</h3>
        <p style={{ color: '#6B7280' }}>You haven't been assigned to a team yet. Please contact your manager or an administrator.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={20} /> My Team: {team.name}
      </h2>
      
      <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '16px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
        <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: 0 }}>
          {team.description || 'No description provided.'}
        </p>
      </div>

      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>Team Members ({team.members.length})</h3>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Designation</th>
            </tr>
          </thead>
          <tbody>
            {team.members.map((member, i) => (
              <tr key={member.userId} style={{ borderBottom: i === team.members.length - 1 ? 'none' : '1px solid #E5E7EB' }}>
                <td style={{ padding: '16px', fontSize: '0.875rem', color: '#111827', fontWeight: 500 }}>
                  {member.name}
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 400 }}>{member.email}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: member.role === 'Manager' ? '#DBEAFE' : '#F3F4F6', color: member.role === 'Manager' ? '#1E40AF' : '#374151' }}>
                    {member.role}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '0.875rem', color: '#4B5563' }}>{member.designation || 'Team Member'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
