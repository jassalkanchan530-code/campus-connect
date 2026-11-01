const db       = require('../config/db');
const auditLog = require('../utils/auditLog');

// ─── GET /api/notifications ────────────────────────────────────────────────────
// Public (authenticated) — all roles can view; returns newest-first
const getNotifications = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        n.id, n.title, n.message, n.created_at,
        u.name AS created_by_name
      FROM notifications n
      LEFT JOIN users u ON n.created_by = u.id
      ORDER BY n.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count:   rows.length,
      data:    rows,
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching notifications.' });
  }
};

// ─── GET /api/notifications/manage ────────────────────────────────────────────
// Admin / Super Admin — same result set, kept separate for clarity / future expansion
const getNotificationsAdmin = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        n.id, n.title, n.message, n.created_at,
        u.name AS created_by_name
      FROM notifications n
      LEFT JOIN users u ON n.created_by = u.id
      ORDER BY n.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count:   rows.length,
      data:    rows,
    });
  } catch (err) {
    console.error('getNotificationsAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching notifications.' });
  }
};

// ─── GET /api/notifications/:id ───────────────────────────────────────────────
// Authenticated — any role
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(`
      SELECT
        n.id, n.title, n.message, n.created_at,
        u.name AS created_by_name
      FROM notifications n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getNotificationById error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching notification.' });
  }
};

// ─── POST /api/notifications ──────────────────────────────────────────────────
// Admin / Super Admin only
const createNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const [result] = await db.execute(
      `INSERT INTO notifications (title, message, created_by) VALUES (?, ?, ?)`,
      [title.trim(), message.trim(), req.user.id]
    );

    await auditLog({
      actorId:    req.user.id,
      actorRole:  req.user.role,
      action:     'NOTIFICATION_CREATED',
      entityType: 'notification',
      entityId:   result.insertId,
    });

    return res.status(201).json({
      success: true,
      message: 'Notification created successfully.',
      data:    { id: result.insertId },
    });
  } catch (err) {
    console.error('createNotification error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating notification.' });
  }
};

// ─── PUT /api/notifications/:id ───────────────────────────────────────────────
// Admin / Super Admin only
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const [existing] = await db.execute('SELECT id FROM notifications WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    await db.execute(
      `UPDATE notifications SET title = ?, message = ? WHERE id = ?`,
      [title.trim(), message.trim(), id]
    );

    await auditLog({
      actorId:    req.user.id,
      actorRole:  req.user.role,
      action:     'NOTIFICATION_UPDATED',
      entityType: 'notification',
      entityId:   Number(id),
    });

    return res.status(200).json({ success: true, message: 'Notification updated successfully.' });
  } catch (err) {
    console.error('updateNotification error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating notification.' });
  }
};

// ─── DELETE /api/notifications/:id ────────────────────────────────────────────
// Admin / Super Admin only
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT id FROM notifications WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    await db.execute('DELETE FROM notifications WHERE id = ?', [id]);

    await auditLog({
      actorId:    req.user.id,
      actorRole:  req.user.role,
      action:     'NOTIFICATION_DELETED',
      entityType: 'notification',
      entityId:   Number(id),
    });

    return res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
  } catch (err) {
    console.error('deleteNotification error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting notification.' });
  }
};

module.exports = {
  getNotifications,
  getNotificationsAdmin,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
};
