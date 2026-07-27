import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './CreateTicket.css';

const CreateTicket = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    department: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [assignmentInfo, setAssignmentInfo] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await api.get('/departments');
      setDepartments(data);
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAssignmentInfo('');
    try {
      const { data } = await api.post('/tickets', form);
      toast.success('Ticket created');
      setAssignmentInfo(data.assignmentInfo);
      setForm({ title: '', description: '', category: '', priority: 'Medium', department: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <h1>Create Ticket</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 24 }}>
        It'll be auto-assigned to whoever in the department has the lightest workload
      </p>

      <form onSubmit={handleSubmit} className="card create-ticket-form">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Server not responding"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What's going wrong?"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange} required>
            <option value="" disabled>
              Select a category
            </option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Billing">Billing</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="department">Department (who it gets assigned to)</label>
          <select id="department" name="department" value={form.department} onChange={handleChange} required>
            <option value="" disabled>
              Select a department
            </option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting || !form.department || !form.category}
        >
          {submitting ? 'Creating…' : 'Create Ticket'}
        </button>
      </form>

      {assignmentInfo && (
        <div className="card create-ticket-result">
          <strong>Auto-assign result:</strong> {assignmentInfo}
        </div>
      )}
    </div>
  );
};

export default CreateTicket;
