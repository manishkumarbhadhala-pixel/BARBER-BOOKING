import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { connectSocket } from '../../services/socket';

const SuperAdminChat = () => {
  const { user } = useAuth();
  const [adminList, setAdminList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    fetchAdminList();

    const socket = connectSocket(user.id);
    socketRef.current = socket;

    socket.on('newMessage', ({ senderId }) => {
      // Agar selected admin ne message bheja to conversation refresh karo
      if (selectedRef.current?.id === senderId) {
        fetchMessages(senderId);
      }
      // Sidebar unread update
      fetchAdminList();
    });

    return () => {
      socket.off('newMessage');
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAdminList = async () => {
    try {
      const { data } = await chatAPI.getAdminList();
      setAdminList(data);
    } catch (err) {}
    finally { setLoading(false); }
  };

  // selectAdmin functionality with sidebar unread refresh update
  const selectAdmin = async (admin) => {
    setSelected(admin);
    selectedRef.current = admin;
    setMessages([]);
    await fetchMessages(admin.id);
    // List refresh karo taaki sidebar badge bhi clear ho
    fetchAdminList();
  };

  const fetchMessages = async (adminId) => {
    try {
      const { data } = await chatAPI.getSuperAdminMessages(adminId);
      setMessages(data);
    } catch (err) {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selected) return;
    setSending(true);
    try {
      await chatAPI.sendSuperAdminMessage(selected.id, input);

      socketRef.current?.emit('sendMessage', {
        receiverId: selected.id,
        senderId: user.id,
        senderName: user.name,
        message: input,
      });

      setInput('');
      fetchMessages(selected.id);
    } catch (err) {}
    finally { setSending(false); }
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div style={{ height: 'calc(100vh - 60px)', display: 'flex' }}>

      {/* Sidebar */}
      <div style={{
        width: 280, borderRight: '1px solid var(--border)',
        background: 'var(--bg-card)', overflowY: 'auto', flexShrink: 0,
      }}>
        <div style={{
          padding: '16px 18px', borderBottom: '1px solid var(--border)',
          fontWeight: 700, fontSize: 15, color: 'var(--primary)',
        }}>
          💬 Chats
        </div>

        {adminList.length === 0 ? (
          <div style={{ padding: 20, color: 'var(--text-secondary)', fontSize: 13 }}>No admins yet</div>
        ) : (
          adminList.map((admin) => (
            <div key={admin.id} onClick={() => selectAdmin(admin)} style={{
              padding: '14px 18px', cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
              background: selected?.id === admin.id ? 'rgba(201,168,76,0.1)' : 'transparent',
              transition: 'background 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--bg-input)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>💈</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{admin.name}</span>
                    {admin.lastTime && (
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                        {formatDate(admin.lastTime)}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2,
                  }}>
                    {admin.lastMessage || 'No messages yet'}
                  </div>
                </div>
                {admin.unread > 0 && (
                  <div style={{
                    background: 'var(--primary)', color: '#000',
                    borderRadius: '50%', minWidth: 20, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {admin.unread > 99 ? '99+' : admin.unread}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selected ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div>Select an admin to start chatting</div>
          </div>
        ) : (
          <>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              background: 'var(--bg-card)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>💈</div>
              <div>
                <div style={{ fontWeight: 600 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selected.email}</div>
              </div>
            </div>

            <div style={{
              flex: 1, overflowY: 'auto', padding: 16,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto' }}>
                  No messages yet
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.senderId === user.id;
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '65%', padding: '10px 14px',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMine ? 'var(--primary)' : 'var(--bg-input)',
                      color: isMine ? '#000' : 'var(--text-primary)',
                      fontSize: 14, lineHeight: 1.5,
                    }}>
                      <div>{msg.message}</div>
                      <div style={{ fontSize: 10, marginTop: 4, textAlign: 'right', opacity: 0.7 }}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{
              padding: '12px 16px', borderTop: '1px solid var(--border)',
              display: 'flex', gap: 10, background: 'var(--bg-card)',
            }}>
              <input
                type="text"
                placeholder={`Message ${selected.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  flex: 1, padding: '10px 16px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                }}
              />
              <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()}>
                {sending ? '...' : 'Send ➤'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminChat;