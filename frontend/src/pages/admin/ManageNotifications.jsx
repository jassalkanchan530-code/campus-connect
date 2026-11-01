import { useEffect, useState } from 'react';
import { FaBell, FaPlus, FaEdit, FaTrash, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import {
  getAllNotificationsAdmin,
  createNotification,
  updateNotification,
  deleteNotification,
} from '../../services/notificationService';

// ── Helpers ───────────────────────────────────────────────────────────────────
const emptyForm = { title: '', message: '' };

const ManageNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [formError, setFormError]         = useState('');
  const [formSuccess, setFormSuccess]     = useState('');

  // Modal state
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null); // null = create mode, object = edit mode
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = async () => {
    try {
      setError('');
      const res = await getAllNotificationsAdmin();
      setNotifications(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const openEdit = (n) => {
    setEditing(n);
    setForm({ title: n.title, message: n.message });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setFormSuccess('');
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const title   = form.title.trim();
    const message = form.message.trim();

    if (!title)   { setFormError('Title is required.'); return; }
    if (!message) { setFormError('Message is required.'); return; }

    setSaving(true);
    try {
      if (editing) {
        await updateNotification(editing.id, { title, message });
        setFormSuccess('Notification updated.');
      } else {
        await createNotification({ title, message });
        setFormSuccess('Notification created.');
      }
      await fetchNotifications();
      // Close after brief success flash
      setTimeout(closeModal, 900);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteNotification(deleteTarget.id);
      setDeleteTarget(null);
      await fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBell className="text-blue-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Manage Notifications</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <FaPlus /> New Notification
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          <FaBell className="text-4xl mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No notifications yet.</p>
          <p className="text-sm mt-1">Click "New Notification" to create the first one.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-800 mb-1">{n.title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line line-clamp-3">
                    {n.message}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt />
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                    {n.created_by_name && <span>By: {n.created_by_name}</span>}
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(n)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(n)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editing ? 'Edit Notification' : 'New Notification'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {formError && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{formError}</p>
              )}
              {formSuccess && (
                <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{formSuccess}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notification title"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Write your notification message…"
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Notification</h2>
            <p className="text-gray-600 text-sm mb-1">
              Are you sure you want to delete:
            </p>
            <p className="text-gray-800 font-semibold text-sm mb-5">
              "{deleteTarget.title}"
            </p>
            <p className="text-red-600 text-xs mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNotifications;
