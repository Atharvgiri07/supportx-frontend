import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { FiSearch, FiActivity } from 'react-icons/fi';
import './ActivityLogs.css';

const ACTION_COLORS = {
  created: '#22c55e',
  updated: '#3b82f6',
  resolved: '#8b5cf6',
  closed: '#64748b',
  deleted: '#ef4444',
  reopened: '#f59e0b',
  assigned: '#06b6d4',
};

const getActionColor = (action) => {
  const key = Object.keys(ACTION_COLORS).find(k => action?.toLowerCase().includes(k));
  return ACTION_COLORS[key] || '#64748b';
};

const formatTimeAgo = (dateString) => {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/activity-logs');
        setLogs(data);
        setFiltered(data);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(logs);
    } else {
      const q = search.toLowerCase();
      setFiltered(logs.filter(l =>
        l.action?.toLowerCase().includes(q) ||
        l.user?.name?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q)
      ));
    }
  }, [search, logs]);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="activity-header">
        <div>
          <h1>Activity Logs</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Track all actions across the system</p>
        </div>
        <div className="activity-search">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card activity-timeline">
        {filtered.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--color-text-muted)', textAlign: 'center' }}>No activity logs found.</p>
        ) : (
          filtered.map((log) => (
            <div key={log._id} className="activity-item">
              <div className="activity-dot" style={{ background: getActionColor(log.action) }} />
              <div className="activity-content">
                <div className="activity-row">
                  <span className="activity-user">{log.user?.name || 'System'}</span>
                  <span className="activity-time">{formatTimeAgo(log.createdAt)}</span>
                </div>
                <p className="activity-action">{log.action}</p>
                {log.details && <p className="activity-details">{log.details}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
