import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaBell, FaClipboardList, FaUser,
  FaArrowRight, FaCheckCircle, FaFire, FaGraduationCap,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getEvents } from '../../services/eventService';
import { getMyRegistrations } from '../../services/registrationService';
import { getNotifications } from '../../services/notificationService';
import AnimatedStatCard from '../../components/ui/AnimatedStatCard';
import { SectionHeader, EmptyState, LoadingState, StatusBadge } from '../../components/ui/UIComponents';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [events,        setEvents]        = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [evRes, regRes, notifRes] = await Promise.allSettled([
          getEvents(),
          getMyRegistrations(),
          getNotifications(),
        ]);
        if (evRes.status    === 'fulfilled') setEvents(evRes.value.data.data.slice(0, 3));
        if (regRes.status   === 'fulfilled') setRegistrations(regRes.value.data.data);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.data.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const recentRegs    = registrations.slice(0, 3);
  const activeCount   = registrations.filter((r) => r.status === 'registered').length;
  const firstName     = user?.name?.split(' ')[0] || 'there';
  const hour          = new Date().getHours();
  const greeting      = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div
      className="min-h-screen px-4 sm:px-6 py-8"
      style={{ background: 'var(--cc-navy)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Welcome Banner ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl mb-8 p-7 sm:p-10"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #1a1f2e 40%, #0f172a 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Background orbs inside banner */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(30px)' }}
          />
          <div
            className="absolute bottom-0 left-20 w-32 h-32 rounded-full opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', filter: 'blur(20px)' }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaGraduationCap className="text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {greeting}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {firstName}! ✨
              </h1>
              <p style={{ color: 'var(--cc-text-muted)' }}>
                Here's what's happening around your campus today.
              </p>
            </div>

            <Link
              to="/events"
              className="btn-primary shrink-0 flex items-center gap-2 self-start sm:self-auto"
            >
              <FaFire className="text-xs" /> Explore Events
            </Link>
          </div>
        </motion.div>

        {/* ── Stats Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <AnimatedStatCard
            icon={<FaCalendarAlt />}
            label="Upcoming Events"
            value={loading ? '…' : events.length}
            note="showing 3 nearest"
            color="indigo"
            index={0}
          />
          <AnimatedStatCard
            icon={<FaClipboardList />}
            label="My Registrations"
            value={loading ? '…' : registrations.length}
            color="blue"
            index={1}
          />
          <AnimatedStatCard
            icon={<FaCheckCircle />}
            label="Active"
            value={loading ? '…' : activeCount}
            color="green"
            index={2}
          />
          <AnimatedStatCard
            icon={<FaBell />}
            label="Notifications"
            value={loading ? '…' : notifications.length}
            note="latest 3"
            color="purple"
            index={3}
          />
        </div>

        {/* ── Quick Links ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { to: '/events',           icon: <FaCalendarAlt />,   label: 'Browse Events',    color: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  text: '#818cf8' } },
            { to: '/my-registrations', icon: <FaClipboardList />, label: 'My Registrations', color: { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  text: '#60a5fa' } },
            { to: '/notifications',    icon: <FaBell />,          label: 'Notifications',    color: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)',  text: '#a78bfa' } },
            { to: '/profile',          icon: <FaUser />,          label: 'My Profile',       color: { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)',  text: '#f472b6' } },
          ].map(({ to, icon, label, color }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.35 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
            >
              <Link
                to={to}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl text-sm font-medium transition-all duration-200 text-center"
                style={{
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  color: color.text,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px ${color.bg}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span className="text-2xl">{icon}</span>
                {label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upcoming Events */}
          <Section
            title="Upcoming Events"
            linkTo="/events"
            linkLabel="See all"
            loading={loading}
            empty={events.length === 0}
            emptyIcon={<FaCalendarAlt />}
            emptyTitle="No upcoming events"
            emptyMsg="Check back soon for new events."
          >
            <ul className="space-y-2">
              {events.map((ev, i) => (
                <motion.li
                  key={ev.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/events/${ev.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    {/* Date badge */}
                    <div
                      className="shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center text-center"
                      style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
                    >
                      <span className="text-xs font-bold text-white leading-none">
                        {new Date(ev.event_date).getDate()}
                      </span>
                      <span className="text-xs" style={{ color: '#a78bfa', fontSize: '0.6rem' }}>
                        {new Date(ev.event_date).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {ev.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--cc-text-faint)' }}>
                        {fmtTime(ev.event_date)} · {ev.venue}
                      </p>
                    </div>
                    <FaArrowRight className="text-xs shrink-0 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </Section>

          {/* Recent Registrations */}
          <Section
            title="Recent Registrations"
            linkTo="/my-registrations"
            linkLabel="View all"
            loading={loading}
            empty={recentRegs.length === 0}
            emptyIcon={<FaClipboardList />}
            emptyTitle="No registrations yet"
            emptyMsg="Register for an event to see it here."
            emptyAction={<Link to="/events" className="btn-primary text-xs px-4 py-2">Browse Events</Link>}
          >
            <ul className="space-y-2">
              {recentRegs.map((reg, i) => (
                <motion.li
                  key={reg.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/registrations/${reg.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    <div
                      className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}
                    >
                      <FaCheckCircle className="text-green-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {reg.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={reg.status} />
                        <span className="text-xs" style={{ color: 'var(--cc-text-faint)' }}>
                          {fmt(reg.registered_at)}
                        </span>
                      </div>
                    </div>
                    <FaArrowRight className="text-xs shrink-0 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </Section>

          {/* Recent Notifications — full width */}
          <Section
            title="Recent Notifications"
            linkTo="/notifications"
            linkLabel="See all"
            loading={loading}
            empty={notifications.length === 0}
            emptyIcon={<FaBell />}
            emptyTitle="No notifications yet"
            emptyMsg="Admins will notify you about important campus updates here."
            className="lg:col-span-2"
          >
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.12)',
                  }}
                >
                  <div
                    className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
                  >
                    <FaBell className="text-indigo-400 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{n.title}</p>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--cc-text-muted)' }}>{n.message}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--cc-text-faint)' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

// ── Section wrapper ─────────────────────────────────────────────────────────
const Section = ({
  title, linkTo, linkLabel, loading, empty,
  emptyIcon, emptyTitle, emptyMsg, emptyAction,
  children, className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`rounded-2xl p-5 ${className}`}
    style={{
      background: 'linear-gradient(135deg, #111827 0%, #1a1f2e 100%)',
      border: '1px solid rgba(99,102,241,0.12)',
    }}
  >
    <SectionHeader
      title={title}
      action={
        <Link
          to={linkTo}
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          {linkLabel} <FaArrowRight className="text-xs" />
        </Link>
      }
    />
    {loading ? (
      <LoadingState rows={3} />
    ) : empty ? (
      <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMsg} action={emptyAction} />
    ) : (
      children
    )}
  </motion.div>
);

export default StudentDashboard;
