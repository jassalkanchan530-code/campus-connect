import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaEye } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { getEventRegistrations } from '../../services/registrationService';

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

const EventRegistrations = () => {
  const { id: eventId } = useParams();

  const [event,    setEvent]   = useState(null);
  const [regs,     setRegs]    = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getEventRegistrations(eventId);
        setEvent(res.data.event);
        setRegs(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load registrations.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [eventId]);

  return (
    <div className="p-6">
      {/* Header */}
      <Link to="/admin/events" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm mb-6">
        <FaArrowLeft /> Back to Events
      </Link>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaUsers className="text-blue-600" /> Event Registrations
          </h1>
          {event && (
            <p className="text-gray-500 text-sm mt-0.5">
              Event: <span className="font-medium text-gray-700">{event.title}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            to={`/admin/events/${eventId}/form-fields`}
            className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Manage Form Fields
          </Link>
        </div>
      </div>

      {loading && <Loader message="Loading registrations…" />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && regs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FaUsers className="text-5xl mx-auto mb-3 opacity-20" />
          <p className="text-lg">No registrations yet for this event.</p>
        </div>
      )}

      {!loading && regs.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-semibold text-gray-700">{regs.length}</span> student(s) registered
          </p>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['#', 'Name', 'Email', 'Department', 'Roll No.', 'Registered At', 'Status', 'Responses'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {regs.map((reg, idx) => (
                    <tr key={reg.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{reg.name}</td>
                      <td className="px-4 py-3 text-gray-500">{reg.email}</td>
                      <td className="px-4 py-3 text-gray-500">{reg.department || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{reg.roll_number || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(reg.registered_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[reg.status] || 'bg-gray-100 text-gray-600'}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/registrations/${reg.id}`}
                          className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-blue-100 transition"
                        >
                          <FaEye /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventRegistrations;
