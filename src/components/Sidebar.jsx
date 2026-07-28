import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiInbox, FiAward, FiBarChart2, FiGrid, FiPlusCircle, 
  FiFolder, FiUsers, FiList, FiCpu, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import './Sidebar.css';

const EMPLOYEE_LINKS = [
  { to: '/tickets', label: 'My Tickets', icon: FiInbox },
  { to: '/performance', label: 'My Performance', icon: FiBarChart2 },
  { to: '/leaderboard', label: 'Leaderboard', icon: FiAward },
];

const ADMIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/create-ticket', label: 'Create Ticket', icon: FiPlusCircle },
  { to: '/all-tickets', label: 'All Tickets', icon: FiList },
  { to: '/departments', label: 'Departments', icon: FiFolder },
  { to: '/employees', label: 'Employees', icon: FiUsers },
  { to: '/ai-reports', label: 'AI Reports', icon: FiCpu },
  { to: '/leaderboard', label: 'Leaderboard', icon: FiAward },
];

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('supportx_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('supportx_sidebar_collapsed', String(next));
      return next;
    });
  };

  const links = user?.role === 'admin' ? ADMIN_LINKS : EMPLOYEE_LINKS;

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <nav className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-toggle"
            onClick={toggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
        </div>

        <div className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="sidebar-icon" />
              <span className="sidebar-label">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;


