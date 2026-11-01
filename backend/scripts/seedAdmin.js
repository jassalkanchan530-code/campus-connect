/**
 * seedAdmin.js — Run once to create the admin account.
 *
 * Usage (from backend/ folder):
 *   node scripts/seedAdmin.js
 *
 * You can customise the credentials below before running.
 * Change the password immediately after first login.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const ADMIN = {
  name:     'Campus Admin',
  email:    'admin@campusconnect.com',
  password: 'Admin@123',   // ← change this before running in production
  role:     'admin',
};

(async () => {
  try {
    // Check if an admin already exists
    const [existing] = await db.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [ADMIN.email]
    );

    if (existing.length > 0) {
      console.log(`ℹ️  Admin already exists → email: ${existing[0].email}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN.password, 10);

    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [ADMIN.name, ADMIN.email, hashedPassword, ADMIN.role]
    );

    console.log('✅ Admin user created successfully!');
    console.log('   ID:       ', result.insertId);
    console.log('   Name:     ', ADMIN.name);
    console.log('   Email:    ', ADMIN.email);
    console.log('   Password: ', ADMIN.password);
    console.log('\n⚠️  Remember to change the password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
    process.exit(1);
  }
})();
