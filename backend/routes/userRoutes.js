const express = require('express');
const router  = express.Router();

const { getMe, updateMe, changePassword } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// All user profile endpoints require authentication.
// No role restriction beyond "must be logged in" — each controller reads from req.user.id
// so a user can only ever access/mutate their own data.

router.get('/me',           authMiddleware, getMe);
router.put('/me',           authMiddleware, updateMe);
router.put('/me/password',  authMiddleware, changePassword);

module.exports = router;
