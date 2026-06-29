import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Jab tak authentication check ho raha hai
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // 1. Agar user logged in nahi hai -> Login page par bhej do
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Agar koi specific role required hai aur user ka role match nahi karta
  if (requiredRole && user.role !== requiredRole) {
    // Role mismatch hone par sahi dashboard par redirect karo
    if (user.role === 'superadmin') {
      return <Navigate to="/superadmin" replace />;
    }
    
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }

    // Default: Customers ya koi aur role -> My Slot page
    return <Navigate to="/my-slot" replace />;
  }

  // Sab theek hai to requested page dikhao
  return children;
};

export default ProtectedRoute;