import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Loader from '../../components/Loader';
import { FiCheckCircle } from 'react-icons/fi';
import './TicketDetail.css';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isResolutionComment, setIsResolutionComment] = useState(false);
  const [posting, setPosting] = useState(false);
  const [resolving, setResolving] = useState(false);

  const fetchTicket = async () => {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await api.post(`/tickets/${id}/comments`, { text: commentText, isResolution: isResolutionComment });
      setCommentText('');
      setIsResolutionComment(false);
      await fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add comment');
    } finally {
      setPosting(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      const { data } = await api.put(`/tickets/${id}/resolve`);
      toast.success(`Resolved — ${data.pointsAwarded} points awarded`);
      await fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resolve ticket');
    } finally {
      setResolving(false);
    }
  };

  const handleStatusChange = async (e) => {
    try {
      if (e.target.value === 'Resolved') {
        handleResolve();
        return;
      }
      await api.put(`/tickets/${id}/status`, { status: e.target.value });
      toast.success('Status updated');
      fetchTicket();
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  const handleClose = async () => {
    try {
      await api.put(`/tickets/${id}/close`);
      toast.success('Ticket closed');
      fetchTicket();
    } catch (err) {
      toast.error('Could not close ticket');
    }
  };

  const handleReopen = async () => {
    try {
      await api.put(`/tickets/${id}/reopen`);
      toast.warning('Ticket reopened. Points have been reversed.');
      fetchTicket();
    } catch (err) {
      toast.error('Could not reopen ticket');
    }
  };

  if (loading) return <Loader />;
  if (!ticket) return <p>Ticket not found.</p>;

  const isResolved = ticket.status === 'Resolved' || ticket.status === 'Closed';

  return (
    <div className="ticket-detail">
      <button className="ticket-detail-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="card ticket-detail-header">
        <div className="ticket-detail-top">
          <h1>{ticket.title}</h1>
          <div className="ticket-card-badges">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            {ticket.isOverdue && <span className="badge-overdue">OVERDUE</span>}
          </div>
        </div>
        <p className="ticket-detail-desc">{ticket.description}</p>
        <div className="ticket-detail-meta">
          <span>Department: {ticket.department?.name}</span>
          <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
          {ticket.dueDate && (
            <span>
              Due: {new Date(ticket.dueDate).toLocaleString()} 
              {ticket.slaHours ? ` (${ticket.slaHours}h SLA)` : ''}
            </span>
          )}
        </div>

        {isAdmin && ticket.status !== 'Closed' && (
          <div className="admin-status-controls" style={{ marginTop: 16 }}>
            <label>Change Status: </label>
            <select value={ticket.status} onChange={handleStatusChange} className="status-select">
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        )}
        {isAdmin && (ticket.status === 'Resolved' || ticket.status === 'Closed') && (
          <div className="admin-actions" style={{ marginTop: 8, display: 'flex', gap: '8px' }}>
            {ticket.status === 'Resolved' && (
              <button className="btn btn-secondary" onClick={handleClose}>Close Ticket</button>
            )}
            <button className="btn btn-secondary" onClick={handleReopen}>Reopen Ticket</button>
          </div>
        )}

        {!isResolved && (
          <button
            className="btn btn-primary"
            onClick={handleResolve}
            disabled={resolving}
            style={{ marginTop: 16 }}
          >
            {resolving ? 'Resolving…' : 'Mark as Resolved'}
          </button>
        )}
        {isResolved && ticket.pointsAwarded > 0 && (
          <div className="points-breakdown" style={{ marginTop: 16, padding: '12px', backgroundColor: 'var(--color-bg-body)', borderRadius: '6px' }}>
            <p style={{ color: 'var(--color-success)', fontWeight: 600, margin: '0 0 8px 0' }}>
              ✓ Resolved — {ticket.pointsAwarded} points awarded
            </p>
            {ticket.pointsBreakdown && (
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                {ticket.pointsBreakdown.base > 0 && <li>Base: {ticket.pointsBreakdown.base}</li>}
                {ticket.pointsBreakdown.priorityBonus > 0 && <li>Priority Bonus: {ticket.pointsBreakdown.priorityBonus}</li>}
                {ticket.pointsBreakdown.speedBonus > 0 && <li>Speed Bonus: {ticket.pointsBreakdown.speedBonus}</li>}
                {ticket.pointsBreakdown.penalty > 0 && <li style={{ color: 'var(--color-danger)' }}>Penalty: -{ticket.pointsBreakdown.penalty}</li>}
              </ul>
            )}
          </div>
        )}
      </div>

      {ticket.history && ticket.history.length > 0 && (
        <div className="card ticket-detail-history">
          <h3 style={{ marginBottom: 16 }}>History</h3>
          <div className="history-timeline">
            {ticket.history.map((entry, idx) => (
              <div key={idx} className="history-entry">
                <div className="history-dot"></div>
                <div className="history-content">
                  <div className="history-date">{new Date(entry.createdAt).toLocaleString()}</div>
                  <div className="history-desc">
                    <strong>{entry.changedBy?.name}</strong> changed status from <em>{entry.oldStatus}</em> to <em>{entry.newStatus}</em>
                  </div>
                  {entry.notes && <div className="history-notes">{entry.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card ticket-detail-comments">
        <h3 style={{ marginBottom: 16 }}>Comments</h3>

        {ticket.comments?.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No comments yet.</p>
        )}

        {ticket.comments?.map((comment) => (
          <div key={comment._id} className={`comment${comment.isResolution ? ' comment-resolution' : ''}`}>
            <div className="comment-author">
              {comment.user?.name}
              {comment.isResolution && (
                <span className="comment-resolution-tag">
                  <FiCheckCircle size={12} /> Resolution
                </span>
              )}
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
        ))}

        <form onSubmit={handleAddComment} style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="comment">Add a comment</label>
            <div className="ai-reply-suggestions">
              <span className="ai-suggestion-title">AI Reply Suggestions:</span>
              <button
                type="button"
                className="ai-suggestion-chip"
                onClick={() => setCommentText('Investigating logs and reproducing reported issue.')}
              >
                🔍 Investigating
              </button>
              <button
                type="button"
                className="ai-suggestion-chip"
                onClick={() => setCommentText('Fix deployed to staging environment. Awaiting verification.')}
              >
                🛠️ Fix Deployed
              </button>
              <button
                type="button"
                className="ai-suggestion-chip"
                onClick={() => {
                  setCommentText('Root cause identified and resolved successfully.');
                  setIsResolutionComment(true);
                }}
              >
                ✅ Resolution Note
              </button>
            </div>
            <input
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What did you do to resolve this?"
            />
          </div>
          <label className="comment-resolution-checkbox">
            <input
              type="checkbox"
              checked={isResolutionComment}
              onChange={(e) => setIsResolutionComment(e.target.checked)}
            />
            This comment resolves the ticket
          </label>
          <button type="submit" className="btn btn-primary" disabled={posting}>
            {posting ? 'Posting…' : 'Add Comment'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default TicketDetail;
