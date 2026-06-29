import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Suspended = ({ reason, contact, paymentDueDate }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('suspendedInfo');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shopInfo');
    logout();
    window.location.href = '/login';
  };

  // Contact parse karo — "name|upi|phone" format
  const parseContact = (c) => {
    if (!c) return {};
    const parts = c.split('|');
    return {
      name: parts[0] || null,
      upi: parts[1] || null,
      phone: parts[2] || null,
    };
  };

  const contactInfo = parseContact(contact);

  return (
    <div className="auth-page">
      <div className="auth-card card" style={{ borderColor: 'var(--error)', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h1 style={{ textAlign: 'center', color: 'var(--error)', fontSize: 20, marginBottom: 8 }}>
          Account Suspended
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
          Your account has been temporarily suspended
        </p>

        {/* Reason */}
        <div style={{
          padding: '12px 16px', background: 'rgba(244,67,54,0.1)',
          borderRadius: 8, marginBottom: 12,
          border: '1px solid var(--error)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Reason</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
            {reason || 'Payment pending'}
          </div>
        </div>

        {/* Due Date */}
        {paymentDueDate && (
          <div style={{
            padding: '12px 16px', background: 'var(--bg-input)',
            borderRadius: 8, marginBottom: 12,
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Payment Due Date</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--warning)' }}>
              📅 {new Date(paymentDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(contactInfo.name || contactInfo.upi || contactInfo.phone) && (
          <div style={{
            padding: '14px 16px', background: 'var(--bg-input)',
            borderRadius: 8, marginBottom: 24,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Contact to reactivate your account
            </div>

            {contactInfo.name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>👤</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Account Holder</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {contactInfo.name}
                  </div>
                </div>
              </div>
            )}

            {contactInfo.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>📱</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Phone / WhatsApp</div>
                  <a href={`tel:${contactInfo.phone}`}
                    style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
            )}

            {contactInfo.upi && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>💳</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>UPI ID</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', letterSpacing: 0.5 }}>
                    {contactInfo.upi}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Suspended;