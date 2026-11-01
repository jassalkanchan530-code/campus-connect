const db = require('../config/db');

/**
 * Writes one row to audit_logs.
 * Never throws — logs error to console instead of crashing the request.
 *
 * @param {object} opts
 * @param {number} opts.actorId
 * @param {string} opts.actorRole
 * @param {string} opts.action      – e.g. 'ADMIN_CREATED'
 * @param {string} [opts.entityType] – e.g. 'user', 'event'
 * @param {number} [opts.entityId]
 */
const auditLog = async ({ actorId, actorRole, action, entityType = null, entityId = null }) => {
  try {
    await db.execute(
      `INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id)
       VALUES (?, ?, ?, ?, ?)`,
      [actorId, actorRole, action, entityType, entityId]
    );
  } catch (err) {
    console.error('[AuditLog] Failed to write audit log:', err.message);
  }
};

module.exports = auditLog;
