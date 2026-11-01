import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaGraduationCap, FaTachometerAlt,
  FaCalendarAlt, FaBell, FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/admin',               label: 'Dashboard',     icon: <FaTachometerAlt />, end: true  },
  { to: '/admin/events',        label: 'Events',        icon: <FaCalendarAlt />,   end: false },
  { to: '/admin/notifications', label: 'Notifications', icon: <FaBell />,          end: false },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-64 min-h-screen flex flex-col shrink-0 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0e1a 0%, #0f1629 100%)',
        borderRight: '1px solid rgba(99,102,241,0.12)',
      }}
    >
      {/* Subtle orb */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="absolute bottom-10 -left-12 w-36 h-36 rounded-full opacity-8 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', filter: 'blur(30px)' }}
      />

      {/* Brand */}
      <div className="relative px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
          >
            <FaGraduationCap className="text-white text-base" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">
            Campus<span style={{ color: '#818cf8' }}>Connect</span>
          </span>
        </div>
        <span
          className="inline-block mt-1.5 ml-0.5 text-xs font-semibold tracking-widest uppercase"
          style={{ color: '#6366f1' }}
        >
          Admin Panel
        </span>
      </div>

      {/* User chip */}
      <div className="relative px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs" style={{ color: '#6366f1' }}>Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-3 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--cc-text-faint)' }}>
          Navigation
        </p>
        {NAV_LINKS.map(({ to, label, icon, end }, i) => (
          <motion.div key={to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Logout */}
      <div className="relative p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full hover:text-red-400"
          style={{ color: 'var(--cc-text-muted)' }}
        >
          <FaSignOutAlt className="text-base" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
