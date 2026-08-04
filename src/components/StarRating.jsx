import { FiStar } from 'react-icons/fi';

const StarRating = ({ value = 0, onChange, readOnly = false, size = 20 }) => {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: readOnly ? 'default' : 'pointer',
            color: star <= value ? '#eab308' : 'var(--color-border)',
            display: 'flex',
          }}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <FiStar size={size} fill={star <= value ? '#eab308' : 'none'} />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
