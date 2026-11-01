import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { AlertBanner } from '../../components/ui/UIComponents';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      return setError('Please enter your email and password.');
    }
    try {
      setLoading(true);
      const data = await loginUser(formData.email, formData.password);
      login(data.user, data.token);
      if (data.user.role === 'super_admin') navigate('/super-admin/dashboard');
      else if (data.user.role === 'admin')   navigate('/admin');
      else                                   navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground variant="hero" className="min-h-screen flex">

      {/* ── Left Panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 relative">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 mb-12">
            <div
              className="p-2 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
            >
              <FaGraduationCap className="text-white text-2xl" />
            </div>
            <span className="font-bold text-white text-2xl tracking-tight">
              Campus<span style={{ color: '#818cf8' }}>Connect</span>
            </span>
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Welcome back to<br />
            <span className="gradient-text">your campus.</span>
          </h1>
          <p className="text-lg mb-10" style={{ color: 'var(--cc-text-muted)' }}>
            Sign in to discover events, manage registrations,<br />
            and stay connected with campus life.
          </p>

          {/* Feature bullets */}
          <div className="space-y-3">
            {[
              { icon: '📅', text: 'Browse and register for campus events' },
              { icon: '🔔', text: 'Real-time notifications from admins' },
              { icon: '📋', text: 'Track all your registrations' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm" style={{ color: 'var(--cc-text-muted)' }}>
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  {icon}
                </span>
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel (Login Card) ──────────────────────────────────── */}
      <div className="flex items-center justify-center flex-1 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: 'rgba(17,24,39,0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            {/* Mobile brand */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div
                className="p-1.5 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <FaGraduationCap className="text-white text-lg" />
              </div>
              <span className="font-bold text-white text-lg">
                Campus<span style={{ color: '#818cf8' }}>Connect</span>
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--cc-text-muted)' }}>
              Enter your credentials to access your account
            </p>

            <AlertBanner type="error" message={error} />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cc-text-muted)' }}>
                  Email address
                </label>
                <div className="relative">
                  <FaEnvelope
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: 'var(--cc-text-faint)' }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="input-dark pl-9"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cc-text-muted)' }}>
                  Password
                </label>
                <div className="relative">
                  <FaLock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: 'var(--cc-text-faint)' }}
                  />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="input-dark pl-9"
                  />
                </div>
              </div>

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
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <FaArrowRight className="text-xs" />
                  </span>
                )}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: 'var(--cc-text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Create one →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default Login;
