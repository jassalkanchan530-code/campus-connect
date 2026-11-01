const bcrypt = require('bcryptjs');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Public — ALWAYS creates role = 'student'. Role from request body is IGNORED.
const register = async (req, res) => {
  try {
    const { name, email, password, department, roll_number } = req.body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!name || !email || !password) {
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

    // ── Check if email already exists ─────────────────────────────────────────
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

    // ── Hash password ─────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Insert user — role is ALWAYS 'student' regardless of request body ─────
    // This prevents privilege escalation: even if someone sends role=admin or
    // role=super_admin in the request body, it is completely ignored here.
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role, status, department, roll_number)
       VALUES (?, ?, ?, 'student', 'active', ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        department?.trim() || null,
        roll_number?.trim() || null,
      ]
    );

    const newUser = {
      id:    result.insertId,
      name:  name.trim(),
      email: email.toLowerCase().trim(),
      role:  'student',
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: newUser,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Shared login for student, admin, and super_admin.
// Checks: email ✓  password ✓  status (inactive admins/super_admins blocked) ✓
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // ── Find user by email ────────────────────────────────────────────────────
    const [users] = await db.execute(
      'SELECT id, name, email, password, role, status FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = users[0];

    // ── Compare password ──────────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Check account status (inactive admins/super_admins cannot login) ──────
    // Students can always log in (status check only for admin roles)
    if (user.role !== 'student' && user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the super admin.',
      });
    }

    // ── Generate token (does NOT include password or status) ──────────────────
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

module.exports = { register, login };
