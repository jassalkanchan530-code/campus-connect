import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar';
import { useAuth } from '../context/AuthContext';

const SuperAdminLayout = () => {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login"        replace />;
  if (!isSuperAdmin)    return <Navigate to="/unauthorized" replace />;

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(180deg, #080b16 0%, #0a0e1a 100%)' }}
    >
      <SuperAdminSidebar />
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

export default SuperAdminLayout;
