/**
 * migrate.js — Safe database migration for super_admin + status + audit_logs.
 * Run ONCE from backend/ directory:  node scripts/migrate.js
 *
 * Idempotent — checks current schema before altering.
 */

require('dotenv').config();
const db = require('../config/db');

const log  = (msg) => console.log(`  ${msg}`);
const ok   = (msg) => console.log(`  ✅ ${msg}`);
const skip = (msg) => console.log(`  ℹ️  ${msg}`);

(async () => {
  try {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   CampusConnect — Database Migration                  ');
    console.log('═══════════════════════════════════════════════════════\n');

    // ── 1. Expand role ENUM ─────────────────────────────────────────────────
    log('Step 1: Checking role ENUM on users table…');
    const [colInfo] = await db.execute(`
      SELECT COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'role'
    `);

    const currentType = colInfo[0]?.COLUMN_TYPE || '';
    if (currentType.includes('super_admin')) {
      skip('role ENUM already includes super_admin — skipping');
    } else {
      await db.execute(`
        ALTER TABLE users
          MODIFY COLUMN role ENUM('student','admin','super_admin') NOT NULL DEFAULT 'student'
      `);
      ok("role ENUM expanded to ('student','admin','super_admin')");
    }

    // ── 2. Add status column ────────────────────────────────────────────────
    log('\nStep 2: Checking status column on users table…');
    const [statusCol] = await db.execute(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'status'
    `);

    if (statusCol.length > 0) {
      skip('status column already exists — skipping');
    } else {
      await db.execute(`
        ALTER TABLE users
          ADD COLUMN status ENUM('active','inactive') NOT NULL DEFAULT 'active'
          AFTER role
      `);
      // All existing users become active (DEFAULT covers this for existing NULL values)
      await db.execute(`UPDATE users SET status = 'active' WHERE status IS NULL`);
      ok("status column added — all existing users set to 'active'");
    }

    // ── 3. Create audit_logs table ──────────────────────────────────────────
    log('\nStep 3: Creating audit_logs table…');
    const [auditTable] = await db.execute(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'audit_logs'
    `);

    if (auditTable.length > 0) {
      skip('audit_logs table already exists — skipping');
    } else {
      await db.execute(`
        CREATE TABLE audit_logs (
          id          INT          NOT NULL AUTO_INCREMENT,
          actor_id    INT          NOT NULL,
          actor_role  VARCHAR(30)  NOT NULL,
          action      VARCHAR(100) NOT NULL,
          entity_type VARCHAR(50)  DEFAULT NULL,
          entity_id   INT          DEFAULT NULL,
          created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_audit_actor_id (actor_id),
          KEY idx_audit_action (action),
          KEY idx_audit_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      ok('audit_logs table created');
    }

    // ── Verify final schema ─────────────────────────────────────────────────
    console.log('\n── Verification ──────────────────────────────────────');
    const [finalCols] = await db.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME IN ('role','status')
      ORDER BY ORDINAL_POSITION
    `);
    finalCols.forEach(c => log(`  users.${c.COLUMN_NAME}: ${c.COLUMN_TYPE} DEFAULT ${c.COLUMN_DEFAULT}`));

    const [tables] = await db.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);
    log('\n  Tables in campusconnect:');
    tables.forEach(t => log(`    - ${t.TABLE_NAME}`));

    console.log('\n✅ Migration complete.\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  }
})();
