import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=Email, 2=OTP, 3=New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // Step 1 — Email bhejo
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const { data } = await authAPI.forgotPassword({ email });
      setMsg({ type: 'success', text: data.message });
      setStep(2);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — OTP verify karo
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const { data } = await authAPI.verifyOTP({ email, otp });
      setMsg({ type: 'success', text: data.message });
      setStep(3);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'OTP galat h' });
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Naya password set karo
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return setMsg({ type: 'error', text: 'Password must be atleast 6 character' });
    }
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const { data } = await authAPI.resetPassword({ email, otp, newPassword });
      setMsg({ type: 'success', text: data.message });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">🔑</div>
        <h1 className="auth-title">FORGOT PASSWORD</h1>

        {/* Steps indicator */}
        <div className="steps-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type}`}>{msg.text}</div>
        )}

        {/* Step 1 — Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <p className="auth-subtitle">Enter your registered email</p>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <button className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Bhej raha h...' : 'OTP Bhejo'}
            </button>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p className="auth-subtitle">
              OTP bheja gaya h <strong>{email}</strong> pe
            </p>
            <div className="form-group">
              <label>OTP (6 digits)</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                style={{ letterSpacing: 8, fontSize: 20, textAlign: 'center' }}
                required
              />
            </div>
            <button className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="btn btn-outline auth-btn"
              style={{ marginTop: 8 }}
              onClick={() => setStep(1)}
            >
              Go Back
            </button>
          </form>
        )}

        {/* Step 3 — New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p className="auth-subtitle">Set new password</p>
            <div className="form-group">
              <label>Naya Password</label>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="6+ characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login" className="auth-link">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;