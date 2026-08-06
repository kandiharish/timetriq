import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Plus, Folder, List, Layout as LayoutIcon, Lock } from 'lucide-react';
import { workspaceService } from '../../services/workspaceService';
import type { HierarchySpace } from '../../services/workspaceService';
import { useAuth } from '../AuthContext';
import { WorkspaceItemModal } from './WorkspaceItemModal';

export const WorkspaceSidebar: React.FC = () => {
  const [spaces, setSpaces] = useState<HierarchySpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({});
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'space' | 'folder' | 'list'; parentId?: string }>({ isOpen: false, type: 'space' });
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const canCreate = hasRole(['Admin', 'Manager']);

  const fetchSpaces = async () => {
    try {
      const data = await workspaceService.getHierarchy();
      setSpaces(data);
    } catch (err) {
      console.error('Failed to load workspace hierarchy', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const toggleSpace = (id: string) => setExpandedSpaces(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFolder = (id: string) => setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCreateSpace = () => {
    if (!canCreate) return;
    setModalState({ isOpen: true, type: 'space' });
  };

  const handleCreateFolder = (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    if (!canCreate) return;
    setModalState({ isOpen: true, type: 'folder', parentId: spaceId });
  };

  const handleCreateList = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    if (!canCreate) return;
    setModalState({ isOpen: true, type: 'list', parentId: folderId });
  };

  if (loading) return <div style={{ padding: '0 12px', fontSize: '0.75rem', color: '#9CA3AF' }}>Loading workspace...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-sidebar-text)', letterSpacing: '0.05em' }}>
          Spaces
        </div>
        {canCreate && (
          <button onClick={handleCreateSpace} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-sidebar-text)', display: 'flex', alignItems: 'center' }}>
            <Plus size={14} />
          </button>
        )}
      </div>

      {spaces.length === 0 && (
        <div style={{ padding: '0 12px', fontSize: '0.75rem', color: '#9CA3AF' }}>No spaces yet.</div>
      )}

      {spaces.map(space => (
        <div key={space.id} style={{ display: 'flex', flexDirection: 'column' }}>
          <div 
            onClick={() => { toggleSpace(space.id); navigate(`/spaces/${space.id}`); }}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', 
              cursor: 'pointer', borderRadius: '6px', color: 'var(--color-sidebar-text)',
              fontSize: '0.875rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div onClick={(e) => { e.stopPropagation(); toggleSpace(space.id); }}>
                {expandedSpaces[space.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              <LayoutIcon size={16} />
              <span style={{ fontWeight: 500 }}>{space.name}</span>
            </div>
            {canCreate && (
              <button onClick={(e) => handleCreateFolder(e, space.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-sidebar-text)', opacity: 0.7 }}>
                <Plus size={14} />
              </button>
            )}
          </div>

          {expandedSpaces[space.id] && space.folders.map(folder => (
            <div key={folder.id} style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px' }}>
              <div 
                onClick={() => { toggleFolder(folder.id); navigate(`/folders/${folder.id}`); }}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', 
                  cursor: 'pointer', borderRadius: '6px', color: 'var(--color-sidebar-text)',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }}>
                    {expandedFolders[folder.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                  <Folder size={14} />
                  <span>{folder.name}</span>
                  {folder.members && folder.members.length > 0 && canCreate && (
                    <span title="Restricted Access"><Lock size={12} color="#9CA3AF" style={{ marginLeft: '4px' }} /></span>
                  )}
                </div>
                {canCreate && (
                  <button onClick={(e) => handleCreateList(e, folder.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-sidebar-text)', opacity: 0.7 }}>
                    <Plus size={14} />
                  </button>
                )}
              </div>

              {expandedFolders[folder.id] && folder.lists.map(list => (
                <div 
                  key={list.id} 
                  onClick={() => navigate(`/lists/${list.id}`)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px 6px 44px', 
                    cursor: 'pointer', borderRadius: '6px', color: 'var(--color-sidebar-text)',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <List size={14} />
                  <span>{list.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {canCreate && (
        <div 
          onClick={handleCreateSpace}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', 
            marginTop: '8px', cursor: 'pointer', borderRadius: '6px', color: 'var(--color-sidebar-text)',
            fontSize: '0.875rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Plus size={14} />
          <span>New Space</span>
        </div>
      )}

      {modalState.isOpen && (
        <WorkspaceItemModal 
          type={modalState.type} 
          parentId={modalState.parentId} 
          onClose={() => setModalState({ isOpen: false, type: 'space' })} 
          onSuccess={() => {
            setModalState({ isOpen: false, type: 'space' });
            fetchSpaces();
            if (modalState.type === 'folder' && modalState.parentId) {
              setExpandedSpaces(prev => ({ ...prev, [modalState.parentId!]: true }));
            }
            if (modalState.type === 'list' && modalState.parentId) {
              setExpandedFolders(prev => ({ ...prev, [modalState.parentId!]: true }));
            }
          }} 
        />
      )}
    </div>
  );
};
