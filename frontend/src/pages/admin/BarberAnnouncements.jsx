import { useState, useEffect } from 'react';
import { announcementAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../admin/Admin.css';

const BarberAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [form, setForm] = useState({ title: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await announcementAPI.getBarberAnnouncements(user.id);
      setAnnouncements(data);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load announcements' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.message) {
      return setMsg({ type: 'error', text: 'Title and message are required' });
    }
    setSubmitting(true);
    try {
      await announcementAPI.createBarberAnnouncement(form);
      setForm({ title: '', message: '' });
      setMsg({ type: 'success', text: 'Announcement sent to your customers!' });
      fetchAnnouncements();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementAPI.delete(id);
      setMsg({ type: 'success', text: 'Deleted successfully' });
      fetchAnnouncements();
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to delete' });
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="page-title">Announcements</h1>
        <p className="page-subtitle">Send notices to your customers</p>

        {msg.text && (
          <div className={`alert alert-${msg.type}`}>{msg.text}</div>
        )}

        {/* Create Form */}
        <div className="card" style={{ marginBottom: 24, borderColor: '#ff9800' }}>
          <h3 style={{ color: '#ff9800', marginBottom: 16 }}>
            📢 New Announcement
          </h3>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g. Holiday Notice"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              placeholder="Write your message here..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: 14,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={submitting}
          >
            {submitting ? 'Sending...' : '📢 Send to Customers'}
          </button>
        </div>

        {/* List */}
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
          Previous Announcements ({announcements.length})
        </h3>

        {announcements.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
            No announcements yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.map((ann) => (
              <div key={ann.id} className="card" style={{ borderLeft: '4px solid #ff9800' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#ff9800' }}>
                      📢 {ann.title}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>
                      {ann.message}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                      {formatDate(ann.createdAt)}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => handleDelete(ann.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarberAnnouncements;