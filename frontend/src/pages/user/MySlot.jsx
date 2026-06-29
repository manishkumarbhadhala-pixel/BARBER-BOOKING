import { useState, useEffect } from 'react';
import { appointmentAPI, userAPI, announcementAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './User.css';

const MySlot = () => {
  const [myAppointments, setMyAppointments] = useState([]);
  const [workingHours, setWorkingHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Appointments + Announcements ek saath load karo
      const [myRes, annRes] = await Promise.all([
        appointmentAPI.getMyAppointment(),
        announcementAPI.getCustomerAnnouncements(), // Shop ke saare barbers ke announcements
      ]);

      const appointments = myRes.data.appointments || [];
      setMyAppointments(appointments);
      setAnnouncements(annRes.data || []);

      // Working hours sirf tab lo jab booking ho
      if (appointments.length > 0) {
        const barberId = appointments[0].barberId;
        const hoursRes = await userAPI.getWorkingHours(barberId);
        setWorkingHours(hoursRes.data);
      }

    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await appointmentAPI.cancelAppointment(id);
      setMsg({ type: 'success', text: 'Booking cancelled!' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to cancel' });
    } finally {
      setCancelling(false);
    }
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="user-page">
      <div className="container">
        <h1 className="page-title">My Slot</h1>
        <p className="page-subtitle">Today — {formatDate(today)}</p>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {/* Announcements — Login hone par hamesha dikhenge */}
        {announcements.length > 0 && (
          <div className="section-block">
            <h2 className="section-title">📢 Announcements</h2>
            {announcements.map((ann) => (
              <div key={ann.id} className="card" style={{
                marginBottom: 10,
                borderLeft: '4px solid #ff9800',
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#ff9800' }}>
                  {ann.title}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                  {ann.message}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 6 }}>
                  — {ann.creator?.name} • {new Date(ann.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Meri Bookings */}
        <div className="section-block">
          <h2 className="section-title">My Bookings</h2>

          {myAppointments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myAppointments.map((appt) => (
                <div key={appt.id} className="my-booking card">
                  <div className="booking-details">
                    <div className="booking-row">
                      <span className="booking-icon">✂️</span>
                      <span><strong>{appt.serviceName}</strong></span>
                    </div>
                    {appt.barber && (
                      <div className="booking-row">
                        <span className="booking-icon">💈</span>
                        <span>Barber: <strong>{appt.barber.name}</strong></span>
                      </div>
                    )}
                    <div className="booking-row">
                      <span className="booking-icon">🕐</span>
                      <span>{formatTime(appt.slotStart)} — {formatTime(appt.slotEnd)}</span>
                    </div>
                    <div className="booking-row">
                      <span className="booking-icon">📅</span>
                      <span>{formatDate(appt.slotStart)}</span>
                    </div>
                    {appt.service && (
                      <div className="booking-row">
                        <span className="booking-icon">💰</span>
                        <span>₹{appt.service.price}</span>
                      </div>
                    )}
                  </div>
                  <div className="booking-action">
                    <span className="status-badge upcoming">Upcoming</span>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancel(appt.id)}
                      disabled={cancelling}
                      style={{ marginTop: 12, width: '100%' }}
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card empty-box">
              <p>No upcoming bookings</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: 14 }}
                onClick={() => navigate('/book')}
              >
                Book Appointment
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MySlot;