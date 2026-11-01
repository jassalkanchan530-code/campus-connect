import { FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

/**
 * Super Admin Dashboard — overview and quick links.
 */
const SuperAdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <FaShieldAlt className="text-indigo-600 text-xl" />
        <h1 className="text-xl font-bold text-gray-800">Super Admin Dashboard</h1>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        Welcome, <span className="font-medium text-gray-700">{user?.name}</span>. You have full system access.
      </p>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <QuickCard
          title="Admin Management"
          description="Create, activate, or deactivate admin accounts."
          linkTo="/super-admin/admins"
          linkLabel="Manage Admins →"
          color="indigo"
        />
        <QuickCard
          title="Events"
          description="View all campus events managed by admins."
          linkTo="/super-admin/events"
          linkLabel="View Events →"
          color="blue"
        />
        <QuickCard
          title="Audit Logs"
          description="Review all administrative actions in the system."
          linkTo="/super-admin/audit-logs"
          linkLabel="View Logs →"
          color="gray"
        />
      </div>

      {/* Security notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 max-w-2xl">
        <h3 className="font-semibold text-yellow-800 mb-1 text-sm">🔒 Security Reminder</h3>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Only super admins can create or deactivate admin accounts.</li>
          <li>• Students self-register and are always assigned the student role.</li>
          <li>• All administrative actions are recorded in audit logs.</li>
          <li>• You cannot deactivate your own super admin account.</li>
        </ul>
      </div>
    </div>
  );
};

const QuickCard = ({ title, description, linkTo, linkLabel, color }) => {
  const colors = {
    indigo: 'border-indigo-200 bg-indigo-50',
    blue:   'border-blue-200   bg-blue-50',
    gray:   'border-gray-200   bg-gray-50',
  };
  const linkColors = {
    indigo: 'text-indigo-700 hover:text-indigo-900',
    blue:   'text-blue-700   hover:text-blue-900',
    gray:   'text-gray-700   hover:text-gray-900',
  };

  return (
    <div className={`rounded-xl border p-5 ${colors[color] || colors.gray}`}>
      <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm mb-3">{description}</p>
      <Link to={linkTo} className={`text-sm font-medium ${linkColors[color] || linkColors.gray}`}>
        {linkLabel}
      </Link>
    </div>
  );
};

export default SuperAdminDashboard;
