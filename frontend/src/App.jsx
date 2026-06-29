import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Suspended from './pages/Suspended'; // ← Suspended Page 🚫
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageServices from './pages/admin/ManageServices';
import ManageHours from './pages/admin/ManageHours';
import BarberAnnouncements from './pages/admin/BarberAnnouncements';
import Notes from './pages/admin/Notes';
import MySlot from './pages/user/MySlot';
import BookAppointment from './pages/user/BookAppointment';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import Announcements from './pages/superadmin/Announcements';
import AdminChat from './pages/admin/Chat'; 
import SuperAdminChat from './pages/superadmin/Chat'; 

import './index.css';

// Naya standalone SuspendedPage component add kiya h jo data structure maintain karega
function SuspendedPage() {
  const info = JSON.parse(localStorage.getItem('suspendedInfo') || '{}');
  return (
    <Suspended
      reason={info.reason}
      contact={info.contact}
      paymentDueDate={info.paymentDueDate}
    />
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={
          !user ? <Login /> : (
            user.role === 'superadmin' ? <Navigate to="/superadmin" replace /> :
            user.role === 'admin' ? <Navigate to="/admin" replace /> :
            <Navigate to="/my-slot" replace />
          )
        } />

        <Route path="/register" element={!user ? <Register /> : <Navigate to="/my-slot" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Updated Suspended Route template structure */}
        <Route path="/suspended" element={<SuspendedPage />} />

        {/* SuperAdmin Routes */}
        <Route path="/superadmin" element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/announcements" element={
          <ProtectedRoute requiredRole="superadmin">
            <Announcements />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/notes" element={
          <ProtectedRoute requiredRole="superadmin">
            <Notes />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/chat" element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperAdminChat />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/services" element={
          <ProtectedRoute requiredRole="admin">
            <ManageServices />
          </ProtectedRoute>
        } />
        <Route path="/admin/hours" element={
          <ProtectedRoute requiredRole="admin">
            <ManageHours />
          </ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute requiredRole="admin">
            <BarberAnnouncements />
          </ProtectedRoute>
        } />
        <Route path="/admin/notes" element={
          <ProtectedRoute requiredRole="admin">
            <Notes />
          </ProtectedRoute>
        } />
        <Route path="/admin/chat" element={
          <ProtectedRoute requiredRole="admin">
            <AdminChat />
          </ProtectedRoute>
        } />

        {/* Customer Routes */}
        <Route path="/my-slot" element={
          <ProtectedRoute requiredRole="customer">
            <MySlot />
          </ProtectedRoute>
        } />
        <Route path="/book" element={
          <ProtectedRoute requiredRole="customer">
            <BookAppointment />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;