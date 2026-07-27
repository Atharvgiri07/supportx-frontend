const PRIORITY_STYLES = {
  Low: { bg: '#f1f5f9', color: '#475569' },
  Medium: { bg: '#dbeafe', color: '#1e40af' },
  High: { bg: '#ffedd5', color: '#9a3412' },
  Critical: { bg: '#fee2e2', color: '#991b1b' },
};

const PriorityBadge = ({ priority }) => {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
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
      {priority}
    </span>
  );
};

export default PriorityBadge;
