import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, shopInfo } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      // Hard redirect — navigate ki jagah window.location use karo
      if (userData.role === 'superadmin') {
        window.location.href = '/superadmin';
      } else if (userData.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/my-slot';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">✂</div>
        <h1 className="auth-title">BARBER BOOKING</h1>

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
            {shopInfo.location && (
              <span style={{ color: 'var(--text-secondary)', fontSize: 12, display: 'block' }}>
                📍 {shopInfo.location}
              </span>
            )}
          </div>
        )}

        <p className="auth-subtitle">Login to your account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrap" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
            <Link to="/forgot-password" style={{ fontSize: 13 }}>
              Forgot Password?
            </Link>
          </div>

          <button
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Register here</Link>
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

export default Login;