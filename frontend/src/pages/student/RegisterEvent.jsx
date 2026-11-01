import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaTag, FaCheckCircle } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import RegistrationForm from '../../components/registration/RegistrationForm';
import { getEventById } from '../../services/eventService';
import { registerForEvent, checkMyRegistration } from '../../services/registrationService';

const RegisterEvent = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [event,          setEvent]          = useState(null);
  const [myReg,          setMyReg]          = useState(null);   // existing registration or null
  const [loading,        setLoading]        = useState(true);
  const [submitting,     setSubmitting]      = useState(false);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState(false);
  const [registrationId, setRegistrationId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, regRes] = await Promise.all([
          getEventById(id),
          checkMyRegistration(id),
        ]);
        setEvent(evRes.data.data);
        if (regRes.data.registered) {
          setMyReg(regRes.data.data);
        }
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Event not found.'
            : 'Failed to load event. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async ({ responses }) => {
    try {
      setSubmitting(true);
      setError('');
      const res = await registerForEvent(id, { responses });
      setRegistrationId(res.data.data.registrationId);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Loader message="Loading event details…" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">{error}</div>
        <Link to="/events" className="mt-4 inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm">
          <FaArrowLeft /> Back to Events
        </Link>
      </div>
    );
  }

  // ── Already registered ────────────────────────────────────────────────────
  if (myReg) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to={`/events/${id}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm mb-6">
          <FaArrowLeft /> Back to Event
        </Link>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-1">You are already registered!</h2>
          <p className="text-gray-500 text-sm mb-5">
            You registered for <strong>{event?.title}</strong> on{' '}
            {new Date(myReg.registered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to={`/registrations/${myReg.id}`}
              className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
            >
              View Registration
            </Link>
            <Link
              to="/my-registrations"
              className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              All My Registrations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Confirmed! 🎉</h2>
          <p className="text-gray-500 text-sm mb-6">
            You have successfully registered for <strong>{event?.title}</strong>.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              to={`/registrations/${registrationId}`}
              className="bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
            >
              View My Registration
            </Link>
            <Link
              to="/my-registrations"
              className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              All My Registrations
            </Link>
            <Link
              to="/events"
              className="text-blue-600 hover:underline text-sm self-center"
            >
              Browse More Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFull = event.max_participants &&
    (event.registered_count || 0) >= event.max_participants;
  const deadlinePassed = event.last_registration_date &&
    new Date(event.last_registration_date) < new Date();
  const isBlocked = isFull || deadlinePassed;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link to={`/events/${id}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm mb-6">
        <FaArrowLeft /> Back to Event Details
      </Link>

      {/* Event summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
        {event.category && (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
            <FaTag className="text-xs" /> {event.category}
          </span>
        )}
        <h1 className="text-xl font-bold text-gray-800 mb-1">{event.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt className="text-blue-500" />
            {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-blue-500" />
            {event.venue}
          </span>
        </div>
        {event.last_registration_date && (
          <p className="text-xs text-orange-600 mt-2">
            Registration deadline: {new Date(event.last_registration_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Blocked states */}
      {isBlocked && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {isFull ? 'This event is full. Registration is closed.' : 'The registration deadline has passed.'}
        </div>
      )}

      {!isBlocked && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            {event.form_fields?.length > 0
              ? 'Complete the registration form below'
              : 'Confirm your registration'}
          </h2>

          {/* API-level error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <RegistrationForm
            formFields={event.form_fields || []}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        </>
      )}
    </div>
  );
};

export default RegisterEvent;
