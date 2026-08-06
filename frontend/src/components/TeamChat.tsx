import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { chatService } from '../services/chatService';
import type { ChatMessage } from '../services/chatService';
import { Send, Paperclip, Smile, Check, CheckCheck } from 'lucide-react';
interface TeamChatProps {
  roomId: string;
  roomName: string;
  members: { name: string, userId: string, role: string }[];
}

export const TeamChat: React.FC<TeamChatProps> = ({ roomId, roomName, members }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = chatService.subscribeToMessages(roomId, (msgs) => {
      setMessages(msgs);
      // Mark latest messages as read
      if (user) {
        msgs.forEach(m => {
          if (!m.readBy?.includes(user.uid)) {
            chatService.markAsRead(m.id, user.uid, m.readBy || []);
          }
        });
      }
    });
    return () => unsubscribe();
  }, [roomId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    try {
      await chatService.sendMessage({
        chatRoomId: roomId,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Unknown',
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', border: '1px solid #E5E7EB', borderRadius: '12px', backgroundColor: 'white', overflow: 'hidden' }}>
      
      {/* Chat Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}># {roomName}</h2>
          <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>{members.length} members</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {members.slice(0, 3).map((m, i) => (
            <div key={i} title={m.name} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600, border: '2px solid white', marginLeft: i > 0 ? '-10px' : '0' }}>
              {getInitials(m.name)}
            </div>
          ))}
          {members.length > 3 && (
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600, border: '2px solid white', marginLeft: '-10px' }}>
              +{members.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF', margin: 'auto 0' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '12px', alignItems: 'flex-end' }}>
                {!isMe && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                    {getInitials(msg.senderName)}
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  {!isMe && <span style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px', marginLeft: '4px' }}>{msg.senderName}</span>}
                  
                  <div style={{ 
                    padding: '10px 14px', 
                    borderRadius: '16px', 
                    backgroundColor: isMe ? '#4F46E5' : '#F3F4F6',
                    color: isMe ? 'white' : '#111827',
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    borderBottomRightRadius: isMe ? '4px' : '16px',
                    borderBottomLeftRadius: !isMe ? '4px' : '16px',
                  }}>
                    {msg.message}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.7rem', color: '#9CA3AF' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && (
                      msg.readBy && msg.readBy.length > 1 ? <CheckCheck size={14} color="#10B981" /> : <Check size={14} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', border: '1px solid #D1D5DB', borderRadius: '24px', padding: '6px 16px' }}>
          <button type="button" style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}>
            <Paperclip size={20} />
          </button>
          
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 0', fontSize: '0.875rem' }}
          />
          
          <button type="button" style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}>
            <Smile size={20} />
          </button>
          
          <button type="submit" disabled={!newMessage.trim()} style={{ 
            background: newMessage.trim() ? '#4F46E5' : '#E5E7EB', 
            border: 'none', 
            color: 'white', 
            width: '32px', height: '32px', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: newMessage.trim() ? 'pointer' : 'default',
            transition: 'all 0.2s'
          }}>
            <Send size={16} />
          </button>
        </form>
      </div>

    </div>
  );
};
