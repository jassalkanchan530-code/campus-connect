import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import EventForm from '../../components/events/EventForm';
import { createEvent } from '../../services/eventService';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      await createEvent(formData);
      navigate('/admin/events', { state: { success: 'Event created successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <Link
        to="/admin/events"
        className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm mb-6"
      >
        <FaArrowLeft /> Back to Events
      </Link>

      <h1 className="text-xl font-bold text-gray-800 mb-6">Create New Event</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <EventForm
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Create Event"
      />
    </div>
  );
};

export default CreateEvent;
