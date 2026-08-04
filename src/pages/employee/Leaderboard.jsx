import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import './Leaderboard.css';

const Leaderboard = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/performance/leaderboard');
        setRows(data);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1>Leaderboard</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 24 }}>
        Ranked by performance score
      </p>

      <div className="card leaderboard">
        {rows.map((row, index) => (
          <div key={row._id} className={`leaderboard-row${row._id === user?._id ? ' is-you' : ''}`}>
            <span className="leaderboard-rank">#{index + 1}</span>
            <div className="leaderboard-info">
              <span className="leaderboard-name">{row.name}</span>
              <span className="leaderboard-dept">{row.department?.name || 'Unassigned'}</span>
            </div>
            <span className="leaderboard-score">{row.performanceScore} pts</span>
          </div>
        ))}

        {rows.length === 0 && <p style={{ padding: 20, color: 'var(--color-text-muted)' }}>No employees yet.</p>}
      </div>
    </div>
  );
};

export default Leaderboard;
