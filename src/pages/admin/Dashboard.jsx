import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import useCountUp from '../../utils/useCountUp';
import { useTheme } from '../../context/ThemeContext';
import { 
  FiInbox, FiClock, FiCheckCircle, FiUsers, FiFolder, 
  FiPlusCircle, FiCpu, FiAward 
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import './Dashboard.css';

const STAT_CONFIG = [
  { key: 'totalTickets', label: 'Total Tickets', icon: FiInbox, color: '#3b82f6' },
  { key: 'openTickets', label: 'Open / In Progress', icon: FiClock, color: '#f59e0b' },
  { key: 'resolvedTickets', label: 'Resolved', icon: FiCheckCircle, color: '#10b981' },
  { key: 'totalEmployees', label: 'Employees', icon: FiUsers, color: '#6366f1' },
  { key: 'totalDepartments', label: 'Departments', icon: FiFolder, color: '#8b5cf6' },
];

const PRIORITY_COLORS = {
  Low: '#94a3b8',
  Medium: '#3b82f6',
  High: '#f59e0b',
  Critical: '#ef4444',
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const animated = useCountUp(value);
  return (
    <div className="card dashboard-stat">
      <div className="stat-header">
        <span className="dashboard-stat-label">{label}</span>
        <div className="stat-icon-wrap" style={{ color, background: `${color}18` }}>
          <Icon size={18} />
        </div>
      </div>
      <h2 className="dashboard-stat-value">{animated}</h2>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-recharts-tooltip">
        <p className="tooltip-label">{label || payload[0].name}</p>
        <p className="tooltip-value">{`${payload[0].name || 'Count'}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/chart-data'),
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader type="card" count={4} />;

  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';

  return (
    <div>
      <div className="dashboard-header-row">
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            System overview and helpdesk metrics
          </p>
        </div>

        <div className="quick-actions-bar">
          <Link to="/create-ticket" className="btn btn-primary btn-sm">
            <FiPlusCircle size={15} /> Create Ticket
          </Link>
          <Link to="/ai-reports" className="btn btn-secondary btn-sm">
            <FiCpu size={15} /> AI Reports
          </Link>
          <Link to="/leaderboard" className="btn btn-secondary btn-sm">
            <FiAward size={15} /> Leaderboard
          </Link>
        </div>
      </div>

      <div className="dashboard-stats">
        {STAT_CONFIG.map(({ key, label, icon, color }) => (
          <StatCard
            key={key}
            label={label}
            value={stats?.[key] ?? 0}
            icon={icon}
            color={color}
          />
        ))}
      </div>

      <div className="dashboard-charts">
        <div className="card dashboard-chart">
          <h3 style={{ marginBottom: 16 }}>Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData?.byStatus || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="_id" tick={{ fill: tickColor, fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: tickColor, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card dashboard-chart">
          <h3 style={{ marginBottom: 16 }}>Tickets by Priority</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData?.byPriority || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => entry._id}
              >
                {(chartData?.byPriority || []).map((entry) => (
                  <Cell key={entry._id} fill={PRIORITY_COLORS[entry._id] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card dashboard-chart dashboard-chart-wide">
          <h3 style={{ marginBottom: 16 }}>Tickets by Department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData?.byDepartment || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="department" tick={{ fill: tickColor, fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: tickColor, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

