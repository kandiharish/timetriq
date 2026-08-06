import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamService } from '../services/teamService';
import type { Team } from '../services/teamService';
import { ArrowLeft, Users, Briefcase, Activity } from 'lucide-react';
import { TeamAvailability } from '../components/TeamAvailability';

export const TeamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Availability');

  useEffect(() => {
    teamService.getTeams().then(teams => {
      const found = teams.find(t => t.id === id);
      setTeam(found || null);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading team details...</div>;
  if (!team) return <div style={{ padding: '32px', textAlign: 'center', color: '#EF4444' }}>Team not found</div>;

  const tabs = ['Availability', 'Overview', 'Members', 'Projects', 'Statistics'];

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/teams" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6B7280', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Teams
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {team.icon ? (
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: team.color ? `${team.color}20` : '#F3F4F6', color: team.color || '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} />
            </div>
          ) : (
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#111827' }}>{team.name}</h1>
            <p style={{ color: '#6B7280', margin: '4px 0 0 0', fontSize: '0.875rem' }}>{team.description}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E5E7EB', marginBottom: '24px' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #4F46E5' : '2px solid transparent',
              color: activeTab === tab ? '#4F46E5' : '#6B7280',
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6B7280', marginBottom: '12px' }}>
                <Users size={20} />
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Total Members</h3>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{team.members.length}</div>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6B7280', marginBottom: '12px' }}>
                <Briefcase size={20} />
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Active Projects</h3>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{team.assignedSpaces?.length || 0}</div>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6B7280', marginBottom: '12px' }}>
                <Activity size={20} />
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Productivity Score</h3>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>92%</div>
            </div>
          </div>
        )}

        {activeTab === 'Members' && (
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
        )}
        
        {activeTab === 'Projects' && (
          <div style={{ color: '#6B7280', textAlign: 'center', padding: '40px' }}>
            Projects assigned to this team will appear here.
          </div>
        )}
        
        {activeTab === 'Statistics' && (
          <div style={{ color: '#6B7280', textAlign: 'center', padding: '40px' }}>
            Detailed team performance statistics will appear here.
          </div>
        )}

        {activeTab === 'Availability' && (
          <TeamAvailability members={team.members} />
        )}
      </div>
    </div>
  );
};
