import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const ShopEntry = () => {
  const [shopCode, setShopCode] = useState('');
  const [verifying, setVerifying] = useState(false); // Form submission loader
  const [error, setError] = useState('');
  
  const { saveShopInfo, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect logic: Agar already logged in h to dashboard bhej do
  useEffect(() => {
    if (loading) return;

    if (user) {
      if (user.role === 'superadmin') {
        navigate('/superadmin');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/my-slot');
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setVerifying(true);

    try {
      const { data } = await shopAPI.verifyShop(shopCode.toUpperCase());
      saveShopInfo(data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid shop code');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">✂</div>
        <h1 className="auth-title">BARBER BOOKING</h1>
        <p className="auth-subtitle">Enter your shop code to continue</p>

        {/* Super Admin Direct Login Link */}
        <p style={{ textAlign: 'center', marginTop: 12, marginBottom: 20, fontSize: 13 }}>
          Super Admin?{' '}
          <span 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} 
            onClick={() => navigate('/login')}
          >
            Login directly →
          </span>
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Shop Code</label>
            <input
              type="text"
              placeholder="e.g. ABC123"
              value={shopCode}
              onChange={(e) => setShopCode(e.target.value.toUpperCase())}
              autoComplete="off"
              required
              style={{ 
                textTransform: 'uppercase', 
                letterSpacing: 4, 
                fontSize: 18,
                textAlign: 'center' 
              }}
            />
          </div>
          
          <button 
            className="btn btn-primary auth-btn" 
            disabled={verifying}
          >
            {verifying ? 'Verifying...' : 'Continue →'}
          </button>
        </form>
        
        <p className="auth-footer" style={{ marginTop: 20, fontSize: 12, color: 'var(--text-secondary)' }}>
          Tip: Contact your barber if you don't have a code.
        </p>
      </div>
    </div>
  );
};

export default ShopEntry;