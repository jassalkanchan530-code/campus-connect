import { FaTachometerAlt } from 'react-icons/fa';

/**
 * Admin Dashboard — placeholder.
 * Will be filled with stats (events, registrations, students, notifications)
 * in a later phase.
 */
const Dashboard = () => (
  <div className="p-6">
    <div className="flex items-center gap-2 mb-1">
      <FaTachometerAlt className="text-blue-600 text-xl" />
      <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
    </div>
    <p className="text-gray-500 text-sm mb-8">
      Welcome back, Admin. Overview stats will appear here in a later phase.
    </p>

    {/* Placeholder stat cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {['Total Events', 'Total Registrations', 'Total Students', 'Notifications'].map((label) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-300">—</p>
        </div>
      ))}
    </div>
  </div>
);

export default Dashboard;
