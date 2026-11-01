import { useState, useEffect } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { getAuditLogs } from '../../services/superAdminService';

const ACTION_COLORS = {
  ADMIN_CREATED:      'bg-blue-100  text-blue-700',
  ADMIN_DEACTIVATED:  'bg-red-100   text-red-600',
  ADMIN_ACTIVATED:    'bg-green-100 text-green-700',
  EVENT_CREATED:      'bg-purple-100 text-purple-700',
  EVENT_UPDATED:      'bg-yellow-100 text-yellow-700',
  EVENT_DELETED:      'bg-red-50    text-red-500',
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';

const AuditLogs = () => {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAuditLogs(200);
        setLogs(res.data.data);
      } catch {
        setError('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <FaClipboardList className="text-indigo-600 text-xl" />
        <h1 className="text-xl font-bold text-gray-800">Audit Logs</h1>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Administrative actions recorded in the system (most recent first).
      </p>

      {loading && <Loader message="Loading audit logs…" />}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!loading && logs.length === 0 && (
        <div className="text-center py-20 text-gray-300">
          <FaClipboardList className="text-6xl mx-auto mb-4" />
          <p className="text-gray-400">No audit logs recorded yet.</p>
        </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Action', 'Performed By', 'Role', 'Entity', 'Timestamp'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{log.actor_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{log.actor_role}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {log.entity_type ? `${log.entity_type} #${log.entity_id}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmt(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
