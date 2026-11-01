const express = require('express');
const router  = express.Router();

const {
  getNotifications,
  getNotificationsAdmin,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
} = require('../controllers/notificationController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ── NOTE: static segment (/manage) must precede parameterised one (/:id) ──────

// Admin / Super Admin: management listing
router.get('/manage',
  authMiddleware,
  roleMiddleware('admin', 'super_admin'),
  getNotificationsAdmin
);

// Authenticated read (all roles)
router.get('/',    authMiddleware, getNotifications);
router.get('/:id', authMiddleware, getNotificationById);

// Admin / Super Admin: mutations
router.post('/',
  authMiddleware,
  roleMiddleware('admin', 'super_admin'),
  createNotification
);

router.put('/:id',
  authMiddleware,
  roleMiddleware('admin', 'super_admin'),
  updateNotification
);

router.delete('/:id',
  authMiddleware,
  roleMiddleware('admin', 'super_admin'),
  deleteNotification
);

module.exports = router;
