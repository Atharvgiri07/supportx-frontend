import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import useCountUp from '../../utils/useCountUp';

const StatCard = ({ label, value }) => {
  const animated = useCountUp(value);
  return (
    <div className="card" style={{ padding: 20, flex: 1, minWidth: 160 }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>{label}</p>
      <h2 style={{ fontSize: 28 }}>{animated}</h2>
    </div>
  );
};

const MyPerformance = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/performance/my');
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1>My Performance</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 24 }}>
        Your resolution stats and points earned
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard label="Performance Score" value={stats?.performanceScore ?? 0} />
        <StatCard label="Tickets Resolved" value={stats?.totalResolved ?? 0} />
        <StatCard label="Currently Open" value={stats?.currentOpen ?? 0} />
      </div>
    </div>
  );
};

export default MyPerformance;
