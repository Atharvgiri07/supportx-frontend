import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { exportToCSV, printReport } from '../../utils/exportUtils';
import { FiTrash2, FiSearch, FiDownload, FiPrinter, FiCheckCircle, FiArchive } from 'react-icons/fi';
import './AllTickets.css';

const STATUS_OPTIONS = ['All', 'Open', 'In Progress', 'Resolved', 'Closed', 'Overdue'];
const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Critical'];

const AllTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');

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

  const handleResolve = async (id) => {
    try {
      await api.put(`/tickets/${id}/resolve`);
      toast.success('Ticket resolved');
      fetchTickets();
    } catch (err) {
      toast.error('Could not resolve ticket');
    }
  };

  const handleClose = async (id) => {
    try {
      await api.put(`/tickets/${id}/close`);
      toast.success('Ticket closed');
      fetchTickets();
    } catch (err) {
      toast.error('Could not close ticket');
    }
  };

  const handleExportCSV = () => {
    const formatted = filtered.map((t) => ({
      Title: t.title,
      Department: t.department?.name || 'Unassigned',
      AssignedTo: t.assignedTo?.name || 'Unassigned',
      Priority: t.priority,
      Status: t.status,
      CreatedDate: new Date(t.createdAt).toLocaleDateString(),
    }));
    exportToCSV(formatted, 'tickets-report.csv');
    toast.success('Report exported to CSV');
  };

  const filtered = tickets.filter((t) => {
    let statusMatch = false;
    if (statusFilter === 'All') {
      statusMatch = true;
    } else if (statusFilter === 'Overdue') {
      statusMatch = t.isOverdue === true || (t.dueDate && new Date(t.dueDate) < new Date() && ['Open', 'In Progress', 'Pending'].includes(t.status));
    } else {
      statusMatch = t.status === statusFilter;
    }
    const priorityMatch = priorityFilter === 'All' || t.priority === priorityFilter;
    const searchMatch = t.title.toLowerCase().includes(search.trim().toLowerCase());
    return statusMatch && priorityMatch && searchMatch;
  });

  if (loading) return <Loader />;

  return (
    <div>
      <div className="all-tickets-header-row">
        <div>
          <h1>All Tickets</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            Every ticket in the system
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
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {(ticket.isOverdue || (ticket.dueDate && new Date(ticket.dueDate) < new Date() && ['Open', 'In Progress', 'Pending'].includes(ticket.status))) && (
                      <div className="overdue-dot" title="Overdue"></div>
                    )}
                    <Link to={`/tickets/${ticket._id}`} className="all-tickets-link">
                      {ticket.title}
                    </Link>
                  </div>
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
                <td>{ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : '—'}</td>
                <td>
                  <div className="quick-actions">
                    {['Open', 'In Progress', 'Pending'].includes(ticket.status) && (
                      <button className="action-btn action-resolve" onClick={() => handleResolve(ticket._id)} title="Resolve">
                        <FiCheckCircle size={15} />
                      </button>
                    )}
                    {ticket.status === 'Resolved' && (
                      <button className="action-btn action-close" onClick={() => handleClose(ticket._id)} title="Close">
                        <FiArchive size={15} />
                      </button>
                    )}
                    <button
                      className="action-btn action-delete"
                      onClick={() => handleDelete(ticket._id)}
                      title="Delete"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
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
