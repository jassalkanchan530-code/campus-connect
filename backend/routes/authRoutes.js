const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /api/auth/register  — student self-registration
router.post('/register', register);

// POST /api/auth/login     — login for both students and admins
router.post('/login', login);

module.exports = router;
