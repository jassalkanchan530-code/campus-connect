import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { getMyRegistrations } from '../../services/registrationService';

const STATUS_STYLE = {
  registered: 'bg-green-100 text-green-700',
  cancelled:  'bg-red-100   text-red-700',
};

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyRegistrations();
        setRegistrations(res.data.data);
      } catch {
        setError('Failed to load your registrations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaClipboardList className="text-blue-600" />
          My Registrations
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          All events you have registered for
        </p>
      </div>

      {loading && <Loader message="Loading your registrations…" />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && registrations.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <FaClipboardList className="text-6xl mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">You haven't registered for any events yet.</p>
          <Link
            to="/events"
            className="mt-3 inline-block text-blue-600 hover:underline text-sm"
          >
            Browse upcoming events →
          </Link>
        </div>
      )}

      {!loading && registrations.length > 0 && (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition"
            >
              {/* Event info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {reg.category && (
                    <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                      {reg.category}
                    </span>
                  )}
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[reg.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {reg.status}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{reg.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1.5">
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-blue-400" />
                    {fmt(reg.event_date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-blue-400" />
                    {reg.venue}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Registered on {fmt(reg.registered_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Link
                  to={`/registrations/${reg.id}`}
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
                >
                  View Details
                </Link>
                <Link
                  to={`/events/${reg.event_id}`}
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Event Page
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
