import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, Hash, Search, Plus, Send, ChevronRight, ArrowLeft, UserPlus, X } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

// --- Types ---
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderColor: string;
  text: string;
  timestamp: Date;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'team' | 'personal' | 'group';
  memberIds: string[];
  memberNames: string[];
  lastMessage?: string;
  lastAt?: Date;
  unread?: number;
  avatarColor?: string;
}

// Team members list (matching TaskForm)
const TEAM_MEMBERS = [
  { id: 'harsh', name: 'Harsh (Manager)', initials: 'HA', color: '#4F46E5' },
  { id: 'sathyam', name: 'Sathyam (Manager)', initials: 'SA', color: '#059669' },
  { id: 'vishaka', name: 'Vishaka (HR)', initials: 'VI', color: '#D97706' },
  { id: 'reena', name: 'Reena (HR)', initials: 'RE', color: '#DC2626' },
  { id: 'harshitha', name: 'Harshitha (HR)', initials: 'HI', color: '#7C3AED' },
  { id: 'harish_kandi', name: 'Harish Kandi', initials: 'HK', color: '#2563EB' },
  { id: 'pradeep', name: 'Pradeep', initials: 'PR', color: '#0891B2' },
  { id: 'ramu', name: 'Ramu', initials: 'RA', color: '#16A34A' },
  { id: 'rahul', name: 'Rahul', initials: 'RH', color: '#EA580C' },
  { id: 'dev', name: 'Dev', initials: 'DE', color: '#9333EA' },
];

const TEAM_ROOMS: ChatRoom[] = [
  { id: 'team-design', name: 'Design Team', type: 'team', memberIds: ['harsh', 'vishaka', 'harish_kandi'], memberNames: ['Harsh', 'Vishaka', 'Harish Kandi'], avatarColor: '#4F46E5' },
  { id: 'team-engineering', name: 'Engineering', type: 'team', memberIds: ['sathyam', 'pradeep', 'ramu', 'dev'], memberNames: ['Sathyam', 'Pradeep', 'Ramu', 'Dev'], avatarColor: '#059669' },
  { id: 'team-hr', name: 'HR Team', type: 'team', memberIds: ['vishaka', 'reena', 'harshitha'], memberNames: ['Vishaka', 'Reena', 'Harshitha'], avatarColor: '#7C3AED' },
  { id: 'team-general', name: 'General', type: 'team', memberIds: [], memberNames: [], avatarColor: '#D97706' },
];

// Local storage key for messages
const getStorageKey = (roomId: string) => `timetriq_chat_${roomId}`;
const getRoomsKey = () => 'timetriq_chat_rooms';

const loadMessages = (roomId: string): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(getStorageKey(roomId));
    if (!raw) return [];
    return JSON.parse(raw).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch { return []; }
};

const saveMessages = (roomId: string, msgs: ChatMessage[]) => {
  localStorage.setItem(getStorageKey(roomId), JSON.stringify(msgs));
};

const loadCustomRooms = (): ChatRoom[] => {
  try {
    const raw = localStorage.getItem(getRoomsKey());
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveCustomRooms = (rooms: ChatRoom[]) => {
  localStorage.setItem(getRoomsKey(), JSON.stringify(rooms));
};

const Avatar: React.FC<{ initials: string; color: string; size?: number; name?: string }> = ({ initials, color, size = 36, name }) => (
  <div title={name} style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size < 30 ? '0.6rem' : '0.75rem', fontWeight: 700, flexShrink: 0 }}>
    {initials}
  </div>
);

const formatTime = (d: Date) => {
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// --- Chat Window ---
const ChatWindow: React.FC<{ room: ChatRoom; currentUserId: string; currentUserName: string; onBack: () => void }> = ({ room, currentUserId, currentUserName, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentMember = TEAM_MEMBERS.find(m => m.id === currentUserId);
  const currentInitials = currentMember?.initials || currentUserName.substring(0, 2).toUpperCase();
  const currentColor = currentMember?.color || '#4F46E5';

  useEffect(() => {
    setMessages(loadMessages(room.id));
  }, [room.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderInitials: currentInitials,
      senderColor: currentColor,
      text: input.trim(),
      timestamp: new Date(),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    saveMessages(room.id, updated);
    setInput('');
  };

  const otherMembers = room.memberNames.filter(n => n.toLowerCase() !== currentUserName.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px', borderRadius: '6px', display: 'flex' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: room.type === 'team' ? '10px' : '50%', backgroundColor: room.avatarColor || '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {room.type === 'team' ? <Hash size={18} color="white" /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>{room.name.substring(0, 2).toUpperCase()}</span>}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{room.name}</div>
          <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
            {room.type === 'team' ? `${room.memberIds.length} members` : otherMembers.join(', ') || 'You'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#F9FAFB' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '60px' }}>
            <MessageSquare size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, color: '#6B7280', margin: '0 0 4px' }}>No messages yet</p>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>Be the first to say something!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              {!isMe && <Avatar initials={msg.senderInitials} color={msg.senderColor} size={28} name={msg.senderName} />}
              <div style={{ maxWidth: '65%' }}>
                {!isMe && <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '3px', fontWeight: 600 }}>{msg.senderName}</div>}
                <div style={{
                  padding: '10px 14px', borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  backgroundColor: isMe ? '#4F46E5' : 'white',
                  color: isMe ? 'white' : '#111827',
                  fontSize: '0.875rem', lineHeight: 1.5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '3px', textAlign: isMe ? 'right' : 'left' }}>{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F3F4F6', borderRadius: '24px', padding: '8px 16px', border: '1px solid #E5E7EB' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Message ${room.name}...`}
            style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.875rem', color: '#111827' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{ background: input.trim() ? '#4F46E5' : '#E5E7EB', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
          >
            <Send size={14} color={input.trim() ? 'white' : '#9CA3AF'} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- New Chat Modal ---
const NewChatModal: React.FC<{ onClose: () => void; onCreateRoom: (room: ChatRoom) => void; currentUserId: string }> = ({ onClose, onCreateRoom, currentUserId }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filtered = TEAM_MEMBERS.filter(m => m.id !== currentUserId && m.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const createChat = () => {
    if (selected.length === 0) return;
    const members = TEAM_MEMBERS.filter(m => selected.includes(m.id));
    const isGroup = selected.length > 1;
    const room: ChatRoom = {
      id: `dm-${[currentUserId, ...selected].sort().join('-')}-${Date.now()}`,
      name: isGroup ? members.map(m => m.name.split(' ')[0]).join(', ') : members[0].name,
      type: isGroup ? 'group' : 'personal',
      memberIds: [currentUserId, ...selected],
      memberNames: members.map(m => m.name),
      avatarColor: members[0].color,
    };
    onCreateRoom(room);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 400, backgroundColor: 'white', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>New Chat</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6B7280' }}>Select one or more people</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: '8px 12px', gap: 8 }}>
            <Search size={14} color="#9CA3AF" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people..." style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.875rem', width: '100%' }} />
          </div>
        </div>
        {selected.length > 0 && (
          <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: 6, borderBottom: '1px solid #F3F4F6' }}>
            {selected.map(id => {
              const m = TEAM_MEMBERS.find(x => x.id === id)!;
              return (
                <span key={id} style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: m.color + '20', color: m.color, padding: '3px 8px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                  {m.name.split(' ')[0]}
                  <button onClick={() => toggle(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}><X size={10} /></button>
                </span>
              );
            })}
          </div>
        )}
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {filtered.map(m => (
            <div key={m.id} onClick={() => toggle(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', backgroundColor: selected.includes(m.id) ? '#EEF2FF' : 'white', transition: 'background 0.15s' }}>
              <Avatar initials={m.initials} color={m.color} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{m.name}</div>
              </div>
              {selected.includes(m.id) && (
                <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #E5E7EB' }}>
          <button onClick={createChat} disabled={selected.length === 0} style={{ width: '100%', padding: '10px', backgroundColor: selected.length > 0 ? '#4F46E5' : '#E5E7EB', color: selected.length > 0 ? 'white' : '#9CA3AF', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: selected.length > 0 ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
            {selected.length === 0 ? 'Select people to chat' : selected.length === 1 ? 'Start Chat' : `Start Group Chat (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main ChatApp ---
export const ChatApp: React.FC = () => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [customRooms, setCustomRooms] = useState<ChatRoom[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);

  const currentUserId = user?.uid || 'guest';
  const currentUserName = user?.displayName || user?.email?.split('@')[0] || 'You';

  useEffect(() => {
    setCustomRooms(loadCustomRooms());
  }, []);

  const handleCreateRoom = (room: ChatRoom) => {
    const updated = [...customRooms, room];
    setCustomRooms(updated);
    saveCustomRooms(updated);
    setSelectedRoom(room);
  };

  const allRooms = [...TEAM_ROOMS, ...customRooms];

  const teamRooms = allRooms.filter(r => r.type === 'team');
  const dmRooms = allRooms.filter(r => r.type === 'personal' || r.type === 'group');

  if (selectedRoom) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ChatWindow
          room={selectedRoom}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onBack={() => setSelectedRoom(null)}
        />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Team Chat</h1>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#9CA3AF' }}>Messages & Channels</p>
          </div>
        </div>
        <button onClick={() => setShowNewChat(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#4F46E5', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> New Chat
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {/* Team Channels */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Hash size={14} color="#6B7280" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Channels</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {teamRooms.map(room => (
              <button key={room.id} onClick={() => setSelectedRoom(room)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: 10, backgroundColor: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#4F46E5'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: room.avatarColor || '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Hash size={16} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{room.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 1 }}>{room.memberIds.length > 0 ? `${room.memberIds.length} members` : 'All team'}</div>
                </div>
                <ChevronRight size={16} color="#9CA3AF" />
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Users size={14} color="#6B7280" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Direct Messages</span>
          </div>
          {dmRooms.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', backgroundColor: 'white', borderRadius: 10, border: '2px dashed #E5E7EB' }}>
              <UserPlus size={32} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 600, color: '#6B7280', margin: '0 0 6px', fontSize: '0.875rem' }}>No direct messages yet</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.8rem', margin: 0 }}>Click "New Chat" to start a conversation</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {dmRooms.map(room => {
                const otherMembers = TEAM_MEMBERS.filter(m => room.memberIds.includes(m.id) && m.id !== currentUserId);
                const primary = otherMembers[0];
                return (
                  <button key={room.id} onClick={() => setSelectedRoom(room)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: 10, backgroundColor: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#4F46E5'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}>
                    <div style={{ position: 'relative' }}>
                      <Avatar initials={primary?.initials || room.name.substring(0,2).toUpperCase()} color={primary?.color || room.avatarColor || '#4F46E5'} size={36} />
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{room.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 1 }}>
                        {room.type === 'group' ? `${otherMembers.length + 1} people` : 'Direct message'}
                      </div>
                    </div>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreateRoom={handleCreateRoom}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};
