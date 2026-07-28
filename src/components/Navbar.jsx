import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiLogOut, FiZap, FiSun, FiMoon, FiMenu } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="navbar glass-panel">
      <div className="navbar-left">
        <button
          className="navbar-mobile-toggle"
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation drawer"
        >
          <FiMenu size={20} />
        </button>
        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <FiZap size={18} />
          </div>
          <span>SupportX</span>
        </div>
      </div>

      <div className="navbar-user">
        <div className="user-profile-badge">
          <div className="avatar-circle">{getInitials(user?.name)}</div>
          <div className="user-info-text">
            <span className="navbar-name">{user?.name || 'User'}</span>
            <span className={`navbar-role role-${user?.role || 'employee'}`}>
              {user?.role || 'employee'}
            </span>
          </div>
        </div>

        <button
          className="navbar-icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>

        <button
          className="navbar-icon-btn logout-btn"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
