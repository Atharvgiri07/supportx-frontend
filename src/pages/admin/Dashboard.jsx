import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import useCountUp from '../../utils/useCountUp';
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

const STAT_LABELS = [
  { key: 'totalTickets', label: 'Total Tickets' },
  { key: 'openTickets', label: 'Open / In Progress' },
  { key: 'resolvedTickets', label: 'Resolved' },
  { key: 'totalEmployees', label: 'Employees' },
  { key: 'totalDepartments', label: 'Departments' },
];

const PRIORITY_COLORS = {
  Low: '#94a3b8',
  Medium: '#3b82f6',
  High: '#f97316',
  Critical: '#ef4444',
};

const StatCard = ({ label, value }) => {
  const animated = useCountUp(value);
  return (
    <div className="card dashboard-stat">
      <p className="dashboard-stat-label">{label}</p>
      <h2 className="dashboard-stat-value">{animated}</h2>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loader />;

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 24 }}>
        Overview of SupportX activity
      </p>

      <div className="dashboard-stats">
        {STAT_LABELS.map(({ key, label }) => (
          <StatCard key={key} label={label} value={stats?.[key] ?? 0} />
        ))}
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
    </div>
  );
};

export default Dashboard;
