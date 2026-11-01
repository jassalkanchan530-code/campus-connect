import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaArrowRight } from 'react-icons/fa';

const CATEGORY_STYLES = {
  Workshop:  { color: 'badge-purple', dot: '#a78bfa' },
  Seminar:   { color: 'badge-blue',   dot: '#60a5fa' },
  Cultural:  { color: 'badge-pink',   dot: '#f472b6' },
  Sports:    { color: 'badge-green',  dot: '#4ade80' },
  Technical: { color: 'badge-orange', dot: '#fb923c' },
  Other:     { color: 'badge-gray',   dot: '#94a3b8' },
};

const fmtDate = (dateStr) => {
  if (!dateStr) return { day: '—', month: '', year: '' };
  const d = new Date(dateStr);
  return {
    day:   d.toLocaleDateString('en-IN', { day: '2-digit' }),
    month: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    year:  d.toLocaleDateString('en-IN', { year: 'numeric' }),
    time:  d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    full:  d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
};

/**
 * EventCard — premium interactive event card with hover elevation effect.
 * Features: floating date badge, category tag, animated CTA arrow.
 */
const EventCard = ({ event, index = 0 }) => {
  const {
    id, title, category, event_date, venue,
    last_registration_date, description,
    max_participants, registered_count,
  } = event;

  const style   = CATEGORY_STYLES[category] || CATEGORY_STYLES['Other'];
  const spotsLeft = max_participants != null ? max_participants - (registered_count || 0) : null;
  const isFull  = spotsLeft !== null && spotsLeft <= 0;
  const dateInfo = fmtDate(event_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="relative flex flex-col rounded-2xl overflow-hidden group"
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1a1f2e 100%)',
        border: '1px solid rgba(99,102,241,0.15)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.2), 0 4px 24px rgba(0,0,0,0.4)';
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)';
      }}
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #3b82f6)' }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header: Date badge + category */}
        <div className="flex items-start justify-between mb-4">
          {/* Floating date badge */}
          <div
            className="flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0"
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <span className="text-xl font-bold text-white leading-none">{dateInfo.day}</span>
            <span className="text-xs font-semibold leading-none mt-0.5" style={{ color: '#a78bfa' }}>{dateInfo.month}</span>
          </div>

          {/* Category badge */}
          {category && (
            <span className={`badge ${style.color}`}>
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: style.dot }}
              />
              {category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-base leading-snug line-clamp-2 mb-3 group-hover:text-indigo-300 transition-colors duration-200">
          {title}
        </h3>

        {/* Info */}
        <div className="space-y-1.5 flex-1 mb-4">
          <InfoLine icon={<FaMapMarkerAlt className="text-indigo-400 shrink-0" />} text={venue} />
          {event_date && (
            <InfoLine icon={<FaClock className="text-blue-400 shrink-0" />} text={`${dateInfo.time} · ${dateInfo.year}`} />
          )}
          {last_registration_date && (
            <InfoLine
              icon={<FaCalendarAlt className="text-amber-400 shrink-0" />}
              text={`Register by ${fmtDate(last_registration_date).full}`}
            />
          )}
          {spotsLeft !== null && (
            <InfoLine
              icon={
                <FaUsers className={`shrink-0 ${isFull ? 'text-red-400' : 'text-green-400'}`} />
              }
              text={isFull ? 'Event full' : `${spotsLeft} spots left`}
            />
          )}
          {description && (
            <p className="text-sm line-clamp-2 mt-2" style={{ color: 'var(--cc-text-muted)' }}>
              {description}
            </p>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/events/${id}`}
          className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 group/btn"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span>View Event</span>
          <FaArrowRight className="text-xs transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
};

const InfoLine = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--cc-text-muted)' }}>
    <span>{icon}</span>
    <span className="truncate">{text}</span>
  </div>
);

export default EventCard;
