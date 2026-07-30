import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import useCountUp from '../../utils/useCountUp';
import { FiAlertTriangle, FiClock, FiTrendingUp, FiAward } from 'react-icons/fi';
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

const PRIORITY_COLORS = {
  Low: '#94a3b8',
  Medium: '#3b82f6',
  High: '#f97316',
  Critical: '#ef4444',
};

const StatCard = ({ label, value, icon: Icon, color, suffix = '' }) => {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div className="card dashboard-stat" style={{ borderLeft: color ? `4px solid ${color}` : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <p className="dashboard-stat-label" style={{ margin: 0 }}>{label}</p>
        {Icon && <Icon color={color} size={18} />}
      </div>
      <h2 className="dashboard-stat-value">{typeof value === 'number' ? animated : value}{suffix}</h2>
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
        setUrgentTickets(
          ticketsRes.data.filter(
            (t) => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed'
          )
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 24 }}>
        Overview of SupportX activity
      </p>

      {urgentTickets.length > 0 && (
        <div className="card dashboard-urgent">
          <div className="dashboard-urgent-header">
            <FiAlertTriangle size={18} />
            <h3>Urgent &amp; Open ({urgentTickets.length})</h3>
          </div>
          {urgentTickets.map((t) => (
            <Link key={t._id} to={`/tickets/${t._id}`} className="dashboard-urgent-item">
              <span>{t.title}</span>
              <span className="dashboard-urgent-right">
                <StatusBadge status={t.status} />
                <span className="dashboard-urgent-assignee">{t.assignedTo?.name || 'Unassigned'}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="dashboard-stats">
        <StatCard label="Total Tickets" value={stats?.totalTickets ?? 0} />
        <StatCard label="Open / In Progress" value={stats?.openTickets ?? 0} />
        <StatCard label="Resolved" value={stats?.resolvedTickets ?? 0} />
        
        <StatCard 
          label="Overdue Tickets" 
          value={stats?.overdueTickets ?? 0} 
          icon={FiAlertTriangle}
          color="var(--color-danger)"
        />
        <StatCard 
          label="Avg Resolution" 
          value={stats?.avgResolutionTime ?? 0} 
          suffix=" hrs"
          icon={FiClock}
          color="var(--color-primary)"
        />
        <StatCard 
          label="Tickets Today" 
          value={stats?.ticketsCreatedToday ?? 0} 
          icon={FiTrendingUp}
          color="var(--color-success)"
        />
      </div>

      <div className="dashboard-charts">
        <div className="card dashboard-chart">
          <h3 style={{ marginBottom: 16 }}>Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData?.byStatus || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card dashboard-chart dashboard-chart-wide">
          <h3 style={{ marginBottom: 16 }}>Tickets by Department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData?.byDepartment || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1e293b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card dashboard-performers" style={{ marginTop: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: 16 }}>Top Performers</h3>
        <div className="performers-list">
          {stats?.topPerformers?.length > 0 ? (
            stats.topPerformers.map((emp, idx) => (
              <div key={emp._id} className="performer-item">
                <div className="performer-rank">
                  {idx === 0 && <FiAward color="#fbbf24" size={24} />}
                  {idx === 1 && <FiAward color="#9ca3af" size={24} />}
                  {idx === 2 && <FiAward color="#b45309" size={24} />}
                  {idx > 2 && <span>#{idx + 1}</span>}
                </div>
                <div className="performer-info">
                  <p className="performer-name">{emp.name}</p>
                  <p className="performer-dept">{emp.department?.name || 'No Department'}</p>
                </div>
                <div className="performer-stats">
                  <span className="performer-score">{emp.performanceScore} pts</span>
                  <span className="performer-resolved">{emp.totalResolved} resolved</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
