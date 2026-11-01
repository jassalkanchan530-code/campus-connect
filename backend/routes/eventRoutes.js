const express = require('express');
const router  = express.Router();

const {
  getAllEvents, getAllEventsAdmin, getEventById,
  createEvent, updateEvent, deleteEvent,
} = require('../controllers/eventController');

const {
  registerForEvent, checkMyRegistration,
  addFormField, getFormFields, updateFormField, deleteFormField,
  getEventRegistrations,
} = require('../controllers/registrationController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ── NOTE: static segments (/manage) must precede parameterised ones (/:id) ───

// Admin: all events (past + upcoming)
router.get('/manage', authMiddleware, roleMiddleware('admin'), getAllEventsAdmin);

// ── Public / Student ──────────────────────────────────────────────────────────
router.get('/',    getAllEvents);
router.get('/:id', getEventById);

// ── Admin: CRUD ───────────────────────────────────────────────────────────────
router.post('/',      authMiddleware, roleMiddleware('admin'), createEvent);
router.put('/:id',    authMiddleware, roleMiddleware('admin'), updateEvent);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteEvent);

// ── Student: register + check own registration ────────────────────────────────
// These are /:eventId/sub-path, so they do NOT conflict with /:id above
router.post('/:eventId/register',        authMiddleware, roleMiddleware('student'), registerForEvent);
router.get('/:eventId/my-registration',  authMiddleware, roleMiddleware('student'), checkMyRegistration);

// ── Admin: form fields management ────────────────────────────────────────────
router.post('/:eventId/form-fields',                     authMiddleware, roleMiddleware('admin'), addFormField);
router.get('/:eventId/form-fields',                      authMiddleware, roleMiddleware('admin'), getFormFields);
router.put('/:eventId/form-fields/:fieldId',             authMiddleware, roleMiddleware('admin'), updateFormField);
router.delete('/:eventId/form-fields/:fieldId',          authMiddleware, roleMiddleware('admin'), deleteFormField);

// ── Admin: view all registrations for an event ────────────────────────────────
router.get('/:eventId/registrations', authMiddleware, roleMiddleware('admin'), getEventRegistrations);

module.exports = router;
