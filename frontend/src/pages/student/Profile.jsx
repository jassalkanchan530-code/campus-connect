import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaBuilding, FaIdCard,
  FaEdit, FaLock, FaCalendarAlt, FaArrowLeft,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getMe, updateMe, changePassword } from '../../services/userService';

const TABS = ['Profile', 'Edit Profile', 'Change Password'];

const Profile = () => {
  const { user: authUser, login } = useAuth();
  const navigate = useNavigate();

  const [tab,     setTab]     = useState('Profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Edit form state
  const [editForm,    setEditForm]    = useState({ name: '', department: '', roll_number: '' });
  const [editError,   setEditError]   = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editSaving,  setEditSaving]  = useState(false);

  // Password form state
  const [pwForm,    setPwForm]    = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError,   setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving,  setPwSaving]  = useState(false);

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMe();
        setProfile(res.data.data);
        setEditForm({
          name:        res.data.data.name        || '',
          department:  res.data.data.department  || '',
          roll_number: res.data.data.roll_number || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Save profile edits ─────────────────────────────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    if (!editForm.name.trim()) { setEditError('Name is required.'); return; }

    setEditSaving(true);
    try {
      const res = await updateMe(editForm);
      setProfile(res.data.data);
      // Update the name in AuthContext so the navbar reflects the change
      login({ ...authUser, name: res.data.data.name }, localStorage.getItem('token'));
      setEditSuccess('Profile updated successfully.');
      setTimeout(() => setTab('Profile'), 1200);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!pwForm.currentPassword) { setPwError('Current password is required.'); return; }
    if (!pwForm.newPassword)     { setPwError('New password is required.'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('New passwords do not match.'); return; }

    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwSaving(false);
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

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-red-600 text-center bg-red-50 border border-red-200 rounded-lg p-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back to dashboard */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm mb-6">
        <FaArrowLeft /> Dashboard
      </Link>

      {/* Page title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 text-blue-700 rounded-full p-3">
          <FaUser className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{profile?.name}</h1>
          <p className="text-sm text-gray-500 capitalize">{profile?.role?.replace('_', ' ')} Account</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setEditError(''); setEditSuccess(''); setPwError(''); setPwSuccess(''); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              tab === t
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab: View Profile ───────────────────────────────────────────────── */}
      {tab === 'Profile' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          <InfoRow icon={<FaUser className="text-blue-500" />}     label="Full Name"    value={profile?.name} />
          <InfoRow icon={<FaEnvelope className="text-blue-500" />} label="Email"        value={profile?.email} />
          <InfoRow icon={<FaBuilding className="text-blue-500" />} label="Department"   value={profile?.department || '—'} />
          <InfoRow icon={<FaIdCard className="text-blue-500" />}   label="Roll Number"  value={profile?.roll_number || '—'} />
          <InfoRow
            icon={<FaCalendarAlt className="text-blue-500" />}
            label="Member Since"
            value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          />

          <div className="px-5 py-4 flex gap-3">
            <button
              onClick={() => setTab('Edit Profile')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              <FaEdit /> Edit Profile
            </button>
            <button
              onClick={() => setTab('Change Password')}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              <FaLock /> Change Password
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Edit Profile ───────────────────────────────────────────────── */}
      {tab === 'Edit Profile' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs text-gray-400 mb-5">
            Note: Email cannot be changed as it is your login identifier.
          </p>

          {editError   && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{editError}</p>}
          {editSuccess && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg mb-4">{editSuccess}</p>}

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Field
              label="Full Name"
              required
              type="text"
              value={editForm.name}
              onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
              placeholder="Your full name"
            />
            <Field
              label="Email"
              type="email"
              value={profile?.email}
              disabled
              note="Email cannot be changed."
            />
            <Field
              label="Department"
              type="text"
              value={editForm.department}
              onChange={(v) => setEditForm((f) => ({ ...f, department: v }))}
              placeholder="e.g. Computer Science"
            />
            <Field
              label="Roll Number"
              type="text"
              value={editForm.roll_number}
              onChange={(v) => setEditForm((f) => ({ ...f, roll_number: v }))}
              placeholder="e.g. CS2024001"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={editSaving}
                className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-medium"
              >
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setTab('Profile')}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab: Change Password ─────────────────────────────────────────────── */}
      {tab === 'Change Password' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {pwError   && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{pwError}</p>}
          {pwSuccess && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg mb-4">{pwSuccess}</p>}

          <form onSubmit={handlePwSubmit} className="space-y-4">
            <Field
              label="Current Password"
              required
              type="password"
              value={pwForm.currentPassword}
              onChange={(v) => setPwForm((f) => ({ ...f, currentPassword: v }))}
              placeholder="Enter your current password"
            />
            <Field
              label="New Password"
              required
              type="password"
              value={pwForm.newPassword}
              onChange={(v) => setPwForm((f) => ({ ...f, newPassword: v }))}
              placeholder="At least 6 characters"
            />
            <Field
              label="Confirm New Password"
              required
              type="password"
              value={pwForm.confirmPassword}
              onChange={(v) => setPwForm((f) => ({ ...f, confirmPassword: v }))}
              placeholder="Re-enter new password"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={pwSaving}
                className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-medium"
              >
                {pwSaving ? 'Changing…' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={() => setTab('Profile')}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 px-5 py-4">
    <span className="shrink-0">{icon}</span>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-gray-800 text-sm font-medium mt-0.5">{value}</p>
    </div>
  </div>
);

const Field = ({ label, required, type, value, onChange, placeholder, disabled, note }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''
      }`}
    />
    {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
  </div>
);

export default Profile;
