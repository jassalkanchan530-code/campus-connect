import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt,
  FaCheckCircle, FaClipboardList,
} from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { getRegistrationById } from '../../services/registrationService';

const STATUS_STYLE = {
  registered: 'bg-green-100 text-green-700',
  cancelled:  'bg-red-100   text-red-700',
};

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long',
        year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

const RegistrationDetail = () => {
  const { id } = useParams();

  const [reg,     setReg]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRegistrationById(id);
        setReg(res.data.data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Registration not found.'
            : 'Failed to load registration details.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8"><Loader message="Loading registration…" /></div>;

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">{error}</div>
      <Link to="/my-registrations" className="mt-4 inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm">
        <FaArrowLeft /> My Registrations
      </Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link to="/my-registrations" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm mb-6">
        <FaArrowLeft /> My Registrations
      </Link>

      {/* Status header */}
      <div className="flex items-center gap-3 mb-6">
        <FaCheckCircle className="text-green-500 text-3xl shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{reg.title}</h1>
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1 capitalize ${STATUS_STYLE[reg.status] || 'bg-gray-100 text-gray-600'}`}>
            {reg.status}
          </span>
        </div>
      </div>

      {/* Event info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-5 space-y-2.5">
        <InfoRow icon={<FaCalendarAlt className="text-blue-600" />} label="Event Date"  value={fmt(reg.event_date)} />
        <InfoRow icon={<FaMapMarkerAlt className="text-blue-600" />} label="Venue"       value={reg.venue} />
        <InfoRow icon={<FaClipboardList className="text-blue-600" />} label="Registered" value={fmt(reg.registered_at)} />
      </div>

      {/* Registration ID */}
      <p className="text-xs text-gray-400 mb-6">Registration ID: <code className="bg-gray-100 px-1.5 py-0.5 rounded">#{reg.id}</code></p>

      {/* Form responses */}
      {reg.responses?.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Registration Form Responses</h2>
          <div className="space-y-4">
            {reg.responses.map((r) => (
              <div key={r.field_id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{r.field_label}</p>
                <p className="text-gray-700 text-sm font-medium">{r.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-center">
          No custom form responses for this registration.
        </div>
      )}

      {/* Links */}
      <div className="mt-6 flex gap-3">
        <Link
          to={`/events/${reg.event_id}`}
          className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          View Event
        </Link>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <span className="mt-0.5 shrink-0">{icon}</span>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-gray-700 text-sm font-medium mt-0.5">{value}</p>
    </div>
  </div>
);

export default RegistrationDetail;
