import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiZap } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
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
        <span className="navbar-name">{user?.name}</span>
        <span className="navbar-role">{user?.role}</span>
        <button className="navbar-logout" onClick={handleLogout} aria-label="Log out">
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
