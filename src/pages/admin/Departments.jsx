import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import './Departments.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data);
    } catch (err) {
      toast.error('Could not load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/departments', { name, description });
      setName('');
      setDescription('');
      toast.success('Department created');
      await fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted');
      await fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete department');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1>Departments</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 24 }}>
        Manage departments and see who's in each
      </p>

      <form onSubmit={handleCreate} className="card dept-form">
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label htmlFor="dept-name">Department name</label>
          <input id="dept-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Engineering" />
        </div>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label htmlFor="dept-desc">Description (optional)</label>
          <input
            id="dept-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Handles technical issues"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          <FiPlus size={16} /> {submitting ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="dept-grid">
        {departments.map((dept) => (
          <div key={dept._id} className="card dept-card">
            <div className="dept-card-header">
              <h3>{dept.name}</h3>
              <button className="dept-delete" onClick={() => handleDelete(dept._id)} aria-label="Delete department">
                <FiTrash2 size={16} />
              </button>
            </div>
            {dept.description && <p className="dept-card-desc">{dept.description}</p>}
            <p className="dept-card-count">{dept.employees?.length || 0} employee(s)</p>
            {dept.employees?.length > 0 && (
              <ul className="dept-employee-list">
                {dept.employees.map((emp) => (
                  <li key={emp._id}>
                    {emp.name} — {emp.performanceScore} pts
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {departments.length === 0 && (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No departments yet — add one above.
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;
