import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaGraduationCap, FaTachometerAlt, FaUserShield,
  FaCalendarAlt, FaClipboardList, FaBell, FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/super-admin/dashboard',     label: 'Dashboard',        icon: <FaTachometerAlt />, end: true  },
  { to: '/super-admin/admins',        label: 'Admin Management', icon: <FaUserShield />,    end: false },
  { to: '/super-admin/events',        label: 'Events',           icon: <FaCalendarAlt />,   end: false },
  { to: '/super-admin/notifications', label: 'Notifications',    icon: <FaBell />,          end: false },
  { to: '/super-admin/audit-logs',    label: 'Audit Logs',       icon: <FaClipboardList />, end: false },
];

const SuperAdminSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SA';

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-64 min-h-screen flex flex-col shrink-0 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #080b16 0%, #0c1128 100%)',
        borderRight: '1px solid rgba(139,92,246,0.15)',
      }}
    >
      {/* Orbs */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-12 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="absolute bottom-20 -left-12 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(35px)', opacity: 0.1 }}
      />

      {/* Brand */}
      <div className="relative px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow: '0 0 14px rgba(139,92,246,0.5)',
            }}
          >
            <FaGraduationCap className="text-white text-base" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">
            Campus<span style={{ color: '#a78bfa' }}>Connect</span>
          </span>
        </div>
        <span
          className="inline-block mt-1.5 ml-0.5 text-xs font-bold tracking-widest uppercase"
          style={{ color: '#8b5cf6' }}
        >
          ⚡ Super Admin
        </span>
      </div>

      {/* User chip */}
      <div className="relative px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 relative"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow: '0 0 10px rgba(139,92,246,0.4)',
            }}
          >
            {initials}
            {/* Online indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: '#4ade80', borderColor: '#080b16' }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs truncate" style={{ color: '#a78bfa' }}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-3 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--cc-text-faint)' }}>
          Control Panel
        </p>
        {NAV_LINKS.map(({ to, label, icon, end }, i) => (
          <motion.div key={to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
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

export default SuperAdminSidebar;
