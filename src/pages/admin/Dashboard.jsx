import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import useCountUp from '../../utils/useCountUp';
import { FiAlertTriangle, FiInbox, FiClock, FiCheckCircle, FiUsers, FiFolder, FiAward } from 'react-icons/fi';
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
  { key: 'resolvedTickets', label: 'Resolved Tickets', icon: FiCheckCircle, color: '#10b981' },
  { key: 'overdueTickets', label: 'Overdue Items', icon: FiAlertTriangle, color: '#ef4444' },
  { key: 'totalEmployees', label: 'Employees', icon: FiUsers, color: '#8b5cf6' },
  { key: 'totalDepartments', label: 'Departments', icon: FiFolder, color: '#ec4899' },
];

const PRIORITY_COLORS = {
  Low: '#94a3b8',
  Medium: '#3b82f6',
  High: '#f97316',
  Critical: '#ef4444',
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div className="card dashboard-stat">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="dashboard-stat-label">{label}</p>
        {Icon && <Icon size={20} color={color} />}
      </div>
      <h2 className="dashboard-stat-value" style={{ color: color || 'var(--color-text)' }}>{animated}</h2>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [urgentTickets, setUrgentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, chartRes, ticketsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/chart-data'),
          api.get('/tickets'),
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data);
        const tList = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
        setUrgentTickets(
          tList.filter(
            (t) => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed'
          )
        );
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 24 }}>
        Real-time analytics, SLA tracking, and ticket metrics
      </p>

      {urgentTickets.length > 0 && (
        <div className="card dashboard-urgent">
          <div className="dashboard-urgent-header">
            <FiAlertTriangle size={18} color="var(--color-danger)" />
            <h3>Urgent & Critical Tickets ({urgentTickets.length})</h3>
          </div>
          {urgentTickets.map((t) => (
            <Link key={t._id} to={`/tickets/${t._id}`} className="dashboard-urgent-item">
              <span style={{ fontWeight: 600 }}>{t.title}</span>
              <span className="dashboard-urgent-right">
                <StatusBadge status={t.status} />
                <span className="dashboard-urgent-assignee">{t.assignedTo?.name || 'Unassigned'}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="dashboard-stats">
        {STAT_CONFIG.map(({ key, label, icon, color }) => (
          <StatCard key={key} label={label} value={stats?.[key] ?? 0} icon={icon} color={color} />
        ))}
      </div>

      <div className="dashboard-charts">
        <div className="card dashboard-chart">
          <h3 style={{ marginBottom: 16 }}>Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData?.byStatus || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} name="Tickets" />
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
                label={(entry) => `${entry._id} (${entry.count})`}
              >
                {(chartData?.byPriority || []).map((entry) => (
                  <Cell key={entry._id} fill={PRIORITY_COLORS[entry._id] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card dashboard-chart dashboard-chart-wide">
          <h3 style={{ marginBottom: 16 }}>Tickets by Department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData?.byDepartment || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Tickets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats?.topPerformers?.length > 0 && (
        <div className="card" style={{ marginTop: 24, padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}><FiAward size={18} color="#eab308" /> Top Employee Performers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {stats.topPerformers.map((emp, index) => (
              <div key={emp._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>#{index + 1}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{emp.department?.name || 'Employee'}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600, marginTop: 2 }}>{emp.performanceScore} pts • {emp.totalResolved} resolved</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
