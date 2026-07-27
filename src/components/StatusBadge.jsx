const STATUS_STYLES = {
  Open: { bg: '#dbeafe', color: '#1e40af' },
  'In Progress': { bg: '#fef3c7', color: '#92400e' },
  Resolved: { bg: '#dcfce7', color: '#166534' },
  Closed: { bg: '#e2e8f0', color: '#334155' },
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Open;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontSize: 12,
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: 999,
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
