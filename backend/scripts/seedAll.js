/**
 * seedAll.js — Development/test seed script.
 *
 * Creates: super_admin + admin + 2 students, 3 test events,
 * and dynamic form fields for the first event.
 *
 * IDEMPOTENT: Safe to run multiple times — no duplicates.
 * Always resets test-account passwords/roles to expected values.
 *
 * Usage (from backend/ folder):
 *   node scripts/seedAll.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db     = require('../config/db');

// ─── Test Accounts ────────────────────────────────────────────────────────────
const USERS = [
  {
    name:     'Super Admin',
    email:    'superadmin@test.com',
    password: 'SuperAdmin@123',
    role:     'super_admin',
    status:   'active',
  },
  {
    name:     'Campus Admin',
    email:    'admin@test.com',
    password: 'Admin@123',
    role:     'admin',
    status:   'active',
  },
  {
    name:        'Test Student',
    email:       'student@test.com',
    password:    'Student@123',
    role:        'student',
    status:      'active',
    department:  'CSE',
    roll_number: '21CS001',
  },
  {
    name:        'Second Student',
    email:       'student2@test.com',
    password:    'Student@1234',
    role:        'student',
    status:      'active',
    department:  'MCA',
    roll_number: '21MC002',
  },
];

// ─── Test Events ──────────────────────────────────────────────────────────────
const now = new Date();

const futureDate = (daysOffset, hour = 10) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

const EVENTS = [
  {
    title:                  'Hackathon 2026',
    description:            'A 24-hour coding competition where students build innovative solutions to real-world problems. Teams of 2-4 can participate. Prizes worth ₹50,000 up for grabs!',
    venue:                  'Main Auditorium',
    event_date:             futureDate(30, 9),
    last_registration_date: futureDate(20, 23),
    max_participants:       100,
    category:               'Technical',
  },
  {
    title:                  'Cultural Fest 2026',
    description:            'Annual cultural festival celebrating diversity through music, dance, art, and food. Open to all students. Come and showcase your talent!',
    venue:                  'Open Air Theatre',
    event_date:             futureDate(45, 10),
    last_registration_date: futureDate(38, 23),
    max_participants:       300,
    category:               'Cultural',
  },
  {
    title:                  'Sports Meet 2026',
    description:            'Inter-department sports competition featuring cricket, football, basketball, badminton, and athletics. Form your team and compete for the championship trophy!',
    venue:                  'Sports Complex',
    event_date:             futureDate(60, 8),
    last_registration_date: futureDate(50, 23),
    max_participants:       200,
    category:               'Sports',
  },
];

// ─── Form Fields for Hackathon 2026 ──────────────────────────────────────────
const HACKATHON_FORM_FIELDS = [
  { field_label: 'Full Name',                          field_type: 'text',     field_options: null,                  is_required: 1, field_order: 1 },
  { field_label: 'Email',                              field_type: 'email',    field_options: null,                  is_required: 1, field_order: 2 },
  { field_label: 'Department',                         field_type: 'select',   field_options: 'CSE,MCA,BCA,MBA,Other', is_required: 1, field_order: 3 },
  { field_label: 'Why do you want to participate?',    field_type: 'textarea', field_options: null,                  is_required: 0, field_order: 4 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ok   = (msg) => console.log(`  ✅ ${msg}`);
const skip = (msg) => console.log(`  ℹ️  ${msg}`);
const warn  = (msg) => console.log(`  ⚠️  ${msg}`);
const fail  = (msg) => console.error(`  ❌ ${msg}`);

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  try {
    console.log('\n═══════════════════════════════════════════');
    console.log('   CampusConnect — Development Seed Script  ');
    console.log('═══════════════════════════════════════════\n');

    // ── 1. Seed Users ──────────────────────────────────────────────────────
    console.log('1. Seeding test accounts…\n');
    const seededUserIds = {};

    for (const u of USERS) {
      const [existing] = await db.execute(
        'SELECT id, role FROM users WHERE email = ?',
        [u.email]
      );

      const hashedPassword = await bcrypt.hash(u.password, 10);

      if (existing.length > 0) {
        const existingUser = existing[0];
        seededUserIds[u.email] = existingUser.id;

        // Always ensure correct role, status, and password for test accounts
        await db.execute(
          'UPDATE users SET role = ?, status = ?, password = ? WHERE id = ?',
          [u.role, u.status, hashedPassword, existingUser.id]
        );

        if (existingUser.role !== u.role) {
          warn(`${u.email} — role corrected to "${u.role}", password reset`);
        } else {
          skip(`${u.email} — exists, password/status reset to expected values`);
        }
      } else {
        const [result] = await db.execute(
          `INSERT INTO users (name, email, password, role, status, department, roll_number)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            u.name,
            u.email,
            hashedPassword,
            u.role,
            u.status,
            u.department  || null,
            u.roll_number || null,
          ]
        );
        seededUserIds[u.email] = result.insertId;
        ok(`${u.email} — created (role: ${u.role}, status: ${u.status})`);
      }
    }

    const adminId = seededUserIds['admin@test.com'];

    // ── 2. Seed Events ─────────────────────────────────────────────────────
    console.log('\n2. Seeding test events…\n');
    const seededEventIds = {};

    for (const ev of EVENTS) {
      const [existing] = await db.execute(
        'SELECT id FROM events WHERE title = ?',
        [ev.title]
      );

      if (existing.length > 0) {
        seededEventIds[ev.title] = existing[0].id;
        skip(`"${ev.title}" — already exists`);
      } else {
        const [result] = await db.execute(
          `INSERT INTO events
             (title, description, venue, event_date, last_registration_date,
              max_participants, category, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ev.title, ev.description, ev.venue,
            ev.event_date, ev.last_registration_date,
            ev.max_participants, ev.category, adminId,
          ]
        );
        seededEventIds[ev.title] = result.insertId;
        ok(`"${ev.title}" — created (ID: ${result.insertId}, category: ${ev.category})`);
      }
    }

    // ── 3. Seed Form Fields for Hackathon 2026 ─────────────────────────────
    console.log('\n3. Seeding form fields for "Hackathon 2026"…\n');
    const hackathonId = seededEventIds['Hackathon 2026'];

    if (hackathonId) {
      const [existingFields] = await db.execute(
        'SELECT id FROM event_form_fields WHERE event_id = ?',
        [hackathonId]
      );

      if (existingFields.length > 0) {
        skip(`Form fields for "Hackathon 2026" — already exist (${existingFields.length} fields)`);
      } else {
        for (const field of HACKATHON_FORM_FIELDS) {
          await db.execute(
            `INSERT INTO event_form_fields
               (event_id, field_label, field_type, field_options, is_required, field_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [hackathonId, field.field_label, field.field_type, field.field_options, field.is_required, field.field_order]
          );
          ok(`Field "${field.field_label}" (${field.field_type}${field.is_required ? ', required' : ', optional'})`);
        }
      }
    }

    // ── Summary ────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════');
    console.log('   Seed Complete — Development Credentials  ');
    console.log('═══════════════════════════════════════════\n');
    console.log('🔐 TEST ACCOUNTS (Development Only)\n');
    console.log('  Super Admin:');
    console.log('    Email:    superadmin@test.com');
    console.log('    Password: SuperAdmin@123\n');
    console.log('  Admin:');
    console.log('    Email:    admin@test.com');
    console.log('    Password: Admin@123\n');
    console.log('  Student 1:');
    console.log('    Email:    student@test.com');
    console.log('    Password: Student@123\n');
    console.log('  Student 2:');
    console.log('    Email:    student2@test.com');
    console.log('    Password: Student@1234\n');
    console.log('⚠️  DEVELOPMENT/TEST credentials only. Never use in production.\n');

    process.exit(0);
  } catch (err) {
    fail(`Seed failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
})();
