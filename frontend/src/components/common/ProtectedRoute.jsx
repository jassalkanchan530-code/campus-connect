import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps routes that require authentication.
 * Optionally restricts to a specific role or array of roles.
 *
 * - Unauthenticated users → /login
 * - Wrong role            → /unauthorized (403 page)
 *
 * Usage:
 *   <ProtectedRoute role="student">…</ProtectedRoute>
 *   <ProtectedRoute role={['admin','super_admin']}>…</ProtectedRoute>
 */
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user?.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
