import './Loader.css';

export const SkeletonCard = ({ count = 3 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="card skeleton-card-item">
        <div className="skeleton-shimmer skeleton-title" />
        <div className="skeleton-shimmer skeleton-text" />
        <div className="skeleton-shimmer skeleton-badge" />
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="card skeleton-table-wrap">
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="skeleton-table-row">
        <div className="skeleton-shimmer skeleton-col-wide" />
        <div className="skeleton-shimmer skeleton-col" />
        <div className="skeleton-shimmer skeleton-col" />
        <div className="skeleton-shimmer skeleton-col-badge" />
      </div>
    ))}
  </div>
);

const Loader = ({ type = 'spinner', count = 3 }) => {
  if (type === 'card') return <SkeletonCard count={count} />;
  if (type === 'table') return <SkeletonTable rows={count} />;

  return (
    <div className="loader-wrap">
      <div className="loader-spinner" />
    </div>
  );
};

export default Loader;

