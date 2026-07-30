import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { exportToCSV, printReport } from '../../utils/exportUtils';
import { FiDownload, FiPrinter, FiAward } from 'react-icons/fi';
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

  const handleExportCSV = () => {
    const data = rows.map((r, idx) => ({
      Rank: `#${idx + 1}`,
      Name: r.name,
      Department: r.department?.name || 'Unassigned',
      PerformanceScore: `${r.performanceScore} pts`,
      ResolvedTickets: r.totalResolved || 0,
    }));
    exportToCSV(data, 'leaderboard-report.csv');
  };

  if (loading) return <Loader type="card" count={3} />;

  return (
    <div>
      <div className="leaderboard-header-row">
        <div>
          <h1>Leaderboard</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            Ranked by performance score
          </p>
        </div>

        <div className="export-btn-group">
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <FiDownload size={15} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={printReport}>
            <FiPrinter size={15} /> Print
          </button>
        </div>
      </div>


      <div className="card leaderboard">
        {rows.map((row, index) => (
          <div key={row._id} className={`leaderboard-row${row._id === user?._id ? ' is-you' : ''}`}>
            <span className="leaderboard-rank">
              {index === 0 && <span className="leaderboard-medal" style={{ color: '#fbbf24' }}><FiAward size={20} /></span>}
              {index === 1 && <span className="leaderboard-medal" style={{ color: '#94a3b8' }}><FiAward size={20} /></span>}
              {index === 2 && <span className="leaderboard-medal" style={{ color: '#b45309' }}><FiAward size={20} /></span>}
              {index > 2 && `#${index + 1}`}
            </span>
            <div className="leaderboard-info">
              <span className="leaderboard-name">{row.name}</span>
              <span className="leaderboard-dept">{row.department?.name || 'Unassigned'}</span>
            </div>
            <span className="leaderboard-score">
              {row.performanceScore} pts
              <span className="leaderboard-resolved">{row.totalResolved || 0} resolved</span>
            </span>
          </div>
        ))}

        {rows.length === 0 && <p style={{ padding: 20, color: 'var(--color-text-muted)' }}>No employees yet.</p>}
      </div>
    </div>
  );
};

export default Leaderboard;
