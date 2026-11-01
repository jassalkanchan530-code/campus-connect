import { useState } from 'react';

/**
 * Renders a dynamic registration form from event_form_fields.
 * Supported types: text | number | email | select | textarea
 *
 * Props:
 *   formFields  – array of event_form_fields rows
 *   onSubmit    – called with { responses: [{ field_id, answer }] }
 *   loading     – boolean to disable submit while submitting
 */
const RegistrationForm = ({ formFields = [], onSubmit, loading = false }) => {
  const [answers, setAnswers] = useState({});
  const [error,   setError]   = useState('');

  const handleChange = (fieldId, value) => {
    setError('');
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Client-side: validate required fields
    for (const field of formFields) {
      if (field.is_required) {
        const val = (answers[field.id] ?? '').toString().trim();
        if (!val) {
          return setError(`"${field.field_label}" is required.`);
        }
      }
    }

    const responses = formFields
      .filter((f) => (answers[f.id] ?? '').toString().trim() !== '')
      .map((f) => ({
        field_id: f.id,
        answer:   (answers[f.id] ?? '').toString().trim(),
      }));

    onSubmit({ responses });
  };

  const inputCls =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  const renderField = (field) => {
    const value    = answers[field.id] ?? '';
    const onChange = (e) => handleChange(field.id, e.target.value);

    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            rows={3}
            value={value}
            onChange={onChange}
            className={inputCls}
            placeholder={`Enter ${field.field_label.toLowerCase()}…`}
          />
        );

      case 'select': {
        const opts = (field.field_options || '')
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);
        return (
          <select value={value} onChange={onChange} className={inputCls}>
            <option value="">— Select an option —</option>
            {opts.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }

      default: // text | number | email
        return (
          <input
            type={field.field_type}
            value={value}
            onChange={onChange}
            className={inputCls}
            placeholder={`Enter ${field.field_label.toLowerCase()}…`}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {formFields.length === 0 ? (
        <p className="text-gray-500 text-sm bg-gray-50 rounded-lg px-4 py-3">
          No additional information required for this event.
        </p>
      ) : (
        formFields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.field_label}
              {field.is_required ? (
                <span className="text-red-500 ml-0.5">*</span>
              ) : (
                <span className="text-gray-400 text-xs ml-1">(optional)</span>
              )}
            </label>
            {renderField(field)}
          </div>
        ))
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting registration…' : 'Confirm Registration'}
      </button>
    </form>
  );
};

export default RegistrationForm;
