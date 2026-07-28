import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './AllTickets.css';

const STATUS_OPTIONS = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Critical'];
const PAGE_SIZE = 10;

const AllTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/tickets');
      setTickets(data);
    } catch (err) {
      toast.error('Could not load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, searchQuery]);

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

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const statusMatch = statusFilter === 'All' || t.status === statusFilter;
      const priorityMatch = priorityFilter === 'All' || t.priority === priorityFilter;
      
      const q = searchQuery.toLowerCase().trim();
      const searchMatch =
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.department?.name?.toLowerCase().includes(q) ||
        t.assignedTo?.name?.toLowerCase().includes(q);

      return statusMatch && priorityMatch && searchMatch;
    });
  }, [tickets, statusFilter, priorityFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  if (loading) return <Loader />;

  return (
    <div>
      <h1>All Tickets</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 20 }}>
        Every ticket in the system
      </p>

      <div className="all-tickets-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search tickets, department, assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="all-tickets-filters">
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
        </div>
      </div>

      <div className="card">
        <table className="all-tickets-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.map((ticket) => (
              <tr key={ticket._id}>
                <td>
                  <Link to={`/tickets/${ticket._id}`} className="all-tickets-link">
                    {ticket.title}
                  </Link>
                </td>
                <td>{ticket.department?.name || '—'}</td>
                <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
                <td>
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td>
                  <StatusBadge status={ticket.status} />
                </td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="all-tickets-delete"
                    onClick={() => handleDelete(ticket._id)}
                    aria-label="Delete ticket"
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
            No tickets match your query or filters.
          </p>
        )}

        {filtered.length > 0 && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)} -{' '}
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} tickets
            </span>
            <div className="pagination-controls">
              <button
                className="btn-pagination"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <FiChevronLeft size={16} /> Prev
              </button>
              <span className="pagination-page">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn-pagination"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTickets;

