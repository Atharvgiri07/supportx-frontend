import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import './TicketCard.css';

const TicketCard = ({ ticket }) => {
  return (
    <Link to={`/tickets/${ticket._id}`} className="ticket-card card">
      <div className="ticket-card-top">
        <h3 className="ticket-card-title">{ticket.title}</h3>
        <div className="ticket-card-badges">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>
      <p className="ticket-card-desc">{ticket.description}</p>
      <div className="ticket-card-meta">
        <span>{ticket.department?.name}</span>
        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
};

export default TicketCard;
