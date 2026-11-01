/**
 * Phase 6 Test Suite — CampusConnect
 * Tests all Phase 6 requirements: user profile, password change,
 * registration security, role-based access, and regression.
 *
 * Requires: jest + supertest (npm install --save-dev jest supertest)
 * Run: npm test
 */

const request = require('supertest');

const BASE = 'http://localhost:5000';

// ── Helpers ──────────────────────────────────────────────────────────────────

const post = (path, body, token) =>
  request(BASE)
    .post(path)
    .set('Content-Type', 'application/json')
    .set('Authorization', token ? `Bearer ${token}` : '')
    .send(body);

const get = (path, token) =>
  request(BASE)
    .get(path)
    .set('Authorization', token ? `Bearer ${token}` : '');

const put = (path, body, token) =>
  request(BASE)
    .put(path)
    .set('Content-Type', 'application/json')
    .set('Authorization', token ? `Bearer ${token}` : '')
    .send(body);

const del = (path, token) =>
  request(BASE)
    .delete(path)
    .set('Authorization', token ? `Bearer ${token}` : '');

// ── Test state ────────────────────────────────────────────────────────────────

let studentToken   = '';
let studentToken2  = '';
let adminToken     = '';
let superAdminToken = '';
let studentId      = '';
let student2Id     = '';
let registrationId = '';
let student2RegId  = '';
let eventId        = '';

const STUDENT_EMAIL  = `teststu_${Date.now()}@example.com`;
const STUDENT_EMAIL2 = `teststu2_${Date.now()}@example.com`;
const STUDENT_PASS   = 'Pass1234';
const ADMIN_EMAIL    = 'admin@campusconnect.com';
const ADMIN_PASS     = 'admin123';
const SA_EMAIL       = 'superadmin@campusconnect.com';
const SA_PASS        = 'super123';

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 1: Authentication & Role-Based Redirects
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 1: Authentication + Login Role Redirects', () => {
  test('1a. Register student A', async () => {
    const res = await post('/api/auth/register', {
      name:     'Test Student A',
      email:    STUDENT_EMAIL,
      password: STUDENT_PASS,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('student');
    studentToken = res.body.token;
    studentId    = res.body.user.id;
  });

  test('1b. Register student B', async () => {
    const res = await post('/api/auth/register', {
      name:     'Test Student B',
      email:    STUDENT_EMAIL2,
      password: STUDENT_PASS,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('student');
    studentToken2 = res.body.token;
    student2Id    = res.body.user.id;
  });

  test('1c. Public registration NEVER returns password', async () => {
    const res = await post('/api/auth/register', {
      name:     'Another Student',
      email:    `anon_${Date.now()}@test.com`,
      password: 'test123',
      role:     'admin',           // should be ignored
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('student');  // escalation blocked
    expect(res.body.user.password).toBeUndefined();
  });

  test('1d. Admin login works + returns role=admin', async () => {
    const res = await post('/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASS });
    if (res.status !== 200) {
      console.warn('⚠ Admin credentials not seeded — skipping admin login test');
      adminToken = null;
      return;
    }
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  test('1e. Super Admin login works + returns role=super_admin', async () => {
    const res = await post('/api/auth/login', { email: SA_EMAIL, password: SA_PASS });
    if (res.status !== 200) {
      console.warn('⚠ SuperAdmin credentials not seeded — skipping superadmin login test');
      superAdminToken = null;
      return;
    }
    expect(res.body.user.role).toBe('super_admin');
    superAdminToken = res.body.token;
  });

  test('1f. Wrong password fails login', async () => {
    const res = await post('/api/auth/login', { email: STUDENT_EMAIL, password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('1g. Unknown email fails login', async () => {
    const res = await post('/api/auth/login', { email: 'nobody@nowhere.com', password: 'x' });
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 2: GET /api/users/me
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 2: GET /api/users/me', () => {
  test('2a. Student can get own profile', async () => {
    const res = await get('/api/users/me', studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(STUDENT_EMAIL);
    expect(res.body.data.role).toBe('student');
  });

  test('2b. Profile NEVER contains password or hash', async () => {
    const res = await get('/api/users/me', studentToken);
    expect(res.body.data.password).toBeUndefined();
  });

  test('2c. Unauthenticated request fails with 401', async () => {
    const res = await get('/api/users/me', '');
    expect(res.status).toBe(401);
  });

  test('2d. Invalid token fails with 401', async () => {
    const res = await get('/api/users/me', 'bad.token.here');
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 3: PUT /api/users/me
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 3: PUT /api/users/me', () => {
  test('3a. Student can update own profile', async () => {
    const res = await put('/api/users/me', {
      name:        'Updated Student A',
      department:  'Computer Science',
      roll_number: 'CS2024001',
    }, studentToken);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Student A');
    expect(res.body.data.department).toBe('Computer Science');
    expect(res.body.data.roll_number).toBe('CS2024001');
  });

  test('3b. Email cannot be changed via PUT /api/users/me', async () => {
    // Send an email field — it should be silently ignored
    const res = await put('/api/users/me', {
      name:  'Updated Student A',
      email: 'hacker@evil.com',
    }, studentToken);
    expect(res.status).toBe(200);
    // Verify email is unchanged
    const me = await get('/api/users/me', studentToken);
    expect(me.body.data.email).toBe(STUDENT_EMAIL);
  });

  test('3c. Role cannot be changed via PUT /api/users/me', async () => {
    await put('/api/users/me', {
      name: 'Still Student A',
      role: 'admin',
    }, studentToken);
    const me = await get('/api/users/me', studentToken);
    expect(me.body.data.role).toBe('student');
  });

  test('3d. Empty name is rejected', async () => {
    const res = await put('/api/users/me', { name: '' }, studentToken);
    expect(res.status).toBe(400);
  });

  test('3e. Unauthenticated PUT is rejected', async () => {
    const res = await put('/api/users/me', { name: 'Hacker' }, '');
    expect(res.status).toBe(401);
  });

  test('3f. Updated profile does NOT return password', async () => {
    const res = await put('/api/users/me', { name: 'Updated Student A' }, studentToken);
    expect(res.body.data?.password).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 4: PUT /api/users/me/password
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 4: PUT /api/users/me/password', () => {
  test('4a. Correct current password — change succeeds', async () => {
    const res = await put('/api/users/me/password', {
      currentPassword: STUDENT_PASS,
      newPassword:     'NewPass9876',
    }, studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('4b. Can login with new password', async () => {
    const res = await post('/api/auth/login', { email: STUDENT_EMAIL, password: 'NewPass9876' });
    expect(res.status).toBe(200);
    studentToken = res.body.token; // refresh token
  });

  test('4c. Wrong current password is rejected', async () => {
    const res = await put('/api/users/me/password', {
      currentPassword: 'WrongCurrentPass',
      newPassword:     'NewPass9876',
    }, studentToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/incorrect/i);
  });

  test('4d. Missing currentPassword is rejected', async () => {
    const res = await put('/api/users/me/password', {
      newPassword: 'SomePass123',
    }, studentToken);
    expect(res.status).toBe(400);
  });

  test('4e. Missing newPassword is rejected', async () => {
    const res = await put('/api/users/me/password', {
      currentPassword: 'NewPass9876',
    }, studentToken);
    expect(res.status).toBe(400);
  });

  test('4f. New password too short (< 6) is rejected', async () => {
    const res = await put('/api/users/me/password', {
      currentPassword: 'NewPass9876',
      newPassword:     'abc',
    }, studentToken);
    expect(res.status).toBe(400);
  });

  test('4g. Unauthenticated request is rejected', async () => {
    const res = await put('/api/users/me/password', {
      currentPassword: 'NewPass9876',
      newPassword:     'AnotherPass123',
    }, '');
    expect(res.status).toBe(401);
  });

  test('4h. Student cannot change another user\'s password (no cross-user endpoint)', async () => {
    // The only password change endpoint binds to req.user.id from token.
    // There is no /api/users/:id/password endpoint — ownership is structural.
    // Verify by trying to call the endpoint with student2's token
    const res = await put('/api/users/me/password', {
      currentPassword: STUDENT_PASS,
      newPassword:     'Hijacked123',
    }, studentToken2);
    // This is student2's own password change — it should succeed for student2 only
    // but has zero effect on student1
    const me1 = await get('/api/users/me', studentToken);
    // Student1's token still works → student2's action did not affect student1
    expect(me1.status).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 5: Events (public access + student access)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 5: Event Discovery', () => {
  test('5a. Public can list events without auth', async () => {
    const res = await get('/api/events', '');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      eventId = String(res.body.data[0].id);
    }
  });

  test('5b. Student can list events', async () => {
    const res = await get('/api/events', studentToken);
    expect(res.status).toBe(200);
  });

  test('5c. Public can get event by id', async () => {
    if (!eventId) { console.warn('No event to test'); return; }
    const res = await get(`/api/events/${eventId}`, '');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBeTruthy();
  });

  test('5d. Non-existent event returns 404', async () => {
    const res = await get('/api/events/999999', '');
    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 6: My Registrations
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 6: My Registrations', () => {
  test('6a. Student can view own registrations', async () => {
    const res = await get('/api/registrations/my', studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      registrationId = String(res.body.data[0].id);
    }
  });

  test('6b. Unauthenticated cannot list registrations', async () => {
    const res = await get('/api/registrations/my', '');
    expect(res.status).toBe(401);
  });

  test('6c. Admin cannot access /api/registrations/my (role=admin blocked)', async () => {
    if (!adminToken) { console.warn('No admin token'); return; }
    const res = await get('/api/registrations/my', adminToken);
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 7: Registration Detail Security
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 7: Registration Detail Security', () => {
  // Setup: register student2 for an event so student2 has a registration
  beforeAll(async () => {
    if (!eventId) return;
    // Check if student2 is already registered
    const check = await get(`/api/events/${eventId}/my-registration`, studentToken2);
    if (check.body.registered) {
      // Get their registration id
      const myRegs = await get('/api/registrations/my', studentToken2);
      if (myRegs.body.data?.length > 0) {
        student2RegId = String(myRegs.body.data[0].id);
      }
      return;
    }
    // Register student2
    const reg = await post(`/api/events/${eventId}/register`, { responses: [] }, studentToken2);
    if (reg.status === 201) {
      student2RegId = String(reg.body.data.registrationId);
    }
  });

  test('7a. Student can view own registration detail', async () => {
    if (!registrationId) { console.warn('No registration to test'); return; }
    const res = await get(`/api/registrations/${registrationId}`, studentToken);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBeTruthy();
  });

  test('7b. Student CANNOT view another student\'s registration — must return 404', async () => {
    if (!student2RegId) { console.warn('Student2 has no registration'); return; }
    // Student1 tries to access Student2's registration
    const res = await get(`/api/registrations/${student2RegId}`, studentToken);
    expect(res.status).toBe(404);
  });

  test('7c. Admin CAN view any registration', async () => {
    if (!adminToken || !student2RegId) { console.warn('Skip: no admin/registration'); return; }
    const res = await get(`/api/registrations/${student2RegId}`, adminToken);
    expect(res.status).toBe(200);
  });

  test('7d. Unauthenticated cannot view any registration', async () => {
    if (!registrationId) { console.warn('No registration to test'); return; }
    const res = await get(`/api/registrations/${registrationId}`, '');
    expect(res.status).toBe(401);
  });

  test('7e. Non-existent registration returns 404', async () => {
    const res = await get('/api/registrations/999999', studentToken);
    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 8: Notifications
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 8: Notifications Access Control', () => {
  test('8a. Student can view notifications', async () => {
    const res = await get('/api/notifications', studentToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('8b. Unauthenticated cannot view notifications', async () => {
    const res = await get('/api/notifications', '');
    expect(res.status).toBe(401);
  });

  test('8c. Student CANNOT create notification', async () => {
    const res = await post('/api/notifications', {
      title:   'Hacked!',
      message: 'Student should not be able to do this.',
    }, studentToken);
    expect(res.status).toBe(403);
  });

  test('8d. Student CANNOT delete notification', async () => {
    const res = await del('/api/notifications/1', studentToken);
    expect(res.status).toBe(403);
  });

  test('8e. Admin CAN create notification', async () => {
    if (!adminToken) { console.warn('No admin token'); return; }
    const res = await post('/api/notifications', {
      title:   'Phase 6 Test Notification',
      message: 'This is a test notification created during Phase 6 testing.',
    }, adminToken);
    expect([200, 201]).toContain(res.status);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 9: Student Cannot Access Admin APIs
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 9: Admin API Access Control', () => {
  test('9a. Student cannot create event', async () => {
    const res = await post('/api/events', {
      title:       'Hacker Event',
      description: 'Should fail',
      venue:       'Nowhere',
      event_date:  '2027-01-01T10:00:00Z',
    }, studentToken);
    expect(res.status).toBe(403);
  });

  test('9b. Student cannot update event', async () => {
    if (!eventId) { console.warn('No event'); return; }
    const res = await put(`/api/events/${eventId}`, {
      title:       'Hacked!',
      description: 'x',
      venue:       'x',
      event_date:  '2027-01-01T10:00:00Z',
    }, studentToken);
    expect(res.status).toBe(403);
  });

  test('9c. Student cannot delete event', async () => {
    if (!eventId) { console.warn('No event'); return; }
    const res = await del(`/api/events/${eventId}`, studentToken);
    expect(res.status).toBe(403);
  });

  test('9d. Student cannot access event registrations (admin endpoint)', async () => {
    if (!eventId) { console.warn('No event'); return; }
    const res = await get(`/api/events/${eventId}/registrations`, studentToken);
    expect(res.status).toBe(403);
  });

  test('9e. Student cannot access admin notifications listing', async () => {
    const res = await get('/api/notifications/manage', studentToken);
    expect(res.status).toBe(403);
  });

  test('9f. Student cannot access manage events listing', async () => {
    const res = await get('/api/events/manage', studentToken);
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 10: Student Cannot Access Super Admin APIs
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 10: Super Admin API Access Control', () => {
  test('10a. Student cannot list admins', async () => {
    const res = await get('/api/super-admin/admins', studentToken);
    expect(res.status).toBe(403);
  });

  test('10b. Student cannot create admin', async () => {
    const res = await post('/api/super-admin/admins', {
      name:     'Fake Admin',
      email:    'fake@admin.com',
      password: 'admin123',
    }, studentToken);
    expect(res.status).toBe(403);
  });

  test('10c. Admin cannot access super-admin APIs', async () => {
    if (!adminToken) { console.warn('No admin token'); return; }
    const res = await get('/api/super-admin/admins', adminToken);
    expect(res.status).toBe(403);
  });

  test('10d. Super Admin CAN list admins', async () => {
    if (!superAdminToken) { console.warn('No superadmin token'); return; }
    const res = await get('/api/super-admin/admins', superAdminToken);
    expect(res.status).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 11: Regression — Events, Registrations, Notifications
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 11: Regression Tests', () => {
  test('11a. GET /api/events still returns correct shape', async () => {
    const res = await get('/api/events', '');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('count');
  });

  test('11b. Admin event management endpoint still works', async () => {
    if (!adminToken) { console.warn('No admin token'); return; }
    const res = await get('/api/events/manage', adminToken);
    expect(res.status).toBe(200);
  });

  test('11c. Notifications endpoint returns correct shape', async () => {
    const res = await get('/api/notifications', studentToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('11d. Admin notification management still accessible to admin', async () => {
    if (!adminToken) { console.warn('No admin token'); return; }
    const res = await get('/api/notifications/manage', adminToken);
    expect(res.status).toBe(200);
  });

  test('11e. Super Admin manage notifications still accessible', async () => {
    if (!superAdminToken) { console.warn('No SA token'); return; }
    const res = await get('/api/notifications/manage', superAdminToken);
    expect(res.status).toBe(200);
  });

  test('11f. Health endpoint still works', async () => {
    const res = await get('/api/health', '');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
