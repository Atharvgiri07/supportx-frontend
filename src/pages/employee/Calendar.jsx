import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Calendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Calendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tickets, setTickets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const endpoint = user?.role === 'admin' ? '/tickets' : '/tickets/my';
        const { data } = await api.get(endpoint);
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch calendar tickets:', err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDateKey = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const getTicketsForDate = (day) => {
    const dateStr = getDateKey(day);
    return {
      created: tickets.filter(t => t.createdAt && t.createdAt.substring(0, 10) === dateStr),
      resolved: tickets.filter(t => t.resolvedAt && t.resolvedAt.substring(0, 10) === dateStr),
      overdue: tickets.filter(t => {
        if (!t.dueDate) return false;
        const dueStr = t.dueDate.substring(0, 10);
        return dueStr === dateStr && ['Open', 'In Progress', 'Pending'].includes(t.status);
      })
    };
  };

  const selectedTickets = selectedDate ? getTicketsForDate(selectedDate) : null;
  const today = new Date();
  const isToday = (day) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  if (loading) return <Loader />;

  return (
    <div className="calendar-page">
      <h1>Calendar</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 24 }}>
        Track ticket schedules, resolutions, and deadlines
      </p>

      <div className="card calendar-container">
        <div className="calendar-header">
          <button className="calendar-nav" onClick={prevMonth} aria-label="Previous Month">
            <FiChevronLeft size={20} />
          </button>
          <h2>{MONTHS[month]} {year}</h2>
          <button className="calendar-nav" onClick={nextMonth} aria-label="Next Month">
            <FiChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-grid">
          {DAYS.map(d => <div key={d} className="calendar-day-name">{d}</div>)}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="calendar-cell empty" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const data = getTicketsForDate(day);
            const hasEvents = data.created.length || data.resolved.length || data.overdue.length;
            return (
              <div
                key={day}
                className={`calendar-cell${isToday(day) ? ' today' : ''}${selectedDate === day ? ' selected' : ''}${hasEvents ? ' has-events' : ''}`}
                onClick={() => setSelectedDate(selectedDate === day ? null : day)}
              >
                <span className="calendar-day-number">{day}</span>
                <div className="calendar-dots">
                  {data.created.length > 0 && <span className="dot dot-blue" title={`${data.created.length} created`} />}
                  {data.resolved.length > 0 && <span className="dot dot-green" title={`${data.resolved.length} resolved`} />}
                  {data.overdue.length > 0 && <span className="dot dot-red" title={`${data.overdue.length} overdue`} />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span><span className="dot dot-blue" /> Created</span>
          <span><span className="dot dot-green" /> Resolved</span>
          <span><span className="dot dot-red" /> Overdue</span>
        </div>
      </div>

      {selectedTickets && (
        <div className="card calendar-detail" style={{ marginTop: 16, padding: 20 }}>
          <h3>Tickets on {MONTHS[month]} {selectedDate}, {year}</h3>
          {(() => {
            const allItems = [
              ...selectedTickets.created.map(t => ({ ...t, eventType: 'created', dotClass: 'dot-blue' })),
              ...selectedTickets.resolved.map(t => ({ ...t, eventType: 'resolved', dotClass: 'dot-green' })),
              ...selectedTickets.overdue.map(t => ({ ...t, eventType: 'overdue', dotClass: 'dot-red' }))
            ];
            const uniqueMap = new Map();
            allItems.forEach(item => {
              if (!uniqueMap.has(item._id)) uniqueMap.set(item._id, item);
            });
            const uniqueList = Array.from(uniqueMap.values());

            if (uniqueList.length === 0) {
              return <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 8 }}>No tickets scheduled on this date.</p>;
            }

            return (
              <div style={{ marginTop: 12 }}>
                {uniqueList.map(t => (
                  <div key={t._id} className="calendar-ticket-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/tickets/${t._id}`)}>
                    <span className={`dot ${t.dotClass}`} />
                    <span style={{ flex: 1, fontWeight: 500 }}>{t.title}</span>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Calendar;
