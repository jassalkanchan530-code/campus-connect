const bcrypt   = require('bcryptjs');
const db       = require('../config/db');
const auditLog = require('../utils/auditLog');

// ─────────────────────────────────────────────────────────────────────────────
// SUPER ADMIN: GET /api/super-admin/admins
// Lists all admin accounts (not super_admins, not students).
// ─────────────────────────────────────────────────────────────────────────────
const listAdmins = async (req, res) => {
  try {
    const [admins] = await db.execute(`
      SELECT id, name, email, role, status, created_at
      FROM users
      WHERE role = 'admin'
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count:   admins.length,
      data:    admins,
    });
  } catch (err) {
    console.error('listAdmins error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching admins.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPER ADMIN: POST /api/super-admin/admins
// Creates a new admin account.
// Role is ALWAYS forced to 'admin' — caller cannot choose super_admin.
// ─────────────────────────────────────────────────────────────────────────────
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // ── Check duplicate email ─────────────────────────────────────────────────
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // ── Create admin — role is ALWAYS 'admin', status ALWAYS 'active' ─────────
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role, status)
       VALUES (?, ?, ?, 'admin', 'active')`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    const newAdminId = result.insertId;

    // ── Audit log ─────────────────────────────────────────────────────────────
    await auditLog({
      actorId:    req.user.id,
      actorRole:  req.user.role,
      action:     'ADMIN_CREATED',
      entityType: 'user',
      entityId:   newAdminId,
    });

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully.',
      data: {
        id:    newAdminId,
        name:  name.trim(),
        email: email.toLowerCase().trim(),
        role:  'admin',
        status: 'active',
      },
    });
  } catch (err) {
    console.error('createAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating admin.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPER ADMIN: PATCH /api/super-admin/admins/:id/deactivate
// ─────────────────────────────────────────────────────────────────────────────
const deactivateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // ── Fetch target user ─────────────────────────────────────────────────────
    const [rows] = await db.execute(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const target = rows[0];

    // ── Guards ────────────────────────────────────────────────────────────────
    if (target.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Cannot deactivate a super admin.' });
    }

    if (target.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Target user is not an admin.' });
    }

    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    if (target.status === 'inactive') {
      return res.status(400).json({ success: false, message: 'Admin is already inactive.' });
    }

    // ── Deactivate ────────────────────────────────────────────────────────────
    await db.execute('UPDATE users SET status = ? WHERE id = ?', ['inactive', id]);

    await auditLog({
      actorId:    req.user.id,
      actorRole:  req.user.role,
      action:     'ADMIN_DEACTIVATED',
      entityType: 'user',
      entityId:   Number(id),
    });

    return res.status(200).json({
      success: true,
      message: `Admin "${target.name}" has been deactivated.`,
    });
  } catch (err) {
    console.error('deactivateAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Server error deactivating admin.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPER ADMIN: PATCH /api/super-admin/admins/:id/activate
// ─────────────────────────────────────────────────────────────────────────────
const activateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const target = rows[0];

    if (target.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Target user is not an admin.' });
    }

    if (target.status === 'active') {
      return res.status(400).json({ success: false, message: 'Admin is already active.' });
    }

    await db.execute('UPDATE users SET status = ? WHERE id = ?', ['active', id]);

    await auditLog({
      actorId:    req.user.id,
      actorRole:  req.user.role,
      action:     'ADMIN_ACTIVATED',
      entityType: 'user',
      entityId:   Number(id),
    });

    return res.status(200).json({
      success: true,
      message: `Admin "${target.name}" has been activated.`,
    });
  } catch (err) {
    console.error('activateAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Server error activating admin.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPER ADMIN: GET /api/super-admin/audit-logs
// Returns recent audit log entries.
// ─────────────────────────────────────────────────────────────────────────────
const getAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);

    const [logs] = await db.execute(`
      SELECT al.id, al.action, al.entity_type, al.entity_id, al.created_at,
             al.actor_role,
             u.name  AS actor_name,
             u.email AS actor_email
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ${limit}
    `);

    return res.status(200).json({
      success: true,
      count:   logs.length,
      data:    logs,
    });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching audit logs.' });
  }
};

module.exports = {
  listAdmins,
  createAdmin,
  deactivateAdmin,
  activateAdmin,
  getAuditLogs,
};
