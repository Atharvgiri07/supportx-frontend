import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import { FiLogOut, FiZap, FiSun, FiMoon, FiUser, FiLock, FiChevronDown } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <FiZap size={18} color="var(--color-primary)" />
        SupportX
      </div>
      <div className="navbar-user">
        <NotificationBell />

        <button
          className="navbar-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>

        <div className="navbar-profile-wrapper" ref={dropdownRef}>
          <div className="navbar-profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="navbar-avatar-img" />
            ) : (
              <div className="navbar-avatar-circle">{userInitial}</div>
            )}
            <span className="navbar-name">{user?.name}</span>
            <span className="navbar-role">{user?.role}</span>
            <FiChevronDown size={14} className={`navbar-caret${dropdownOpen ? ' open' : ''}`} />
          </div>

          {dropdownOpen && (
            <div className="navbar-profile-dropdown">
              <div className="navbar-dropdown-header">
                <p className="navbar-dropdown-name">{user?.name}</p>
                <p className="navbar-dropdown-email">{user?.email}</p>
              </div>
              <div className="navbar-dropdown-divider" />
              <div
                className="navbar-dropdown-item"
                onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
              >
                <FiUser size={15} /> Edit Profile & Photo
              </div>
              <div
                className="navbar-dropdown-item"
                onClick={() => { setDropdownOpen(false); navigate('/profile?tab=password'); }}
              >
                <FiLock size={15} /> Change Password
              </div>
              <div className="navbar-dropdown-divider" />
              <div className="navbar-dropdown-item danger" onClick={handleLogout}>
                <FiLogOut size={15} /> Log out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
