import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import EventForm from '../../components/events/EventForm';
import Loader from '../../components/common/Loader';
import { getEventById, updateEvent } from '../../services/eventService';

const EditEvent = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [event,      setEvent]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getEventById(id);
        setEvent(res.data.data);
      } catch {
        setError('Failed to load event. It may no longer exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError('');
      await updateEvent(id, formData);
      navigate('/admin/events', { state: { success: 'Event updated successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6"><Loader message="Loading event…" /></div>;

  return (
    <div className="p-6 max-w-2xl">
      <Link
        to="/admin/events"
        className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm mb-6"
      >
        <FaArrowLeft /> Back to Events
      </Link>

      <h1 className="text-xl font-bold text-gray-800 mb-6">Edit Event</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {event && (
        <EventForm
          initialData={event}
          onSubmit={handleSubmit}
          loading={submitting}
          submitLabel="Update Event"
        />
      )}
    </div>
  );
};

export default EditEvent;
