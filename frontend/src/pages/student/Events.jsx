import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaSearch, FaTimes } from 'react-icons/fa';
import EventCard from '../../components/events/EventCard';
import Loader from '../../components/common/Loader';
import { getEvents } from '../../services/eventService';
import { PageHeader, EmptyState } from '../../components/ui/UIComponents';

const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'Technical', 'Other'];

const Events = () => {
  const [events,   setEvents]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getEvents();
        setEvents(res.data.data);
        setFiltered(res.data.data);
      } catch {
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      events.filter((e) => {
        const matchSearch =
          e.title.toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q);
        const matchCat = category === 'All' || e.category === category;
        return matchSearch && matchCat;
      })
    );
  }, [search, category, events]);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8" style={{ background: 'var(--cc-navy)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Page header */}
        <PageHeader
          icon={<FaCalendarAlt />}
          title="Campus Events"
          subtitle="Discover and register for events happening around your campus"
        />

        {/* Search + filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
              style={{ color: 'var(--cc-text-faint)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by title, category, venue…"
              className="input-dark pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--cc-text-faint)' }}
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={
                  category === cat
                    ? {
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        boxShadow: '0 2px 12px rgba(99,102,241,0.3)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--cc-text-muted)',
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Result count */}
        {!loading && !error && (
          <p className="text-xs mb-4" style={{ color: 'var(--cc-text-faint)' }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
            {(search || category !== 'All') && (
              <button
                onClick={() => { setSearch(''); setCategory('All'); }}
                className="ml-2 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </p>
        )}

        {/* States */}
        {loading && <Loader message="Loading events…" />}

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
          >
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<FaCalendarAlt />}
            title="No events found"
            message={
              search || category !== 'All'
                ? 'Try different search terms or clear the filters.'
                : 'No upcoming events at the moment. Check back soon!'
            }
            action={
              (search || category !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setCategory('All'); }}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Clear filters
                </button>
              )
            }
          />
        )}

        {/* Event grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
