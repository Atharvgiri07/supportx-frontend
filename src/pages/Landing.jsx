import { Link } from 'react-router-dom';
import { FiZap, FiUsers, FiCpu, FiAward } from 'react-icons/fi';
import './Landing.css';

const FEATURES = [
  {
    icon: FiZap,
    title: 'Smart Auto-Assign',
    desc: 'Every ticket routes automatically to whoever on the team has the lightest workload.',
  },
  {
    icon: FiCpu,
    title: 'AI Performance Reports',
    desc: 'Gemini-powered summaries turn raw ticket data into real feedback for every employee.',
  },
  {
    icon: FiUsers,
    title: 'Department Management',
    desc: 'Organize your team by department and track workload at a glance.',
  },
  {
    icon: FiAward,
    title: 'Performance Leaderboard',
    desc: 'Points for every resolution, ranked live, so good work never goes unnoticed.',
  },
];

const Landing = () => {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-brand">
            <FiZap size={22} />
            SupportX
          </div>
          <h1 className="landing-headline">Manage Smarter. Resolve Faster.</h1>
          <p className="landing-subhead">
            SupportX is a smart ticket management system that auto-assigns work, tracks
            performance, and generates AI-powered reports — so your team always knows what
            matters most.
          </p>
          <div className="landing-cta">
            <Link to="/login" className="btn btn-primary">
              Log In
            </Link>
            <Link to="/register" className="btn landing-btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-features">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card landing-feature-card">
            <div className="landing-feature-icon">
              <Icon size={20} />
            </div>
            <h3 style={{ fontSize: 16, marginBottom: 6 }}>{title}</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Landing;
