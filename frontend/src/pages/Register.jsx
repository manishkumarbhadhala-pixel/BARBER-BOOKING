import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'customer',
    shopCode: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, shopInfo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Basic Validation
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    // UPDATED: Priority logic for shopCode
    const finalShopCode = shopInfo?.shopCode || form.shopCode;

    // Superadmin ko chhod kar baaki sabke liye shopCode mandatory h
    if (!finalShopCode && form.role !== 'superadmin') {
      return setError('Please enter a valid shop code');
    }

    setLoading(true);
    try {
      const data = await register(
        form.name,
        form.email,
        form.password,
        form.role,
        finalShopCode // shopInfo ya manually entered code pass ho raha h
      );

      if (form.role === 'admin') {
        setSuccessMsg(data.message || 'Registration request sent! Please wait for approval.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      navigate('/my-slot');

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">✂</div>
        <h1 className="auth-title">REGISTER</h1>

        {/* Shop Name Display (Agar code verified h) */}
        {shopInfo && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 16,
            padding: '8px 16px',
            background: 'rgba(201,168,76,0.1)',
            borderRadius: 8,
            border: '1px solid var(--primary)',
          }}>
            <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 'bold' }}>
              ✂ {shopInfo.name}
            </span>
          </div>
        )}

        <p className="auth-subtitle">Create a new account</p>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter a valid email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrap" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="6+ characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
                required
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="admin">Barber (Owner/Staff)</option>
            </select>
          </div>

          {/* Shop Code field (Conditional) */}
          {!shopInfo && form.role !== 'superadmin' && (
            <div className="form-group">
              <label>Shop Code</label>
              <input
                type="text"
                placeholder="Use code: ABC123"
                value={form.shopCode}
                onChange={(e) => setForm({ ...form, shopCode: e.target.value.toUpperCase() })}
                style={{ textTransform: 'uppercase', letterSpacing: 2 }}
                required
              />
            </div>
          )}

          {form.role === 'admin' && (
            <div className="alert alert-error" style={{ fontSize: 13, marginBottom: 15 }}>
              ⚠️ Barber accounts require Super Admin approval before you can login.
            </div>
          )}

          <button 
            className="btn btn-primary auth-btn" 
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Login here</Link>
        </p>

        {shopInfo && (
          <p className="auth-footer" style={{ marginTop: 8 }}>
            <Link to="/" className="auth-link" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              ← Change shop code
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;