import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { connectSocket } from '../../services/socket';
import '../admin/Admin.css';

const AdminChat = () => {
  const { user } = useAuth();
  const [superadmin, setSuperadmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // ← State handle karne ke liye add kiya
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    init();
    return () => {
      socketRef.current?.off('newMessage');
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const init = async () => {
    try {
      const { data } = await chatAPI.getSuperAdmin();
      setSuperadmin(data);
      await fetchMessages(data.id);

      // Socket connect
      const socket = connectSocket(user.id);
      socketRef.current = socket;

      socket.on('newMessage', () => {
        fetchMessages(data.id);
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // fetchMessages replace kiya, ab load hone par local badge clear ho jayega
  const fetchMessages = async (sid) => {
    try {
      const { data } = await chatAPI.getMessages(sid);
      setMessages(data);
      setUnreadCount(0); // ← Local badge clear kiya
    } catch (err) {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !superadmin) return;
    setSending(true);
    try {
      await chatAPI.sendMessage(superadmin.id, input);

      // Socket se notify karo
      socketRef.current?.emit('sendMessage', {
        receiverId: superadmin.id,
        senderId: user.id,
        senderName: user.name,
        message: input,
      });

      setInput('');
      fetchMessages(superadmin.id);
    } catch (err) {}
    finally { setSending(false); }
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="container" style={{ maxWidth: 700 }}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 20, padding: '14px 18px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>👑</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{superadmin?.name || 'Super Admin'}</div>
            <div style={{ color: 'var(--success)', fontSize: 12 }}>● Online</div>
          </div>
        </div>

        <div style={{
          height: '60vh', overflowY: 'auto', padding: 16,
          background: 'var(--bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', marginBottom: 12,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto' }}>
              No messages yet — say hello! 👋
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderId === user.id;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%', padding: '10px 14px',
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

        <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1, padding: '12px 16px',
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

      </div>
    </div>
  );
};

export default AdminChat;