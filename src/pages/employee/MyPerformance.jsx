import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import BadgeCard from '../../components/BadgeCard';
import useCountUp from '../../utils/useCountUp';
import { FiAward, FiCheckCircle, FiClock, FiTrendingUp, FiBarChart2, FiCalendar } from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './MyPerformance.css';

const StatCard = ({ label, value, icon: Icon, color, bgTint, suffix = '' }) => {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div className="performance-stat-card">
      <div className="performance-stat-top">
        <span className="performance-stat-label">{label}</span>
        <div className="performance-stat-icon" style={{ background: bgTint || 'var(--color-bg)' }}>
          {Icon && <Icon size={20} color={color} />}
        </div>
      </div>
      <h2 className="performance-stat-value" style={{ color: color || 'var(--color-text)' }}>
        {typeof value === 'number' ? animated : value}{suffix}
      </h2>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'var(--color-sidebar)',
        color: '#ffffff',
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 13,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{ fontWeight: 700, margin: '0 0 4px' }}>{label}</p>
        <p style={{ margin: '2px 0', color: '#60a5fa' }}>Resolved Tickets: <strong>{data.resolved}</strong></p>
        <p style={{ margin: '2px 0', color: '#34d399' }}>Points Earned: <strong>{data.points} pts</strong></p>
        <p style={{ margin: '2px 0', color: '#fbbf24' }}>Avg Speed: <strong>{data.avgResolutionHours || '0.0'}h</strong></p>
      </div>
    );
  }
  return null;
};

const MyPerformance = () => {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, monthlyRes, badgesRes] = await Promise.allSettled([
          api.get('/performance/my'),
          api.get('/performance/monthly?months=6'),
          api.get('/performance/badges'),
        ]);

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        }
        if (monthlyRes.status === 'fulfilled') {
          setMonthly(Array.isArray(monthlyRes.value.data) ? monthlyRes.value.data : []);
        }
        if (badgesRes.status === 'fulfilled') {
          setBadges(Array.isArray(badgesRes.value.data) ? badgesRes.value.data : []);
        }
      } catch (err) {
        console.error('Failed to load performance data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="performance-page">
      <div className="performance-header">
        <h1>My Performance</h1>
        <p>Track your SLA resolution speed, monthly productivity, and achievement milestones</p>
      </div>

      <div className="performance-stats">
        <StatCard
          label="Performance Score"
          value={stats?.performanceScore ?? 0}
          icon={FiAward}
          color="var(--color-primary)"
          bgTint="rgba(59, 130, 246, 0.1)"
          suffix=" pts"
        />
        <StatCard
          label="Tickets Resolved"
          value={stats?.totalResolved ?? 0}
          icon={FiCheckCircle}
          color="var(--color-success)"
          bgTint="rgba(34, 197, 94, 0.1)"
        />
        <StatCard
          label="Currently Open"
          value={stats?.currentOpen ?? 0}
          icon={FiClock}
          color="var(--color-warning)"
          bgTint="rgba(245, 158, 11, 0.1)"
        />
        <StatCard
          label="Badges Unlocked"
          value={earnedCount}
          icon={FiTrendingUp}
          color="#8b5cf6"
          bgTint="rgba(139, 92, 246, 0.1)"
        />
      </div>

      <div className="performance-section">
        <div className="performance-section-title">
          <FiBarChart2 size={18} color="var(--color-primary)" />
          <span>Resolved Tickets Breakdown (Last 6 Months)</span>
        </div>
        {monthly.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            No resolved tickets in the last 6 months. Start resolving assigned tickets to see your progress chart!
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="resolved" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={48} name="Resolved Tickets" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="performance-section">
        <div className="performance-section-title">
          <FiAward size={18} color="#eab308" />
          <span>🏅 Achievements & Badges ({earnedCount}/{badges.length})</span>
        </div>
        <div className="badges-grid">
          {badges.map((badge) => (
            <BadgeCard key={badge._id} badge={badge} />
          ))}
          {badges.length === 0 && (
            <div className="badges-empty">
              No badges available yet. Keep resolving tickets to unlock achievements!
            </div>
          )}
        </div>
      </div>

      {monthly.length > 0 && (
        <div className="performance-section">
          <div className="performance-section-title">
            <FiCalendar size={18} color="var(--color-primary)" />
            <span>Monthly Summary Table</span>
          </div>
          <div className="monthly-table-wrapper">
            <table className="monthly-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Tickets Resolved</th>
                  <th>Points Earned</th>
                  <th>Avg Resolution Time</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr key={m.month}>
                    <td style={{ fontWeight: 600 }}>{m.month}</td>
                    <td style={{ fontWeight: 600 }}>{m.resolved}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{m.points} pts</td>
                    <td>{m.avgResolutionHours ? `${m.avgResolutionHours}h` : '0.0h'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPerformance;
