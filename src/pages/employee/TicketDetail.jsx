import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import StarRating from '../../components/StarRating';
import Loader from '../../components/Loader';
import { FiCheckCircle, FiArrowLeft, FiClock, FiSend } from 'react-icons/fi';
import './TicketDetail.css';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isResolutionComment, setIsResolutionComment] = useState(false);
  const [posting, setPosting] = useState(false);
  const [resolving, setResolving] = useState(false);

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchTicket = async () => {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data);
      if (data.customerRating) {
        setRating(data.customerRating);
      }
      if (data.customerFeedback) {
        setFeedback(data.customerFeedback);
      }
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
      toast.success(`Resolved — ${data.pointsAwarded || 0} points awarded`);
      if (data.newBadges?.length) {
        data.newBadges.forEach((badge) => toast.success(`🏅 Badge earned: ${badge.name}`));
      }
      await fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resolve ticket');
    } finally {
      setResolving(false);
    }
  };

  const handleRateSubmit = async (selectedRating) => {
    const val = selectedRating || rating;
    if (!val) return toast.warning('Please select a star rating first');
    setSubmittingRating(true);
    try {
      await api.put(`/tickets/${id}/rate`, { rating: val, feedback });
      toast.success('Rating and feedback saved!');
      await fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) return <Loader />;
  if (!ticket) return <p className="error-text" style={{ padding: 32 }}>Ticket not found.</p>;

  const isResolved = ticket.status === 'Resolved' || ticket.status === 'Closed';

  return (
    <div className="ticket-detail">
      <button className="btn btn-secondary btn-sm ticket-detail-back" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} /> Back
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
          <span><strong>Category:</strong> {ticket.category || 'General'}</span>
          <span><strong>Department:</strong> {ticket.department?.name || 'Unassigned'}</span>
          <span><strong>Assigned To:</strong> {ticket.assignedTo?.name || 'Unassigned'}</span>
          <span><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</span>
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

        {isResolved && (
          <div className="ticket-resolution-banner" style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-primary-tint)', borderRadius: 8 }}>
            <p style={{ color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiCheckCircle size={18} /> Ticket Resolved — {ticket.pointsAwarded || 0} points awarded
            </p>
          </div>
        )}

        {isResolved && (
          <div className="ticket-detail-rating-card" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <h4 style={{ marginBottom: 8 }}>⭐ Resolution Rating & Feedback</h4>
            {ticket.customerRating ? (
              <div style={{ marginTop: 8 }}>
                <StarRating value={ticket.customerRating} readOnly />
                {ticket.customerFeedback && (
                  <p style={{ marginTop: 8, fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: 14 }}>
                    "{ticket.customerFeedback}"
                  </p>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <StarRating value={rating} onChange={(val) => { setRating(val); handleRateSubmit(val); }} readOnly={submittingRating} />
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Optional feedback comment..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => handleRateSubmit(rating)} disabled={submittingRating || rating === 0}>
                    Save Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card ticket-detail-comments">
        <h3 style={{ marginBottom: 16 }}>Comments ({ticket.comments?.length || 0})</h3>

        {ticket.comments?.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No comments yet.</p>
        )}

        {ticket.comments?.map((comment) => (
          <div key={comment._id} className={`comment${comment.isResolution ? ' comment-resolution' : ''}`}>
            <div className="comment-author">
              <span>{comment.user?.name || 'User'}</span>
              {comment.isResolution && (
                <span className="comment-resolution-tag">
                  <FiCheckCircle size={12} /> Resolution
                </span>
              )}
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
        ))}

        <form onSubmit={handleAddComment} style={{ marginTop: 20 }}>
          <div className="field">
            <label htmlFor="comment">Add a comment</label>
            <input
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your comment or update notes..."
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <label className="comment-resolution-checkbox" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={isResolutionComment}
                onChange={(e) => setIsResolutionComment(e.target.checked)}
              />
              Mark as official resolution note
            </label>
            <button type="submit" className="btn btn-primary" disabled={posting || !commentText.trim()}>
              <FiSend size={15} /> {posting ? 'Posting…' : 'Add Comment'}
            </button>
          </div>
        </form>
      </div>

      {ticket.history?.length > 0 && (
        <div className="card ticket-detail-history" style={{ marginTop: 24, padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}><FiClock size={16} /> Status History Timeline</h3>
          <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ticket.history.map((h) => (
              <div key={h._id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{h.changedBy?.name || 'System'}:</span>
                <span style={{ flex: 1, color: 'var(--color-text-muted)' }}>{h.notes || `Status changed from ${h.oldStatus} to ${h.newStatus}`}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(h.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
