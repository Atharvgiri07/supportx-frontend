import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Loader from '../../components/Loader';
import './TicketDetail.css';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
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
      await api.post(`/tickets/${id}/comments`, { text: commentText });
      setCommentText('');
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
          </div>
        </div>
        <p className="ticket-detail-desc">{ticket.description}</p>
        <div className="ticket-detail-meta">
          <span>Department: {ticket.department?.name}</span>
          <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>

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
          <p style={{ marginTop: 16, color: 'var(--color-success)', fontWeight: 600 }}>
            ✓ Resolved — {ticket.pointsAwarded} points awarded
          </p>
        )}
      </div>

      <div className="card ticket-detail-comments">
        <h3 style={{ marginBottom: 16 }}>Comments</h3>

        {ticket.comments?.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No comments yet.</p>
        )}

        {ticket.comments?.map((comment) => (
          <div key={comment._id} className="comment">
            <div className="comment-author">{comment.user?.name}</div>
            <p className="comment-text">{comment.text}</p>
          </div>
        ))}

        <form onSubmit={handleAddComment} style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="comment">Add a comment</label>
            <input
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What did you do to resolve this?"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={posting}>
            {posting ? 'Posting…' : 'Add Comment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetail;
