import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import './AIReports.css';

const AIReports = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get('/performance/all');
        setEmployees(data);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleGenerate = async () => {
    if (!selectedId) return;
    setGenerating(true);
    setReport(null);
    try {
      const { data } = await api.post(`/performance/ai-report/${selectedId}`);
      setReport(data);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Could not generate report');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <Loader />;

  const selectedEmployee = employees.find((e) => e._id === selectedId);

  return (
    <div style={{ maxWidth: 640 }}>
      <h1>AI Reports</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 24 }}>
        Generate a Gemini-powered performance summary for any employee
      </p>

      <div className="card ai-reports-form">
        <div className="field" style={{ marginBottom: 0, flex: 1 }}>
          <label htmlFor="employee-select">Employee</label>
          <select id="employee-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="" disabled>
              Select an employee
            </option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} — {emp.totalResolved} resolved, {emp.performanceScore} pts
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={!selectedId || generating}>
          {generating ? 'Generating…' : 'Generate Report'}
        </button>
      </div>

      {generating && (
        <div className="card ai-reports-loading">
          <Loader />
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
            Gemini is analyzing {selectedEmployee?.name}'s ticket history…
          </p>
        </div>
      )}

      {report && !generating && (
        <div className="card ai-reports-result">
          <h3 style={{ marginBottom: 12 }}>Report for {report.employee}</h3>
          <pre className="ai-reports-text">{report.report}</pre>
        </div>
      )}

      {employees.length === 0 && (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No employees yet — add one from the Employees page first.
        </div>
      )}
    </div>
  );
};

export default AIReports;
