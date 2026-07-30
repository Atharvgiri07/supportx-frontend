import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { exportToCSV, printReport } from '../../utils/exportUtils';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import './Employees.css';


const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchAll = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([api.get('/performance/all'), api.get('/departments')]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDepartmentChange = async (employeeId, departmentId) => {
    setSavingId(employeeId);
    try {
      await api.put(`/auth/employees/${employeeId}/department`, { department: departmentId || null });
      toast.success('Department updated');
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update department');
    } finally {
      setSavingId(null);
    }
  };

  const handleExportCSV = () => {
    const data = employees.map((emp) => ({
      Name: emp.name,
      Email: emp.email,
      Department: emp.department?.name || 'Unassigned',
      OpenTickets: emp.currentOpen,
      ResolvedTickets: emp.totalResolved,
      PerformanceScore: emp.performanceScore,
      Status: emp.isActive ? 'Active' : 'Inactive',
    }));
    exportToCSV(data, 'employees-performance-report.csv');
    toast.success('Employees report exported');
  };

  if (loading) return <Loader type="table" count={5} />;

  return (
    <div>
      <div className="all-tickets-header-row">
        <div>
          <h1>Employees</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            Your team, ranked by performance. Assign a department so they're eligible for auto-assign.
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


      <div className="card">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Open</th>
              <th>Resolved</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.name}</td>
                <td>
                  <select
                    className="employees-dept-select"
                    value={emp.department?._id || ''}
                    disabled={savingId === emp._id}
                    onChange={(e) => handleDepartmentChange(emp._id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{emp.currentOpen}</td>
                <td>{emp.totalResolved}</td>
                <td className="employees-score">{emp.performanceScore}</td>
                <td>
                  <span className={`employees-status${emp.isActive ? ' active' : ' inactive'}`}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>No employees yet.</p>
        )}
      </div>
    </div>
  );
};

export default Employees;
