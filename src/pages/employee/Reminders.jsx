import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiCheckCircle, FiClock, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import './Reminders.css';

const Reminders = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');

  const fetchReminders = async () => {
    try {
      const { data } = await api.get('/reminders');
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReminders(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !reminderDate) return toast.warning('Title and date are required');
    try {
      await api.post('/reminders', { title, reminderDate, notes });
      toast.success('Reminder created');
      setTitle(''); setReminderDate(''); setNotes(''); setShowForm(false);
      fetchReminders();
    } catch (err) {
      toast.error('Failed to create reminder');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/reminders/${id}/complete`);
      fetchReminders();
    } catch (err) {
      toast.error('Failed to update reminder');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      toast.success('Reminder deleted');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to delete reminder');
    }
  };

  const isOverdue = (date) => new Date(date) < new Date();

  if (loading) return <Loader />;

  const upcoming = reminders.filter(r => !r.isCompleted);
  const completed = reminders.filter(r => r.isCompleted);

  return (
    <div className="reminders-page">
      <div className="reminders-header">
        <div>
          <h1>Task Reminders</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Set task follow-ups and deadline alerts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <FiPlus size={16} /> {showForm ? 'Cancel' : 'New Reminder'}
        </button>
      </div>

      {showForm && (
        <form className="card reminder-form" onSubmit={handleCreate}>
          <div className="field">
            <label>Title / Task Name</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Check database server logs" required />
          </div>
          <div className="field">
            <label>Reminder Date & Time</label>
            <input type="datetime-local" value={reminderDate} onChange={e => setReminderDate(e.target.value)} required />
          </div>
          <div className="field">
            <label>Notes (optional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional context..." />
          </div>
          <button className="btn btn-primary" type="submit">Save Reminder</button>
        </form>
      )}

      {upcoming.length > 0 && (
        <div className="reminders-section">
          <h3><FiClock size={16} /> Upcoming Reminders ({upcoming.length})</h3>
          {upcoming.map(r => (
            <div key={r._id} className={`card reminder-item${isOverdue(r.reminderDate) ? ' overdue' : ''}`}>
              <button className="reminder-check" onClick={() => handleToggle(r._id)} title="Mark Complete">
                <FiCheckCircle size={20} />
              </button>
              <div className="reminder-content">
                <p className="reminder-title">{r.title}</p>
                <div className="reminder-meta">
                  {isOverdue(r.reminderDate) && <FiAlertTriangle size={13} color="var(--color-danger)" />}
                  <span className={isOverdue(r.reminderDate) ? 'overdue-text' : ''}>
                    {new Date(r.reminderDate).toLocaleString()}
                  </span>
                  {r.ticket && (
                    <span
                      style={{ cursor: 'pointer', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8 }}
                      onClick={() => navigate(`/tickets/${typeof r.ticket === 'object' ? r.ticket._id : r.ticket}`)}
                    >
                      • {typeof r.ticket === 'object' ? r.ticket.title : 'View Ticket'} <FiExternalLink size={12} />
                    </span>
                  )}
                </div>
                {r.notes && <p className="reminder-notes">{r.notes}</p>}
              </div>
              <button className="reminder-delete" onClick={() => handleDelete(r._id)} title="Delete Reminder">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="reminders-section">
          <h3>✅ Completed ({completed.length})</h3>
          {completed.map(r => (
            <div key={r._id} className="card reminder-item completed">
              <button className="reminder-check done" onClick={() => handleToggle(r._id)} title="Mark Incomplete">
                <FiCheckCircle size={20} />
              </button>
              <div className="reminder-content">
                <p className="reminder-title" style={{ textDecoration: 'line-through' }}>{r.title}</p>
                <span className="reminder-meta">{new Date(r.reminderDate).toLocaleString()}</span>
              </div>
              <button className="reminder-delete" onClick={() => handleDelete(r._id)} title="Delete Reminder">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {reminders.length === 0 && !showForm && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No reminders set yet. Click "New Reminder" above to add one.</p>
        </div>
      )}
    </div>
  );
};

export default Reminders;
