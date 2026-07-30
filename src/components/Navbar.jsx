import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiLogOut, FiZap, FiSun, FiMoon } from 'react-icons/fi';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <FiZap size={18} />
        SupportX
      </div>
      <div className="navbar-user">
        {user && <NotificationBell />}
        <span className="navbar-name">{user?.name}</span>
        <span className="navbar-role">{user?.role}</span>
        <button
          className="navbar-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>
        <button className="navbar-logout" onClick={handleLogout} aria-label="Log out">
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
