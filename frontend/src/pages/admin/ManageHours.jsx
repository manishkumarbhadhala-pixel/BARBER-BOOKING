import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './Admin.css';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const ManageHours = () => {
  const [form, setForm] = useState({
    startTime: '09:00', endTime: '18:00',
    breakStart: '', breakEnd: '', offDays: [0],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Nayi UPI States add ki hain
  const [upi, setUpi] = useState({ upiId: '', upiEnabled: false });
  const [upiSaving, setUpiSaving] = useState(false);
  const [upiMsg, setUpiMsg] = useState({ type: '', text: '' });

  // Working Hours aur UPI Settings dono fetch honge ab
  useEffect(() => { 
    fetchHours(); 
    fetchUpi(); 
  }, []);

  const fetchHours = async () => {
    try {
      const { data } = await adminAPI.getWorkingHours();
      if (data) {
        setForm({
          startTime: data.startTime || '09:00',
          endTime: data.endTime || '18:00',
          breakStart: data.breakStart || '',
          breakEnd: data.breakEnd || '',
          offDays: data.offDays ? data.offDays.split(',').map(Number) : [0],
        });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load working hours' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUpi = async () => {
    try {
      const { data } = await adminAPI.getUpiSettings();
      setUpi({ upiId: data.upiId || '', upiEnabled: data.upiEnabled || false });
    } catch (err) {}
  };

  const toggleOffDay = (val) => {
    setForm((prev) => ({
      ...prev,
      offDays: prev.offDays.includes(val)
        ? prev.offDays.filter((d) => d !== val)
        : [...prev.offDays, val],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await adminAPI.updateWorkingHours(form);
      setMsg({ type: 'success', text: 'Working hours saved!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="page-title">Working Hours</h1>
        <p className="page-subtitle">set your schedule</p>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <div className="card" style={{ maxWidth: 500 }}>

          <h3 className="section-label">Shop Timing</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>

          <h3 className="section-label" style={{ marginTop: 16 }}>Break Time (Optional)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Break Start</label>
              <input type="time" value={form.breakStart}
                onChange={(e) => setForm({ ...form, breakStart: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Break End</label>
              <input type="time" value={form.breakEnd}
                onChange={(e) => setForm({ ...form, breakEnd: e.target.value })} />
            </div>
          </div>

          <h3 className="section-label" style={{ marginTop: 16 }}>Off Days</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {DAYS.map((day) => (
              <button key={day.value}
                className={`btn ${form.offDays.includes(day.value) ? 'btn-danger' : 'btn-outline'}`}
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={() => toggleOffDay(day.value)}>
                {day.label}
              </button>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }}
            onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Hours'}
          </button>

          {/* UPI Settings Section Add kiya h */}
          <div style={{ marginTop: 28 }}>
            <h3 className="section-label">UPI Payment Settings</h3>
            
            {upiMsg.text && <div className={`alert alert-${upiMsg.type}`}>{upiMsg.text}</div>}

            {/* Toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', background: 'var(--bg-input)',
              borderRadius: 'var(--radius)', marginBottom: 14,
              border: `1px solid ${upi.upiEnabled ? 'var(--success)' : 'var(--border)'}`,
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>UPI Payment</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {upi.upiEnabled ? '✅ Customers must pay before booking' : '⭕ Payment not required'}
                </div>
              </div>
              <button
                onClick={async () => {
                  const newVal = !upi.upiEnabled;
                  setUpi(prev => ({ ...prev, upiEnabled: newVal }));
                  try {
                    await adminAPI.updateUpiSettings({ upiEnabled: newVal });
                  } catch (err) {}
                }}
                style={{
                  padding: '6px 18px', borderRadius: 20, border: 'none',
                  background: upi.upiEnabled ? 'var(--success)' : 'var(--border)',
                  color: upi.upiEnabled ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  transition: 'all 0.2s',
                }}
              >
                {upi.upiEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* UPI ID Input */}
            <div className="form-group">
              <label>Your UPI ID</label>
              <input
                type="text"
                placeholder="e.g. mohit@upi or 9876543210@paytm"
                value={upi.upiId}
                onChange={(e) => setUpi(prev => ({ ...prev, upiId: e.target.value }))}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={async () => {
                if (!upi.upiId.trim()) return setUpiMsg({ type: 'error', text: 'UPI ID required' });
                setUpiSaving(true);
                try {
                  await adminAPI.updateUpiSettings({ upiId: upi.upiId });
                  setUpiMsg({ type: 'success', text: 'UPI settings saved!' });
                  setTimeout(() => setUpiMsg({ type: '', text: '' }), 3000);
                } catch (err) {
                  setUpiMsg({ type: 'error', text: 'Save failed' });
                } finally { setUpiSaving(false); }
              }}
              disabled={upiSaving}
            >
              {upiSaving ? 'Saving...' : 'Save UPI ID'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageHours;
