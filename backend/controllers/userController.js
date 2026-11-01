const bcrypt   = require('bcryptjs');
const db       = require('../config/db');

// ─── GET /api/users/me ────────────────────────────────────────────────────────
// Returns the authenticated user's profile (no password returned).
const getMe = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, email, role, status, department, roll_number, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

// ─── PUT /api/users/me ────────────────────────────────────────────────────────
// Allows a student to update their own name, department, and roll_number.
// Email is NOT editable (it is the unique identifier used for auth).
// Role and status are NEVER accepted from the request body (prevents privilege escalation).
const updateMe = async (req, res) => {
  try {
    const { name, department, roll_number } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    await db.execute(
      `UPDATE users SET name = ?, department = ?, roll_number = ? WHERE id = ?`,
      [
        name.trim(),
        department?.trim() || null,
        roll_number?.trim() || null,
        req.user.id,
      ]
    );

    // Return updated profile
    const [rows] = await db.execute(
      `SELECT id, name, email, role, status, department, roll_number, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data:    rows[0],
    });
  } catch (err) {
    console.error('updateMe error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

// ─── PUT /api/users/me/password ───────────────────────────────────────────────
// Allows a student to change their own password.
// Requires the current password for verification.
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required.' });
    }
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must differ from current password.' });
    }

    // Fetch current hashed password
    const [rows] = await db.execute(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Hash and store new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error changing password.' });
  }
};

module.exports = { getMe, updateMe, changePassword };
