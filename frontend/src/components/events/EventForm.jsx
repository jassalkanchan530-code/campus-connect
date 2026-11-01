import { useState, useEffect } from 'react';

const CATEGORIES = ['Workshop', 'Seminar', 'Cultural', 'Sports', 'Technical', 'Other'];

/** Convert a MySQL/ISO date string to the value expected by <input type="datetime-local"> */
const toDateTimeLocal = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

const EMPTY = {
  title: '', description: '', venue: '', event_date: '',
  last_registration_date: '', max_participants: '', category: '', image_url: '',
};

const EventForm = ({ initialData = {}, onSubmit, loading = false, submitLabel = 'Save Event' }) => {
  const [form, setForm]   = useState(EMPTY);
  const [error, setError] = useState('');

  // Populate form when editing (initialData arrives after a fetch)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({
        title:                 initialData.title                 || '',
        description:           initialData.description           || '',
        venue:                 initialData.venue                 || '',
        event_date:            toDateTimeLocal(initialData.event_date),
        last_registration_date: toDateTimeLocal(initialData.last_registration_date),
        max_participants:      initialData.max_participants       ?? '',
        category:              initialData.category              || '',
        image_url:             initialData.image_url             || '',
      });
    }
  }, [initialData?.id]); // re-run only when the event id changes

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim() || !form.venue.trim() || !form.event_date) {
      return setError('Title, description, venue, and event date are required.');
    }

    onSubmit({
      ...form,
      max_participants: form.max_participants !== '' ? Number(form.max_participants) : null,
    });
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl border border-gray-100">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
        <input type="text" name="title" value={form.title} onChange={handleChange}
          placeholder="e.g. Annual Tech Fest 2025" className={inputCls} />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
          <option value="">— Select a category —</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
        <textarea name="description" value={form.description} onChange={handleChange}
          rows={4} placeholder="Describe the event…" className={inputCls} />
      </div>

      {/* Venue */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Venue <span className="text-red-500">*</span></label>
        <input type="text" name="venue" value={form.venue} onChange={handleChange}
          placeholder="e.g. Main Auditorium" className={inputCls} />
      </div>

      {/* Event Date + Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Date & Time <span className="text-red-500">*</span></label>
          <input type="datetime-local" name="event_date" value={form.event_date} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
          <input type="datetime-local" name="last_registration_date" value={form.last_registration_date} onChange={handleChange} className={inputCls} />
        </div>
      </div>

      {/* Max Participants + Image URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
          <input type="number" name="max_participants" value={form.max_participants} onChange={handleChange}
            min={1} placeholder="Leave blank for unlimited" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input type="url" name="image_url" value={form.image_url} onChange={handleChange}
            placeholder="https://…" className={inputCls} />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
};

export default EventForm;
