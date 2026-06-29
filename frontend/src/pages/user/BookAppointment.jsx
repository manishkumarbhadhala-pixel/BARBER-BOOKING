import { useState, useEffect } from 'react';
import { userAPI, appointmentAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // 1. AuthContext import kiya
import { QRCodeSVG } from 'qrcode.react'; // ← QRCodeSVG library import ki
import './User.css';

const BookAppointment = () => {
  const { user } = useAuth(); // 2. User data extract kiya
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // Nayi UPI States add ki hain
  const [upiInfo, setUpiInfo] = useState({ upiEnabled: false, upiId: null });
  const [paymentDone, setPaymentDone] = useState(false);

  const minDate = new Date().toISOString().split('T')[0];

  // 1. Initial Load: Barbers load karo (With shopId filter)
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        // user object se shopId lekar API mein pass kiya
        const { data } = await userAPI.getBarbers(user?.shopId); 
        setBarbers(data);
      } catch (err) {
        setMsg({ type: 'error', text: 'Failed to load barbers' });
      }
    };

    if (user?.shopId) {
      fetchBarbers();
    } else {
      setMsg({ type: 'error', text: 'No shop selected. Please go back to home.' });
    }
  }, [user]);

  // 2. Barber select hone par uski Services load karo + UPI Check karo 💳
  useEffect(() => {
    if (!selectedBarber) return;
    
    const fetchBarberServices = async () => {
      try {
        setServices([]); 
        const { data } = await userAPI.getServices(selectedBarber.id);
        setServices(data);
        setSelectedService(null); 
      } catch (err) {
        setMsg({ type: 'error', text: 'Failed to load services' });
      }
    };
    fetchBarberServices();

    // UPI Status Check logic add kiya h
    const checkUpi = async () => {
      try {
        const { data } = await userAPI.checkUpi(selectedBarber.id);
        setUpiInfo(data);
        setPaymentDone(false);
      } catch (err) {}
    };
    checkUpi();
  }, [selectedBarber]);

  // 3. Service, Date ya Barber change hone par slots load karo
  useEffect(() => {
    if (selectedService && selectedDate && selectedBarber) {
      fetchSlots();
    }
  }, [selectedService, selectedDate, selectedBarber]);

  const fetchSlots = async () => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    setSlots([]);
    try {
      const { data } = await appointmentAPI.getAvailableSlots(
        selectedService.id,
        selectedDate,
        selectedBarber.id
      );
      setSlots(data.slots || []);
      if (data.message) {
        setMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load slots' });
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedSlot || !selectedBarber) {
      return setMsg({ type: 'error', text: 'All fields are required' });
    }
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await appointmentAPI.bookAppointment({
        serviceId: selectedService.id,
        slotStart: selectedSlot.slotStart,
        slotEnd: selectedSlot.slotEnd,
        barberId: selectedBarber.id,
        shopId: user.shopId, // Booking karte waqt shopId bhi save hogi
      });
      setMsg({ type: 'success', text: 'Booking successful! Redirecting...' });
      setTimeout(() => navigate('/my-slot'), 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Booking failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-page">
      <div className="container">
        <h1 className="page-title">Book Appointment</h1>
        <p className="page-subtitle">Select a Barber, then choose your service</p>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <div className="book-layout">
          {/* ---- Step 1: Barber choose karo ---- */}
          <div className="book-step card">
            <h3 className="step-title">Step 1 — Choose Barber</h3>
            <div className="service-options">
              {barbers.length === 0 ? (
                <p>Searching for barbers in this shop...</p>
              ) : (
                barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className={`service-option ${selectedBarber?.id === barber.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedBarber(barber);
                      setSelectedSlot(null);
                      setMsg({ type: '', text: '' });
                    }}
                  >
                    <img
                      src="/images/barber-avatar.png"
                      alt="barber"
                      style={{
                        width: 56, 
                        height: 56, 
                        borderRadius: '50%',
                        objectFit: 'cover', 
                        marginBottom: 8,
                        border: selectedBarber?.id === barber.id ? '2px solid var(--primary)' : '2px solid var(--border)',
                      }}
                    />
                    <div className="service-option-name">{barber.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ---- Step 2: Service choose karo ---- */}
          {selectedBarber && (
            <div className="book-step card">
              <h3 className="step-title">Step 2 — Choose Service</h3>
              <div className="service-options">
                {services.length === 0 ? (
                  <p>No services found for this barber.</p>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedService(service);
                        setSelectedSlot(null);
                      }}
                    >
                      <div className="service-option-icon">✂️</div>
                      <div className="service-option-name">{service.displayName}</div>
                      <div className="service-option-price">₹{service.price}</div>
                      <div className="service-option-duration">⏱ {service.durationMinutes} min</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ---- Step 3: Date choose karo ---- */}
          {selectedService && (
            <div className="book-step card">
              <h3 className="step-title">Step 3 — Choose Date</h3>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                min={minDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {/* ---- Step 4: Slot choose karo ---- */}
          {selectedService && (
            <div className="book-step card">
              <h3 className="step-title">Step 4 — Available Slots</h3>
              {slotsLoading ? (
                <div className="loading-small">Loading slots...</div>
              ) : (
                <div className="slots-grid">
                  {slots.map((slot, i) => (
                    <button
                      key={i}
                      className={`slot-btn ${!slot.isAvailable ? 'slot-busy' : ''} ${selectedSlot === slot ? 'slot-selected' : ''}`}
                      onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                      disabled={!slot.isAvailable}
                    >
                      {slot.startTime} {slot.isAvailable ? '✅' : '❌'}
                    </button>
                  ))}
                  {slots.length === 0 && !slotsLoading && <p>No slots available for this date.</p>}
                </div>
              )}
            </div>
          )}

          {/* ---- Step 5: Summary ---- */}
          {selectedSlot && (
            <div className="book-step card booking-summary">
              <h3 className="step-title">Booking Summary</h3>
              <div className="summary-row">
                <span>Barber:</span>
                <strong>{selectedBarber.name}</strong>
              </div>
              <div className="summary-row">
                <span>Service:</span>
                <strong>{selectedService.displayName}</strong>
              </div>
              <div className="summary-row">
                <span>Date:</span>
                <strong>{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
              </div>
              <div className="summary-row">
                <span>Time:</span>
                <strong>{selectedSlot.startTime} — {selectedSlot.endTime}</strong>
              </div>
              <div className="summary-row">
                <span>Price:</span>
                <strong style={{ color: 'var(--primary)' }}>₹{selectedService.price}</strong>
              </div>

              {/* UPI Payment Section — Injected before confirm button */}
              {upiInfo.upiEnabled && upiInfo.upiId && selectedService && (
                <div style={{
                  marginBottom: 16, padding: 16,
                  background: 'var(--bg-input)', borderRadius: 10,
                  border: `1px solid ${paymentDone ? 'var(--success)' : 'var(--primary)'}`,
                  textAlign: 'center', marginTop: 16
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--primary)' }}>
                    💳 Pay Before Booking
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                    Scan QR to pay ₹{selectedService.price}
                  </div>

                  {/* QR Code — UPI deep link */}
                  <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 10 }}>
                    <QRCodeSVG
                      value={`upi://pay?pa=${upiInfo.upiId}&pn=${encodeURIComponent(selectedBarber.name)}&am=${selectedService.price}&cu=INR`}
                      size={180}
                    />
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                    UPI ID: <strong style={{ color: 'var(--text-primary)' }}>{upiInfo.upiId}</strong>
                  </div>

                  {/* Payment confirm checkbox */}
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, marginTop: 14, cursor: 'pointer', fontSize: 14,
                  }}>
                    <input
                      type="checkbox"
                      checked={paymentDone}
                      onChange={(e) => setPaymentDone(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: 'var(--success)' }}
                    />
                    <span style={{ color: paymentDone ? 'var(--success)' : 'var(--text-primary)' }}>
                      {paymentDone ? '✅ Payment Done' : 'I have completed the payment'}
                    </span>
                  </label>
                </div>
              )}

              {/* Conditional Confirm button update based on UPI verification */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 8, padding: 12 }}
                onClick={handleSubmit}
                disabled={loading || (upiInfo.upiEnabled && !paymentDone)}
              >
                {loading ? 'Booking...' : upiInfo.upiEnabled && !paymentDone ? '⏳ Complete Payment First' : 'Confirm Booking ✓'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;