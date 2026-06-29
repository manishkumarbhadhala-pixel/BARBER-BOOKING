import { useState, useEffect } from 'react';
import { notesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // Replaced states as requested
  const [quickNote, setQuickNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saved, setSaved] = useState(false);

  // Updated useEffect to fetch both todo notes and quick note
  useEffect(() => {
    fetchNotes();
    fetchQuickNote();
  }, []);

  const fetchQuickNote = async () => {
    try {
      const { data } = await notesAPI.getQuickNote();
      setQuickNote(data.content || '');
    } catch (err) {}
  };

  const fetchNotes = async () => {
    try {
      const { data } = await notesAPI.getAll();
      setNotes(data);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load notes' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    try {
      const { data } = await notesAPI.create(input);
      setNotes([data, ...notes]);
      setInput('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add' });
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await notesAPI.toggle(id);
      setNotes(notes.map(n => n.id === id ? data : n));
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await notesAPI.delete(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to delete' });
    }
  };

  const pending = notes.filter(n => !n.isCompleted);
  const completed = notes.filter(n => n.isCompleted);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="page-title">My Notes</h1>
            <p className="page-subtitle">
              {pending.length} pending · {completed.length} completed
            </p>
          </div>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {/* Quick Text Note — Replaced to save content properly using saveQuickNote */}
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--primary)' }}>
          <h3 style={{ fontSize: 13, color: 'var(--primary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
            📄 Quick Note
          </h3>
          <textarea
            placeholder="Write anything here — payment info, reminders, notes..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            rows={5}
            style={{
              width: '100%', padding: '10px 14px',
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', color: 'var(--text-primary)',
              fontSize: 14, outline: 'none', resize: 'vertical',
              fontFamily: 'inherit', lineHeight: 1.6,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {quickNote.length} characters
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-outline"
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => setQuickNote('')}
                disabled={!quickNote}
              >
                Clear
              </button>
              <button
                className="btn btn-primary"
                style={{ fontSize: 12, padding: '6px 14px' }}
                onClick={async () => {
                  setSavingNote(true);
                  try {
                    // updated to use saveQuickNote endpoint instead of creating list items
                    const { data } = await notesAPI.saveQuickNote(quickNote);
                    setQuickNote(data.content || '');
                    setSaved(true);
                    setMsg({ type: 'success', text: 'Quick note saved successfully!' });
                    setTimeout(() => {
                      setMsg({ type: '', text: '' });
                      setSaved(false);
                    }, 2000);
                  } catch (err) {
                    setMsg({ type: 'error', text: 'Failed to save quick note' });
                    setTimeout(() => setMsg({ type: '', text: '' }), 2000);
                  } finally {
                    setSavingNote(false);
                  }
                }}
                disabled={savingNote}
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Add Note Form */}
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Add a new note... (e.g. Collect payment from Rahul)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={adding || !input.trim()}
            >
              {adding ? '...' : '+ Add'}
            </button>
          </form>
        </div>

        {/* Pending Notes */}
        {pending.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10
            }}>
              Pending ({pending.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pending.map(note => (
                <div key={note.id} className="card" style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                }}>
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleToggle(note.id)}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>
                    {note.title}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <button
                    onClick={() => handleDelete(note.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', fontSize: 16, padding: '0 4px',
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Notes */}
        {completed.length > 0 && (
          <div>
            <h3 style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10
            }}>
              Completed ({completed.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completed.map(note => (
                <div key={note.id} className="card" style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', opacity: 0.5,
                }}>
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => handleToggle(note.id)}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{
                    flex: 1, fontSize: 14,
                    textDecoration: 'line-through',
                    color: 'var(--text-secondary)',
                  }}>
                    {note.title}
                  </span>
                  <button
                    onClick={() => handleDelete(note.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', fontSize: 16, padding: '0 4px',
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notes.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            📝 No notes yet — add your first one above!
          </div>
        )}

      </div>
    </div>
  );
};

export default Notes;