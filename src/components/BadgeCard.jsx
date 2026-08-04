import './BadgeCard.css';

const BadgeCard = ({ badge }) => {
  if (!badge) return null;
  const earned = Boolean(badge.earned);

  return (
    <div
      className={`badge-card${earned ? ' earned' : ' locked'}`}
      title={badge.description || ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '10px',
        background: earned ? 'var(--color-surface)' : 'var(--color-bg)',
        border: `1px solid ${earned ? 'var(--color-primary)' : 'var(--color-border)'}`,
        opacity: earned ? 1 : 0.65,
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{ fontSize: 28, filter: earned ? 'none' : 'grayscale(100%)' }}>
        {badge.icon || '🏅'}
      </span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: 'var(--color-text)' }}>
          {badge.name || 'Achievement'}
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
          {badge.description || ''}
        </p>
        {earned && badge.earnedAt && (
          <p style={{ fontSize: 11, color: 'var(--color-primary)', margin: '4px 0 0', fontWeight: 500 }}>
            Unlocked {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
      {earned ? (
        <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: 16 }}>✓</span>
      ) : (
        <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>🔒</span>
      )}
    </div>
  );
};

export default BadgeCard;
