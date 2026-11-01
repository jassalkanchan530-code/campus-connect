import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaCalendarAlt, FaBell, FaClipboardList, FaUser,
  FaArrowRight, FaGraduationCap, FaStar, FaUsers,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <FaCalendarAlt />,
      title: 'Campus Events',
      description: 'Discover and register for workshops, seminars, fests, and more happening around you.',
      color: 'indigo',
      dot: '#6366f1',
    },
    {
      icon: <FaBell />,
      title: 'Smart Notifications',
      description: 'Stay ahead with real-time announcements from your campus administrators.',
      color: 'blue',
      dot: '#3b82f6',
    },
    {
      icon: <FaClipboardList />,
      title: 'My Registrations',
      description: 'Track every event you\'ve signed up for — status, details, and forms all in one place.',
      color: 'purple',
      dot: '#8b5cf6',
    },
    {
      icon: <FaUser />,
      title: 'Student Profile',
      description: 'Your campus identity. Manage your profile and keep your information up to date.',
      color: 'pink',
      dot: '#ec4899',
    },
  ];

  const stats = [
    { label: 'Active Events', value: '50+', icon: <FaCalendarAlt /> },
    { label: 'Students Connected', value: '2K+', icon: <FaUsers /> },
    { label: 'Registrations', value: '10K+', icon: <FaClipboardList /> },
  ];

  return (
    <div style={{ background: 'var(--cc-navy)' }}>
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <AnimatedBackground variant="hero" className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center py-24">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc',
            }}
          >
            <FaStar className="text-xs text-yellow-400" />
            <span>The Future of Campus Life</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-6"
          >
            Your Campus,{' '}
            <span className="gradient-text text-glow">Connected.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--cc-text-muted)' }}
          >
            {isAuthenticated
              ? `Welcome back, ${user?.name?.split(' ')[0]}! Your campus is buzzing with activity.`
              : 'One platform for events, registrations, and campus notifications. Built for students, by design.'}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {isAuthenticated ? (
              <>
                <Link to="/events" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
                  Browse Events <FaArrowRight className="text-sm" />
                </Link>
                <Link to="/dashboard" className="btn-secondary flex items-center gap-2 text-base px-6 py-3">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
                  Get Started <FaArrowRight className="text-sm" />
                </Link>
                <Link to="/events" className="btn-secondary flex items-center gap-2 text-base px-6 py-3">
                  <FaCalendarAlt /> Explore Events
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center gap-8 sm:gap-16 mt-16"
          >
            {stats.map(({ label, value, icon }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-white mb-0.5">{value}</div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--cc-text-muted)' }}>
                  <span style={{ color: '#818cf8' }}>{icon}</span>
                  {label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Floating decorative icons */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="float-slow absolute top-1/4 left-12 text-indigo-500/15 text-4xl hidden lg:block">
              <FaGraduationCap />
            </div>
            <div className="float-med absolute top-1/3 right-16 text-violet-500/15 text-3xl hidden lg:block">
              <FaCalendarAlt />
            </div>
            <div className="float-slow absolute bottom-1/4 left-24 text-blue-500/12 text-2xl hidden lg:block">
              <FaBell />
            </div>
            <div className="float-med absolute bottom-1/3 right-24 text-pink-500/12 text-2xl hidden lg:block">
              <FaStar />
            </div>
          </div>
        </div>
      </AnimatedBackground>

      {/* ── Features Section ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 relative" style={{ background: 'rgba(15,22,41,0.8)' }}>
        <div className="absolute inset-0 bg-grid-fine pointer-events-none opacity-50" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#6366f1' }}>
              Everything you need
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for <span className="gradient-text">students</span>, designed for life.
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--cc-text-muted)' }}>
              From event discovery to registration tracking, CampusConnect is your complete campus companion.
            </p>
          </motion.div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon, title, description, color, dot }, i) => (
              <FeatureCard
                key={title}
                icon={icon}
                title={title}
                description={description}
                color={color}
                dot={dot}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-20 px-4 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center relative z-10"
          >
            <div
              className="rounded-3xl p-10"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <h2 className="text-3xl font-bold text-white mb-3">
                Ready to connect?
              </h2>
              <p className="mb-8" style={{ color: 'var(--cc-text-muted)' }}>
                Join your campus community. Discover events that matter to you.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
                  Create Account <FaArrowRight className="text-sm" />
                </Link>
                <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-6 py-3">
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

const colorMap = {
  indigo: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.2)', icon: '#6366f1'  },
  blue:   { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.2)', icon: '#3b82f6'  },
  purple: { bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.2)', icon: '#8b5cf6'  },
  pink:   { bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.2)', icon: '#ec4899'  },
};

const FeatureCard = ({ icon, title, description, color, index }) => {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1a1f2e 100%)',
        border: '1px solid rgba(99,102,241,0.12)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = c.border;
        e.currentTarget.style.boxShadow = `0 8px 30px ${c.bg}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5"
        style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.icon }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-white text-base mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--cc-text-muted)' }}>{description}</p>
    </motion.div>
  );
};

export default Home;
