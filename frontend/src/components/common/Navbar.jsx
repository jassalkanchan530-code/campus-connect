import { useState, useEffect } from 'react';
import { Link, NavLink as RouterNavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGraduationCap, FaCalendarAlt, FaBell,
  FaClipboardList, FaUser, FaTachometerAlt, FaBars, FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isStudent, isAdmin, isSuperAdmin, logout, user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homeHref = isSuperAdmin
    ? '/super-admin/dashboard'
    : isAdmin
    ? '/admin'
    : isStudent
    ? '/dashboard'
    : '/';

  const studentLinks = [
    { to: '/dashboard',        icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/events',           icon: <FaCalendarAlt />,   label: 'Events' },
    { to: '/notifications',    icon: <FaBell />,          label: 'Notifications' },
    { to: '/my-registrations', icon: <FaClipboardList />, label: 'My Registrations' },
    { to: '/profile',          icon: <FaUser />,          label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin',               label: 'Dashboard' },
    { to: '/admin/events',        label: 'Events' },
    { to: '/admin/notifications', label: 'Notifications' },
  ];

  const activeLinks = isStudent ? studentLinks : isAdmin ? adminLinks : [];

  return (
    <>
      <motion.nav
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(10, 14, 26, 0.9)'
            : 'rgba(10, 14, 26, 0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled
            ? '1px solid rgba(99,102,241,0.2)'
            : '1px solid rgba(99,102,241,0.08)',
          boxShadow: scrolled
            ? '0 4px 24px rgba(0,0,0,0.4)'
            : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <Link to={homeHref} className="flex items-center gap-2.5 shrink-0 group">
              <div
                className="p-1.5 rounded-lg transition-all duration-200 group-hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                }}
              >
                <FaGraduationCap className="text-white text-lg" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                Campus<span style={{ color: '#818cf8' }}>Connect</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            {isAuthenticated && activeLinks.length > 0 && (
              <div className="hidden md:flex items-center gap-1">
                {activeLinks.map(({ to, icon, label }) => (
                  <NavItem key={to} to={to} icon={icon} label={label} />
                ))}
              </div>
            )}

            {/* Public desktop nav */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                <NavItem to="/events" icon={<FaCalendarAlt />} label="Events" />
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-3">
                  {/* Avatar / greeting */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm" style={{ color: 'var(--cc-text-muted)' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm py-1.5 px-3"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden btn-ghost p-2"
                aria-label="Toggle menu"
              >
                {menuOpen ? <FaTimes className="text-white" /> : <FaBars className="text-white" />}
              </button>
            </div>

          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden"
            style={{
              background: 'rgba(10,14,26,0.97)',
              backdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(99,102,241,0.15)',
              padding: '1rem',
            }}
          >
            {isAuthenticated && activeLinks.map(({ to, icon, label }) => (
              <RouterNavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <span>{icon}</span>
                {label}
              </RouterNavLink>
            ))}

            {!isAuthenticated && (
              <RouterNavLink
                to="/events"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${
                    isActive ? 'bg-indigo-500/20 text-white' : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                <FaCalendarAlt /> Events
              </RouterNavLink>
            )}

            <div className="border-t border-white/5 pt-3 mt-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300">{user?.name?.split(' ')[0]}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-secondary text-xs py-1.5 px-3">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn-secondary flex-1 text-center text-sm py-2">Login</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center text-sm py-2">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content overlap */}
      <div className="h-16" />
    </>
  );
};

const NavItem = ({ to, icon, label }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'text-white bg-indigo-500/15 nav-active-indicator'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`
    }
  >
    {icon && <span className="text-sm">{icon}</span>}
    {label}
  </RouterNavLink>
);

export default Navbar;
