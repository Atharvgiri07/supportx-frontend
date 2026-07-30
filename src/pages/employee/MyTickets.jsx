import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import TicketCard from '../../components/TicketCard';
import Loader from '../../components/Loader';

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get('/tickets/my');
        setTickets(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Admins don't get tickets auto-assigned to them — send them to the real
  // ticket list instead of a page that will always be empty for their account.
  if (user?.role === 'admin') return <Navigate to="/all-tickets" replace />;

  if (loading) return <Loader />;

  return (
    <div>
      <h1>My Tickets</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 24 }}>
        Tickets currently assigned to you
      </p>

      {error && <p className="error-text">{error}</p>}

      {!error && tickets.length === 0 && (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No tickets assigned to you yet.
        </div>
      )}

      {tickets.map((ticket) => (
        <TicketCard key={ticket._id} ticket={ticket} />
      ))}
    </div>
  );
};

export default MyTickets;
