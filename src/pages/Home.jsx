import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiInbox, FiAward, FiBarChart2 } from 'react-icons/fi';

const QUICK_LINKS = [
  { to: '/tickets', label: 'My Tickets', icon: FiInbox, desc: 'View tickets assigned to you' },
  { to: '/performance', label: 'My Performance', icon: FiBarChart2, desc: 'See your points and stats' },
  { to: '/leaderboard', label: 'Leaderboard', icon: FiAward, desc: 'See how you rank' },
];

const Home = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0];

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Welcome, {firstName}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 8, marginBottom: 28 }}>
        {user?.role === 'admin'
          ? 'Your full admin dashboard is coming in the next build.'
          : "Here's where you left off."}
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        {QUICK_LINKS.map(({ to, label, icon: Icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}
          >
            <Icon size={20} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
