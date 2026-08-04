import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { FiTrash2, FiSearch } from 'react-icons/fi';
import './AllTickets.css';

const STATUS_OPTIONS = ['All', 'Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Critical'];

const AllTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    try {
      const [ticketsRes, catRes] = await Promise.all([
        api.get('/tickets'),
        api.get('/categories')
      ]);
      setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (err) {
      toast.error('Could not load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      toast.success('Ticket deleted');
      setTickets((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete ticket');
    }
  };

  const filtered = tickets.filter((t) => {
    const statusMatch = statusFilter === 'All' || t.status === statusFilter;
    const priorityMatch = priorityFilter === 'All' || t.priority === priorityFilter;
    const categoryMatch = categoryFilter === 'All' || t.category === categoryFilter;
    const searchMatch = (t.title || '').toLowerCase().includes(search.trim().toLowerCase());
    return statusMatch && priorityMatch && categoryMatch && searchMatch;
  });

  if (loading) return <Loader />;

  return (
    <div>
      <h1>All Tickets</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 20 }}>
        Master list of all tickets created across departments
      </p>

      <div className="all-tickets-filters">
        <div className="all-tickets-search">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="status-filter">Status</label>
          <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="priority-filter">Priority</label>
          <select id="priority-filter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="category-filter">Category</label>
          <select id="category-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <table className="all-tickets-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Department</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket._id}>
                <td>
                  <Link to={`/tickets/${ticket._id}`} className="all-tickets-link">
                    {ticket.title}
                  </Link>
                </td>
                <td>{ticket.category || 'General'}</td>
                <td>{ticket.department?.name || '—'}</td>
                <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
                <td>
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td>
                  <StatusBadge status={ticket.status} />
                </td>
                <td>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '—'}</td>
                <td>
                  <button
                    className="all-tickets-delete"
                    onClick={() => handleDelete(ticket._id)}
                    aria-label="Delete ticket"
                    title="Delete Ticket"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No tickets match these filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default AllTickets;
