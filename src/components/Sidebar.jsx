import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiInbox,
  FiAward,
  FiBarChart2,
  FiGrid,
  FiPlusCircle,
  FiFolder,
  FiUsers,
  FiList,
  FiCpu,
  FiChevronLeft,
  FiChevronRight,
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

const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('supportx_sidebar_collapsed') === 'true');
  const links = user?.role === 'admin' ? ADMIN_LINKS : EMPLOYEE_LINKS;

  useEffect(() => {
    localStorage.setItem('supportx_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <nav className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
      </button>

      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          title={collapsed ? label : undefined}
        >
          <Icon size={18} />
          <span className="sidebar-link-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;
