import { useState, useEffect } from 'react';
import { FaUserShield, FaPlus, FaCheck, FaBan, FaTimes } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import {
  getAdmins, createAdmin, activateAdmin, deactivateAdmin,
} from '../../services/superAdminService';

const EMPTY_FORM = { name: '', email: '', password: '' };

const AdminManagement = () => {
  const [admins,    setAdmins]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [actionId,  setActionId]  = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await getAdmins();
      setAdmins(res.data.data);
    } catch {
      flash('Failed to load admin accounts.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return flash('All fields are required.', true);
    }
    try {
      setSaving(true);
      await createAdmin(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchAdmins();
      flash('Admin account created successfully.');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to create admin.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (admin) => {
    const isActive = admin.status === 'active';
    const verb = isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${verb} "${admin.name}"?`)) return;

    try {
      setActionId(admin.id);
      if (isActive) {
        await deactivateAdmin(admin.id);
        flash(`"${admin.name}" has been deactivated. They can no longer log in.`);
      } else {
        await activateAdmin(admin.id);
        flash(`"${admin.name}" has been activated.`);
      }
      await fetchAdmins();
    } catch (err) {
      flash(err.response?.data?.message || `Failed to ${verb} admin.`, true);
    } finally {
      setActionId(null);
    }
  };

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserShield className="text-indigo-600" /> Admin Management
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Create and manage admin accounts. Only super admins can do this.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-800 transition"
          >
            <FaPlus /> Create Admin
          </button>
        )}
      </div>

      {/* Flash messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Create Admin Form */}
      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-indigo-800">Create New Admin Account</h2>
            <button onClick={() => setShowForm(false)} className="text-indigo-400 hover:text-indigo-600">
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Jane Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@institute.edu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-3 flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create Admin'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
          <p className="text-xs text-indigo-600 mt-3">
            ℹ️ The new account will always be created with role = <strong>admin</strong> and status = <strong>active</strong>.
          </p>
        </div>
      )}

      {/* Admin List */}
      {loading && <Loader message="Loading admins…" />}

      {!loading && admins.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <FaUserShield className="text-6xl mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No admin accounts yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 text-indigo-600 hover:underline text-sm"
          >
            Create the first admin
          </button>
        </div>
      )}

      {!loading && admins.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Status', 'Created', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{admin.name}</td>
                    <td className="px-4 py-3 text-gray-500">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                          admin.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmt(admin.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(admin)}
                        disabled={actionId === admin.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition disabled:opacity-50 ${
                          admin.status === 'active'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {actionId === admin.id ? (
                          '…'
                        ) : admin.status === 'active' ? (
                          <><FaBan /> Deactivate</>
                        ) : (
                          <><FaCheck /> Activate</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
