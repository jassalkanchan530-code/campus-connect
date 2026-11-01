const express = require('express');
const router  = express.Router();

const { getMyRegistrations, getRegistrationById } = require('../controllers/registrationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Student: list own registrations
router.get('/my', authMiddleware, roleMiddleware('student'), getMyRegistrations);

// Student or Admin: single registration + responses
// Controller checks ownership for students; admins can see any
router.get('/:id', authMiddleware, getRegistrationById);

module.exports = router;
