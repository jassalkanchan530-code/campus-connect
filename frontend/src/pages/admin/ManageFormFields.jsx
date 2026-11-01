import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaWpforms } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import {
  getFormFields, addFormField, updateFormField, deleteFormField,
} from '../../services/registrationService';
import { getEventById } from '../../services/eventService';

const FIELD_TYPES = ['text', 'number', 'email', 'textarea', 'select'];

const EMPTY_FIELD = {
  field_label:   '',
  field_type:    'text',
  field_options: '',
  is_required:   true,
  field_order:   0,
};

/* ── tiny sub-component: the add/edit form row ─────────────────────────────── */
const FieldForm = ({ initial = EMPTY_FIELD, onSave, onCancel, saving, label }) => {
  const [form, setForm] = useState({ ...initial });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const inputCls = 'px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-blue-800">{label}</h3>

      {/* Label + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Field Label *</label>
          <input
            type="text"
            value={form.field_label}
            onChange={(e) => set('field_label', e.target.value)}
            placeholder="e.g. College Name"
            className={`${inputCls} w-full`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Field Type *</label>
          <select
            value={form.field_type}
            onChange={(e) => set('field_type', e.target.value)}
            className={`${inputCls} w-full`}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Options (only for select) */}
      {form.field_type === 'select' && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Options * <span className="text-gray-400 font-normal">(comma-separated, e.g. CSE, ECE, ME)</span>
          </label>
          <input
            type="text"
            value={form.field_options}
            onChange={(e) => set('field_options', e.target.value)}
            placeholder="Option A, Option B, Option C"
            className={`${inputCls} w-full`}
          />
        </div>
      )}

      {/* Order + Required */}
      <div className="flex items-center gap-5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
          <input
            type="number"
            value={form.field_order}
            min={0}
            onChange={(e) => set('field_order', Number(e.target.value))}
            className={`${inputCls} w-20`}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={!!form.is_required}
            onChange={(e) => set('is_required', e.target.checked)}
            className="w-4 h-4 accent-blue-700"
          />
          Required field
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Field'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Main page ─────────────────────────────────────────────────────────────── */
const ManageFormFields = () => {
  const { id: eventId } = useParams();

  const [event,      setEvent]      = useState(null);
  const [fields,     setFields]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editingId,  setEditingId]  = useState(null);   // field id being edited
  const [showAdd,    setShowAdd]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [evRes, fieldsRes] = await Promise.all([
          getEventById(eventId),
          getFormFields(eventId),
        ]);
        setEvent(evRes.data.data);
        setFields(fieldsRes.data.data);
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [eventId]);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };

  const handleAdd = async (form) => {
    if (!form.field_label.trim()) return setError('Field label is required.');
    if (form.field_type === 'select' && !form.field_options.trim()) return setError('Options are required for select fields.');
    try {
      setSaving(true);
      setError('');
      await addFormField(eventId, form);
      // Refresh
      const res = await getFormFields(eventId);
      setFields(res.data.data);
      setShowAdd(false);
      flash('Field added successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add field.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (fieldId, form) => {
    if (!form.field_label.trim()) return setError('Field label is required.');
    try {
      setSaving(true);
      setError('');
      await updateFormField(eventId, fieldId, form);
      const res = await getFormFields(eventId);
      setFields(res.data.data);
      setEditingId(null);
      flash('Field updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update field.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fieldId, label) => {
    if (!window.confirm(`Delete field "${label}"? Any existing responses will also be deleted.`)) return;
    try {
      setDeletingId(fieldId);
      await deleteFormField(eventId, fieldId);
      setFields((prev) => prev.filter((f) => f.id !== fieldId));
      flash('Field deleted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete field.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-6"><Loader message="Loading form fields…" /></div>;

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <Link to="/admin/events" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm mb-6">
        <FaArrowLeft /> Back to Events
      </Link>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaWpforms className="text-blue-600" /> Form Fields
          </h1>
          {event && (
            <p className="text-gray-500 text-sm mt-0.5">
              Event: <span className="font-medium text-gray-700">{event.title}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            to={`/admin/events/${eventId}/registrations`}
            className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            View Registrations
          </Link>
          {!showAdd && (
            <button
              onClick={() => { setShowAdd(true); setEditingId(null); }}
              className="flex items-center gap-1.5 bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
            >
              <FaPlus /> Add Field
            </button>
          )}
        </div>
      </div>

      {/* Flash */}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{success}</div>}
      {error   && <div className="bg-red-50   border border-red-200   text-red-700   text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

      {/* Add form */}
      {showAdd && (
        <div className="mb-5">
          <FieldForm
            label="Add New Field"
            onSave={handleAdd}
            onCancel={() => setShowAdd(false)}
            saving={saving}
          />
        </div>
      )}

      {/* Existing fields */}
      {fields.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-400">
          <FaWpforms className="text-5xl mx-auto mb-3 opacity-20" />
          <p>No form fields yet. Students will only need to click "Confirm".</p>
          <button onClick={() => setShowAdd(true)} className="mt-2 text-blue-600 hover:underline text-sm">
            Add your first field
          </button>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field) =>
          editingId === field.id ? (
            <FieldForm
              key={field.id}
              label={`Edit: "${field.field_label}"`}
              initial={{
                field_label:   field.field_label,
                field_type:    field.field_type,
                field_options: field.field_options || '',
                is_required:   !!field.is_required,
                field_order:   field.field_order,
              }}
              onSave={(form) => handleUpdate(field.id, form)}
              onCancel={() => setEditingId(null)}
              saving={saving}
            />
          ) : (
            <div
              key={field.id}
              className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800 text-sm">{field.field_label}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{field.field_type}</span>
                  {field.is_required
                    ? <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">required</span>
                    : <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">optional</span>}
                  <span className="text-xs text-gray-400">order: {field.field_order}</span>
                </div>
                {field.field_options && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">Options: {field.field_options}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { setEditingId(field.id); setShowAdd(false); }}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-gray-200 transition"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(field.id, field.field_label)}
                  disabled={deletingId === field.id}
                  className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                >
                  <FaTrash /> {deletingId === field.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ManageFormFields;
