import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaBuilding, FaIdCard, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/authService';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { AlertBanner } from '../../components/ui/UIComponents';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name:        '',
    email:       '',
    password:    '',
    confirm:     '',
    department:  '',
    roll_number: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.password) {
      return setError('Name, email, and password are required.');
    }
    if (formData.password.length < 6) return setError('Password must be at least 6 characters.');
    if (formData.password !== formData.confirm) return setError('Passwords do not match.');
    try {
      setLoading(true);
      const data = await registerUser({
        name:        formData.name,
        email:       formData.email,
        password:    formData.password,
        department:  formData.department,
        roll_number: formData.roll_number,
      });
      login(data.user, data.token);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground variant="default" className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Card */}
        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{
            background: 'rgba(17,24,39,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex p-3 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 24px rgba(99,102,241,0.4)',
              }}
            >
              <FaGraduationCap className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Join CampusConnect</h1>
            <p className="text-sm" style={{ color: 'var(--cc-text-muted)' }}>
              Create your student account and start exploring
            </p>
          </div>

          <AlertBanner type="error" message={error} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <InputField
              label="Full Name"
              required
              icon={<FaUser />}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />

            {/* Email */}
            <InputField
              label="Email Address"
              required
              icon={<FaEnvelope />}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />

            {/* Department + Roll Number */}
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Department"
                icon={<FaBuilding />}
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="CS / ECE…"
              />
              <InputField
                label="Roll Number"
                icon={<FaIdCard />}
                type="text"
                name="roll_number"
                value={formData.roll_number}
                onChange={handleChange}
                placeholder="21CS001"
              />
            </div>

            {/* Password */}
            <InputField
              label="Password"
              required
              icon={<FaLock />}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <InputField
              label="Confirm Password"
              required
              icon={<FaLock />}
              type="password"
              name="confirm"
              value={formData.confirm}
              onChange={handleChange}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white inline-block"
                    style={{ animation: 'spin 0.7s linear infinite' }}
                  />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <FaArrowRight className="text-xs" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--cc-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </AnimatedBackground>
  );
};

const InputField = ({ label, required, icon, type, name, value, onChange, placeholder, autoComplete, disabled }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cc-text-muted)' }}>
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
        style={{ color: 'var(--cc-text-faint)' }}
      >
        {icon}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="input-dark pl-9"
        style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
      />
    </div>
  </div>
);

export default Register;
