import { useEffect, useState } from 'react';
import { FaBell, FaCalendarAlt } from 'react-icons/fa';
import { getNotifications } from '../../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaBell className="text-blue-600 text-2xl" />
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          <FaBell className="text-4xl mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No notifications yet.</p>
          <p className="text-sm mt-1">Check back later for announcements.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-1">{n.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {n.message}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FaCalendarAlt />
                  {new Date(n.created_at).toLocaleString()}
                </span>
                {n.created_by_name && (
                  <span>Posted by: {n.created_by_name}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
