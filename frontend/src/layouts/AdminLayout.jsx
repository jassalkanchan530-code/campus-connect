import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/admin/Sidebar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login"        replace />;
  if (!isAdmin)         return <Navigate to="/unauthorized" replace />;

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--cc-navy)' }}
    >
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="min-h-screen"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminLayout;
