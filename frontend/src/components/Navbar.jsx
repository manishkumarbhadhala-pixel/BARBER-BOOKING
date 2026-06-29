import { useState, useEffect } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../services/socket'; 
import api from '../services/api'; 
import './Navbar.css';

const Navbar = () => {
  // useAuth se theme aur toggleTheme nikala
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0); 

  const fetchUnread = async () => {
    try {
      const endpoint = user.role === 'superadmin' 
        ? '/chat/superadmin/unread-count' 
        : '/chat/unread-count';
      const { data } = await api.get(endpoint);
      setUnread(data.count);
    } catch (err) {}
  };

  useEffect(() => {
    if (!user || user.role === 'customer') return;

    const socket = connectSocket(user.id);
    fetchUnread();

    socket.on('unreadUpdate', () => {
      fetchUnread();
    });

    const isChatPage = 
      location.pathname === '/admin/chat' || 
      location.pathname === '/superadmin/chat';
      
    if (isChatPage) setUnread(0);

    return () => {
      socket.off('unreadUpdate');
    };
  }, [user, location.pathname]); 

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">✂ BARBER BOOKING</div>

      {user && (
        <>
          {/* Desktop Links */}
          <div className="navbar-links desktop-links">
            {user.role === 'superadmin' && (
              <>
                <Link to="/superadmin" className={isActive('/superadmin') ? 'active' : ''}>👑 Super Admin</Link>
                <Link to="/superadmin/announcements" className={isActive('/superadmin/announcements') ? 'active' : ''}>📢 Announcements</Link>
                <Link to="/superadmin/notes" className={isActive('/superadmin/notes') ? 'active' : ''}>📝 Notes</Link>
                <Link to="/superadmin/chat" className={isActive('/superadmin/chat') ? 'active' : ''}>
                  💬 Chat {unread > 0 && <span className="badge">{unread}</span>}
                </Link> 
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Dashboard</Link>
                <Link to="/admin/services" className={isActive('/admin/services') ? 'active' : ''}>Services</Link>
                <Link to="/admin/hours" className={isActive('/admin/hours') ? 'active' : ''}>Hours</Link>
                <Link to="/admin/announcements" className={isActive('/admin/announcements') ? 'active' : ''}>📢 Announcements</Link>
                <Link to="/admin/notes" className={isActive('/admin/notes') ? 'active' : ''}>📝 Notes</Link>
                <Link to="/admin/chat" className={isActive('/admin/chat') ? 'active' : ''}>
                  💬 Chat {unread > 0 && <span className="badge">{unread}</span>}
                </Link> 
              </>
            )}
            {user.role === 'customer' && (
              <>
                <Link to="/my-slot" className={isActive('/my-slot') ? 'active' : ''}>My Slot</Link>
                <Link to="/book" className={isActive('/book') ? 'active' : ''}>Book</Link>
              </>
            )}
          </div>

          {/* Desktop Right */}
          <div className="navbar-right desktop-links">
            <span>{user.role === 'admin' || user.role === 'superadmin' ? '👑' : '👤'} {user.name}</span>
            
            {/* Desktop Theme Toggle Button add kiya */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 20, padding: '5px 12px',
                cursor: 'pointer', fontSize: 14,
                color: 'var(--text-primary)', marginRight: 4,
              }}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>

            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </>
      )}

      {/* Mobile Dropdown Menu */}
      {user && menuOpen && (
        <div className="mobile-menu" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="mobile-user">
            {user.role === 'admin' || user.role === 'superadmin' ? '👑' : '👤'} {user.name}
          </div>

          {user.role === 'superadmin' && (
            <>
              <Link to="/superadmin" onClick={closeMenu} className={isActive('/superadmin') ? 'active' : ''}>👑 Super Admin</Link>
              <Link to="/superadmin/announcements" onClick={closeMenu} className={isActive('/superadmin/announcements') ? 'active' : ''}>📢 Announcements</Link>
              <Link to="/superadmin/notes" onClick={closeMenu} className={isActive('/superadmin/notes') ? 'active' : ''}>📝 Notes</Link>
              <Link to="/superadmin/chat" onClick={closeMenu} className={isActive('/superadmin/chat') ? 'active' : ''}>
                💬 Chat {unread > 0 && <span className="badge">{unread}</span>}
              </Link> 
            </>
          )}
          {user.role === 'admin' && (
            <>
              <Link to="/admin" onClick={closeMenu} className={isActive('/admin') ? 'active' : ''}>Dashboard</Link>
              <Link to="/admin/services" onClick={closeMenu} className={isActive('/admin/services') ? 'active' : ''}>Services</Link>
              <Link to="/admin/hours" onClick={closeMenu} className={isActive('/admin/hours') ? 'active' : ''}>Hours</Link>
              <Link to="/admin/announcements" onClick={closeMenu} className={isActive('/admin/announcements') ? 'active' : ''}>📢 Announcements</Link>
              <Link to="/admin/notes" onClick={closeMenu} className={isActive('/admin/notes') ? 'active' : ''}>📝 Notes</Link>
              <Link to="/admin/chat" onClick={closeMenu} className={isActive('/admin/chat') ? 'active' : ''}>
                💬 Chat {unread > 0 && <span className="badge">{unread}</span>}
              </Link> 
            </>
          )}
          {user.role === 'customer' && (
            <>
              <Link to="/my-slot" onClick={closeMenu} className={isActive('/my-slot') ? 'active' : ''}>My Slot</Link>
              <Link to="/book" onClick={closeMenu} className={isActive('/book') ? 'active' : ''}>Book</Link>
            </>
          )}

          {/* Mobile Theme Toggle Button add kiya */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 20, padding: '8px 16px',
              cursor: 'pointer', fontSize: 14,
              color: 'var(--text-primary)', margin: '4px 20px',
              textAlign: 'left',
            }}
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <button className="btn btn-danger" style={{ margin: '8px 20px' }} onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;