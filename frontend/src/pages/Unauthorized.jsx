import { Link } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

/**
 * Unauthorized (403) page.
 * Shown when an authenticated user tries to access a route
 * that requires a different role.
 */
const Unauthorized = () => {
  const { isAdmin, isStudent, isSuperAdmin } = useAuth();

  const homeLink = isSuperAdmin ? '/super-admin/dashboard' : isAdmin ? '/admin' : isStudent ? '/events' : '/';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 text-red-600 p-5 rounded-full">
            <FaLock className="text-4xl" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Access Denied</h2>
        <p className="text-gray-500 text-sm mb-8">
          You don&apos;t have permission to access this page.
          Please make sure you are logged in with the correct account type.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            to={homeLink}
            className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition"
          >
            <FaArrowLeft />
            Go to Home
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
