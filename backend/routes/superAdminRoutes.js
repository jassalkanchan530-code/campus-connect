const express = require('express');
const router  = express.Router();

const {
  listAdmins,
  createAdmin,
  deactivateAdmin,
  activateAdmin,
  getAuditLogs,
} = require('../controllers/superAdminController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes here require authentication + super_admin role
const superAdminOnly = [authMiddleware, roleMiddleware('super_admin')];

// ── Admin Management ─────────────────────────────────────────────────────────
router.get('/',                        ...superAdminOnly, listAdmins);
router.post('/',                       ...superAdminOnly, createAdmin);
router.patch('/:id/deactivate',        ...superAdminOnly, deactivateAdmin);
router.patch('/:id/activate',          ...superAdminOnly, activateAdmin);

// ── Audit Logs ────────────────────────────────────────────────────────────────
router.get('/audit-logs',              ...superAdminOnly, getAuditLogs);

module.exports = router;
