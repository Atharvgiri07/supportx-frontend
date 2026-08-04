import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './CreateTicket.css';

const CreateTicket = () => {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
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
    const fetchDropdownData = async () => {
      try {
        const [deptRes, catRes] = await Promise.all([
          api.get('/departments'),
          api.get('/categories')
        ]);
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        setCategories(Array.isArray(catRes.data) ? catRes.data.filter(c => c.isActive !== false) : []);
      } catch (err) {
        console.error('Failed to fetch dropdown data:', err);
      }
    };
    fetchDropdownData();
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
    <div style={{ maxWidth: 640 }}>
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
            placeholder="e.g. Database connection pool timeout"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe what's going wrong, steps to reproduce, or error messages..."
            required
            style={{ resize: 'vertical', minHeight: 90 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} required>
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.icon || '🏷️'} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="department">Department (Workload Auto-assign)</label>
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
        </div>

        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="Low">Low (5 pts)</option>
            <option value="Medium">Medium (10 pts)</option>
            <option value="High">High (20 pts)</option>
            <option value="Critical">Critical (30 pts)</option>
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
        <div className="card create-ticket-result" style={{ marginTop: 20, padding: 16 }}>
          <strong>Auto-assign result:</strong> {assignmentInfo}
        </div>
      )}
    </div>
  );
};

export default CreateTicket;
