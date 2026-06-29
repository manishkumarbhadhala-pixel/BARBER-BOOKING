import { useState, useEffect } from 'react';
import { adminAPI, announcementAPI } from '../../services/api';
import './Admin.css';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [announcements, setAnnouncements] = useState([]);

  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkIn, setWalkIn] = useState({ customerName: '', serviceId: '', slotStart: '' });
  const [services, setServices] = useState([]);
  const [walkInLoading, setWalkInLoading] = useState(false);

  // 'none' | 'daily' | 'monthly'
  const [activePanel, setActivePanel] = useState('none');

  const [income, setIncome] = useState({ totalIncome: 0, completedCount: 0, breakdown: {} });
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    fetchIncome();
    fetchAnnouncements();
  }, [selectedDate]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await announcementAPI.getAll();
      setAnnouncements(data);
    } catch (err) {}
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAppointments(selectedDate);
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await adminAPI.getServices();
      setServices(data);
    } catch (err) {}
  };

  const fetchIncome = async () => {
    try {
      const { data } = await adminAPI.getDailyIncome(selectedDate);
      setIncome(data);
    } catch (err) {}
  };

  const fetchMonthlyData = async () => {
    setMonthlyLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const promises = [];
      for (let m = 1; m <= currentMonth; m++) {
        promises.push(adminAPI.getMonthlyIncome(m, currentYear));
      }
      const results = await Promise.all(promises);
      // Sirf jo months mein kuch earning hai
      setMonthlyData(results.map(r => r.data).filter(d => d.completedCount > 0));
    } catch (err) {}
    finally { setMonthlyLoading(false); }
  };

  // Toggle logic — ek hi panel open rahega
  const handlePanelToggle = (panel) => {
    if (activePanel === panel) {
      setActivePanel('none');
    } else {
      setActivePanel(panel);
      if (panel === 'monthly') fetchMonthlyData();
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      const { data } = await adminAPI.markComplete(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, isCompleted: data.isCompleted } : a));
      fetchIncome();
    } catch (err) {
      alert('Error: ' + err.response?.data?.message);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await adminAPI.adminCancel(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      fetchIncome();
    } catch (err) {
      alert('Error: ' + err.response?.data?.message);
    }
  };

  const handleWalkIn = async () => {
    if (!walkIn.customerName || !walkIn.serviceId || !walkIn.slotStart) {
      return alert('Please fill all required fields.');
    }
    const service = services.find(s => s.id === Number(walkIn.serviceId));
    const slotStart = new Date(`${selectedDate}T${walkIn.slotStart}:00`);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + service.durationMinutes);

    setWalkInLoading(true);
    try {
      await adminAPI.adminBook({
        customerName: walkIn.customerName,
        serviceId: Number(walkIn.serviceId),
        slotStart: slotStart.toISOString(),
        slotEnd: slotEnd.toISOString(),
      });
      setShowWalkIn(false);
      setWalkIn({ customerName: '', serviceId: '', slotStart: '' });
      fetchAppointments();
      fetchIncome();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setWalkInLoading(false);
    }
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const completed = appointments.filter(a => a.isCompleted).length;

  return (
    <div className="admin-page">
      <div className="container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">{appointments.length} Appointments · {completed} Completed</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="date" value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px' }}
            />
            <button className="btn btn-primary" onClick={() => setShowWalkIn(!showWalkIn)}>➕ Walk-in</button>
            <button
              className={`btn ${activePanel === 'daily' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handlePanelToggle('daily')}
            >💰 Earnings</button>
            <button
              className={`btn ${activePanel === 'monthly' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handlePanelToggle('monthly')}
            >📊 Monthly</button>
          </div>
        </div>

        {/* Walk-in Form */}
        {showWalkIn && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: 16 }}>New Walk-in Booking</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div className="form-group">
                <label>Customer Name</label>
                <input placeholder="Enter name" value={walkIn.customerName}
                  onChange={(e) => setWalkIn({ ...walkIn, customerName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Service</label>
                <select value={walkIn.serviceId} onChange={(e) => setWalkIn({ ...walkIn, serviceId: e.target.value })}>
                  <option value="">Select Service</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.displayName} — ₹{s.price} ({s.durationMinutes} min)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" value={walkIn.slotStart}
                  onChange={(e) => setWalkIn({ ...walkIn, slotStart: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={handleWalkIn} disabled={walkInLoading}>
                {walkInLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowWalkIn(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Daily Earnings Panel */}
        {activePanel === 'daily' && (
          <div className="card" style={{ marginBottom: 20, borderColor: 'var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ color: 'var(--primary)' }}>💰 Today's Earnings</h3>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
                ₹{income.totalIncome.toFixed(2)}
              </span>
            </div>
            {Object.keys(income.breakdown).length > 0 ? (
              <div className="income-breakdown">
                {Object.entries(income.breakdown).map(([service, data]) => (
                  <div key={service} className="breakdown-row">
                    <span>✂ {service} × {data.count}</span>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{data.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="breakdown-total">
                  <span>{income.completedCount} completed</span>
                  <span>₹{income.totalIncome.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No completed services yet</p>
            )}
          </div>
        )}

        {/* Monthly Earnings Panel */}
        {activePanel === 'monthly' && (
          <div className="card" style={{ marginBottom: 20, borderColor: 'var(--success)' }}>
            <h3 style={{ color: 'var(--success)', marginBottom: 16 }}>📊 Monthly Earnings</h3>

            {monthlyLoading ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>Loading...</div>
            ) : monthlyData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>
                No earnings yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...monthlyData].reverse().map((m) => {
                  const isCurrent = m.month === new Date().getMonth() + 1;
                  return (
                    <div key={`${m.month}-${m.year}`} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', borderRadius: 10,
                      background: isCurrent ? 'rgba(201,168,76,0.08)' : 'var(--bg-input)',
                      border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border)',
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>
                          {MONTHS[m.month - 1]} {m.year}
                        </span>
                        {isCurrent && (
                          <span style={{
                            marginLeft: 8, fontSize: 10, background: 'var(--primary)',
                            color: '#000', borderRadius: 4, padding: '2px 6px', fontWeight: 600,
                          }}>CURRENT</span>
                        )}
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                          {m.completedCount} services completed
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--success)' }}>
                        ₹{m.totalIncome.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="card" style={{ marginBottom: 20, borderColor: '#ff9800' }}>
            <h3 style={{ color: '#ff9800', marginBottom: 12, fontSize: 14 }}>📢 Announcements ({announcements.length})</h3>
            {announcements.map(ann => (
              <div key={ann.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#e65100' }}>{ann.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{ann.message}</div>
              </div>
            ))}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {/* Appointments */}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            📅 No appointments for this day
          </div>
        ) : (
          <div className="appt-list">
            {appointments.map(appt => (
              <div key={appt.id} className={`appt-card card ${appt.isCompleted ? 'completed' : ''}`}>
                <div className="appt-time">
                  <span>{formatTime(appt.slotStart)}</span>
                  <span className="time-sep">↓</span>
                  <span>{formatTime(appt.slotEnd)}</span>
                </div>
                <div className="appt-info">
                  <div className="appt-customer">👤 <strong>{appt.customerName}</strong></div>
                  <div className="appt-service">{appt.serviceName}</div>
                  <div className="appt-price" style={{ color: 'var(--primary)', fontSize: 13 }}>
                    ₹{appt.service?.price}
                    {appt.bookedBy === 'admin' && <span className="walk-in-badge"> • Walk-in</span>}
                  </div>
                </div>
                <div className="appt-actions">
                  <label className="check-label">
                    <input type="checkbox" checked={appt.isCompleted} onChange={() => handleToggleComplete(appt.id)} />
                    <span>{appt.isCompleted ? 'Completed ✅' : 'Pending'}</span>
                  </label>
                  <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => handleCancel(appt.id)}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;