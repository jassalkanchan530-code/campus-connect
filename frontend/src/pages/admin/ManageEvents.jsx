import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaWpforms, FaUsers } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { getAllEventsAdmin, deleteEvent } from '../../services/eventService';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const ManageEvents = () => {
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Show success flash from navigate state (after create/edit)
    if (location.state?.success) {
      setSuccessMsg(location.state.success);
      window.history.replaceState({}, '');
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAllEventsAdmin();
      setEvents(res.data.data);
    } catch {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      setDeletingId(id);
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSuccessMsg('Event deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" /> Manage Events
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{events.length} event(s) total</p>
        </div>
        <Link
          to="/admin/events/create"
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
        >
          <FaPlus /> New Event
        </Link>
      </div>

      {/* Flash messages */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {loading && <Loader message="Loading events…" />}

      {/* Empty state */}
      {!loading && events.length === 0 && !error && (
        <div className="text-center py-20 text-gray-300">
          <FaCalendarAlt className="text-6xl mx-auto mb-4" />
          <p className="text-lg text-gray-400">No events yet.</p>
          <Link to="/admin/events/create" className="mt-2 inline-block text-blue-600 hover:underline text-sm">
            Create your first event
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && events.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Title', 'Category', 'Event Date', 'Venue', 'Registrations', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((ev) => {
                  const isPast = new Date(ev.event_date) < new Date();
                  return (
                    <tr key={ev.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{ev.title}</span>
                          {isPast && (
                            <span className="shrink-0 text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                              Past
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{ev.category || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(ev.event_date)}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{ev.venue}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {ev.registered_count}
                        {ev.max_participants != null && ` / ${ev.max_participants}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            to={`/admin/events/${ev.id}/edit`}
                            className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-gray-200 transition"
                          >
                            <FaEdit /> Edit
                          </Link>
                          <Link
                            to={`/admin/events/${ev.id}/form-fields`}
                            className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-purple-100 transition"
                          >
                            <FaWpforms /> Fields
                          </Link>
                          <Link
                            to={`/admin/events/${ev.id}/registrations`}
                            className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-green-100 transition"
                          >
                            <FaUsers /> Regs
                          </Link>
                          <button
                            onClick={() => handleDelete(ev.id, ev.title)}
                            disabled={deletingId === ev.id}
                            className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                          >
                            <FaTrash /> {deletingId === ev.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
