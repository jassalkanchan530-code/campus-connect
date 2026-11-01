import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cc-navy)' }}>
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(99,102,241,0.1)', background: 'rgba(10,14,26,0.8)' }}>
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">Campus<span style={{ color: '#818cf8' }}>Connect</span></span>
            <span className="text-xs" style={{ color: 'var(--cc-text-faint)' }}>
              © {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--cc-text-faint)' }}>
            The future of campus life.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
