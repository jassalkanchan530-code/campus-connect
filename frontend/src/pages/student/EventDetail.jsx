import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaClock,
  FaUsers, FaArrowLeft, FaTag, FaCheckCircle, FaArrowRight,
} from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { getEventById } from '../../services/eventService';
import { checkMyRegistration } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/UIComponents';

const CATEGORY_COLORS = {
  Workshop:  '#a78bfa',
  Seminar:   '#60a5fa',
  Cultural:  '#f472b6',
  Sports:    '#4ade80',
  Technical: '#fb923c',
  Other:     '#94a3b8',
};

const fmtFull = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const EventDetail = () => {
  const { id }                         = useParams();
  const { isAuthenticated, isStudent } = useAuth();
  const navigate                       = useNavigate();

  const [event,   setEvent]   = useState(null);
  const [myReg,   setMyReg]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [getEventById(id)];
        if (isAuthenticated && isStudent) promises.push(checkMyRegistration(id));
        const [evRes, regRes] = await Promise.all(promises);
        setEvent(evRes.data.data);
        if (regRes?.data?.registered) setMyReg(regRes.data.data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Event not found.' : 'Failed to load event.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated, isStudent]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><Loader message="Loading event details…" /></div>;

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>
      <Link to="/events" className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
        <FaArrowLeft /> Back to Events
      </Link>
    </div>
  );

  const spotsLeft      = event.max_participants != null ? event.max_participants - (event.registered_count || 0) : null;
  const isFull         = spotsLeft !== null && spotsLeft <= 0;
  const deadlinePassed = event.last_registration_date && new Date(event.last_registration_date) < new Date();
  const catColor       = CATEGORY_COLORS[event.category] || CATEGORY_COLORS['Other'];

  const renderCTA = () => {
    if (!isAuthenticated) {
      return (
        <Link to="/login" className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
          Login to Register <FaArrowRight className="text-sm" />
        </Link>
      );
    }
    if (myReg) {
      return (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-green-400 font-semibold">
            <FaCheckCircle />
            You are registered for this event
          </div>
          <Link
            to={`/registrations/${myReg.id}`}
            className="btn-secondary flex items-center gap-2 text-sm px-4 py-2"
          >
            View My Registration
          </Link>
        </div>
      );
    }
    if (isFull) {
      return (
        <button disabled className="px-8 py-3 rounded-xl text-base font-semibold opacity-50 cursor-not-allowed" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--cc-text-muted)' }}>
          Event is Full
        </button>
      );
    }
    if (deadlinePassed) {
      return (
        <button disabled className="px-8 py-3 rounded-xl text-base font-semibold opacity-50 cursor-not-allowed" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--cc-text-muted)' }}>
          Registration Closed
        </button>
      );
    }
    if (isStudent) {
      return (
        <Link to={`/events/${id}/register`} className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
          Register for Event <FaArrowRight className="text-sm" />
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8" style={{ background: 'var(--cc-navy)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link to="/events" className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors mb-6 group">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Events
        </Link>

        {/* Hero image */}
        {event.image_url && (
          <div className="w-full h-56 rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl overflow-hidden mb-6"
          style={{
            background: 'linear-gradient(135deg, #111827 0%, #1a1f2e 100%)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          {/* Top accent */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${catColor}, rgba(99,102,241,0.3))` }} />

          <div className="p-6 sm:p-8">
            {/* Category + author */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              {event.category && (
                <span className="badge" style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40` }}>
                  <FaTag className="text-xs" /> {event.category}
                </span>
              )}
              {event.created_by_name && (
                <span className="text-xs" style={{ color: 'var(--cc-text-faint)' }}>
                  By {event.created_by_name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-6">
              {event.title}
            </h1>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <InfoRow icon={<FaCalendarAlt style={{ color: '#818cf8' }} />} label="Date & Time"           value={fmtFull(event.event_date)} />
              <InfoRow icon={<FaMapMarkerAlt style={{ color: '#60a5fa' }} />} label="Venue"                  value={event.venue} />
              {event.last_registration_date && (
                <InfoRow icon={<FaClock style={{ color: '#fb923c' }} />} label="Registration Deadline" value={fmtFull(event.last_registration_date)} />
              )}
              <InfoRow
                icon={<FaUsers style={{ color: isFull ? '#f87171' : '#4ade80' }} />}
                label="Seats Available"
                value={
                  spotsLeft === null ? 'Unlimited' :
                  isFull             ? 'Event is full' :
                  `${spotsLeft} of ${event.max_participants} spots remaining`
                }
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="font-semibold text-white mb-3 text-lg">About this Event</h2>
              <p className="leading-relaxed whitespace-pre-line text-sm" style={{ color: 'var(--cc-text-muted)' }}>
                {event.description}
              </p>
            </div>

            {/* CTA */}
            <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {renderCTA()}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <span className="mt-0.5 shrink-0">{icon}</span>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--cc-text-faint)' }}>{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  </div>
);

export default EventDetail;
