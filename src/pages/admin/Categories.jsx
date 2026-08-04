import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { FiPlus, FiTrash2, FiEdit2, FiTag, FiCheck, FiX } from 'react-icons/fi';
import './Categories.css';

const COLOR_PRESETS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

const ICON_PRESETS = ['🏷️', '🛠️', '💰', '💳', '👥', '💻', '🔒', '📦', '❓', '🚀', '⚡', '📊'];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '🏷️',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      toast.error('Could not load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      description: cat.description || '',
      color: cat.color || '#3b82f6',
      icon: cat.icon || '🏷️',
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', description: '', color: '#3b82f6', icon: '🏷️' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warning('Category name is required');

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', form);
        toast.success('Category created successfully');
      }
      handleCancelForm();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" category?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div>
          <h1>Category Management</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            Create and customize dynamic support ticket categories with color tags
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (showForm) {
              handleCancelForm();
            } else {
              setEditingId(null);
              setForm({ name: '', description: '', color: '#3b82f6', icon: '🏷️' });
              setShowForm(true);
            }
          }}
        >
          <FiPlus size={16} /> {showForm ? 'Cancel' : 'New Category'}
        </button>
      </div>

      {showForm && (
        <form className="card category-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Category' : 'Create New Category'}</h3>
          <div className="category-form-grid">
            <div className="field">
              <label>Icon</label>
              <div className="icon-selector">
                {ICON_PRESETS.map((ic) => (
                  <span
                    key={ic}
                    className={`icon-chip${form.icon === ic ? ' active' : ''}`}
                    onClick={() => setForm({ ...form, icon: ic })}
                  >
                    {ic}
                  </span>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="e.g. DevOps & Cloud"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Tag Badge Color</label>
              <div className="color-selector">
                {COLOR_PRESETS.map((col) => (
                  <span
                    key={col}
                    className={`color-chip${form.color === col ? ' active' : ''}`}
                    style={{ background: col }}
                    onClick={() => setForm({ ...form, color: col })}
                  >
                    {form.color === col && <FiCheck size={14} color="#fff" />}
                  </span>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Description (optional)</label>
              <input
                type="text"
                placeholder="Short explanation of this category..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={handleCancelForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="categories-grid">
        {categories.map((cat) => (
          <div key={cat._id} className="card category-card">
            <div className="category-card-top">
              <div className="category-tag-badge" style={{ background: cat.color || '#3b82f6' }}>
                <span>{cat.icon || '🏷️'}</span>
                <span>{cat.name}</span>
              </div>
              <div className="category-card-actions">
                <button
                  className="cat-action-btn"
                  onClick={() => handleEditClick(cat)}
                  title="Edit Category"
                >
                  <FiEdit2 size={15} />
                </button>
                <button
                  className="cat-action-btn delete"
                  onClick={() => handleDelete(cat._id, cat.name)}
                  title="Delete Category"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>

            <p className="category-desc">{cat.description || 'No description provided.'}</p>

            <div className="category-card-footer">
              <span className="category-ticket-count">
                <FiTag size={13} /> {cat.ticketCount || 0} Tickets
              </span>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !showForm && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No categories found. Click "New Category" to create one.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;
