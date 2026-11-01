const db = require('../config/db');

// ─── Helper ───────────────────────────────────────────────────────────────────
// mysql2 promise pool supports getConnection() for manual transactions
const getConn = () => db.getConnection();

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: POST /api/events/:eventId/register
// Registers a student for an event and saves all dynamic form responses.
// Uses a DB transaction — both inserts succeed or both roll back.
// ─────────────────────────────────────────────────────────────────────────────
const registerForEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId       = req.user.id;
  const { responses = [] } = req.body; // [{ field_id, answer }]

  const conn = await getConn();
  try {
    await conn.beginTransaction();

    // 1. Event must exist
    const [events] = await conn.execute('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    const event = events[0];

    // 2. Registration deadline must not have passed
    if (event.last_registration_date && new Date(event.last_registration_date) < new Date()) {
      await conn.rollback(); conn.release();
      return res.status(400).json({ success: false, message: 'Registration deadline has passed.' });
    }

    // 3. Seats must be available
    if (event.max_participants) {
      const [[{ cnt }]] = await conn.execute(
        "SELECT COUNT(*) AS cnt FROM registrations WHERE event_id = ? AND status = 'registered'",
        [eventId]
      );
      if (cnt >= event.max_participants) {
        await conn.rollback(); conn.release();
        return res.status(409).json({ success: false, message: 'Event is full. No seats available.' });
      }
    }

    // 4. Prevent duplicate registration
    const [dup] = await conn.execute(
      'SELECT id FROM registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    if (dup.length > 0) {
      await conn.rollback(); conn.release();
      return res.status(409).json({ success: false, message: 'You are already registered for this event.' });
    }

    // 5. Fetch form fields and validate submitted responses
    const [formFields] = await conn.execute(
      'SELECT * FROM event_form_fields WHERE event_id = ? ORDER BY field_order ASC',
      [eventId]
    );

    const validFieldIds = new Set(formFields.map((f) => f.id));

    // Validate that submitted field_ids actually belong to this event
    for (const r of responses) {
      if (!validFieldIds.has(Number(r.field_id))) {
        await conn.rollback(); conn.release();
        return res.status(400).json({ success: false, message: 'Invalid form field submitted.' });
      }
    }

    // Validate required fields and select options
    for (const field of formFields) {
      const submitted = responses.find((r) => Number(r.field_id) === field.id);
      const answer    = submitted?.answer?.toString().trim() || '';

      if (field.is_required && !answer) {
        await conn.rollback(); conn.release();
        return res.status(400).json({
          success: false,
          message: `"${field.field_label}" is required.`,
        });
      }

      if (field.field_type === 'select' && field.field_options && answer) {
        const allowed = field.field_options.split(',').map((o) => o.trim());
        if (!allowed.includes(answer)) {
          await conn.rollback(); conn.release();
          return res.status(400).json({
            success: false,
            message: `Invalid option for "${field.field_label}". Allowed: ${allowed.join(', ')}.`,
          });
        }
      }
    }

    // 6. Insert registration
    const [regResult] = await conn.execute(
      "INSERT INTO registrations (event_id, user_id, status) VALUES (?, ?, 'registered')",
      [eventId, userId]
    );
    const registrationId = regResult.insertId;

    // 7. Save form responses (only non-empty answers)
    for (const r of responses) {
      const answer = r.answer?.toString().trim();
      if (answer) {
        await conn.execute(
          'INSERT INTO form_responses (registration_id, field_id, answer) VALUES (?, ?, ?)',
          [registrationId, Number(r.field_id), answer]
        );
      }
    }

    await conn.commit();
    conn.release();

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for the event.',
      data:    { registrationId },
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('registerForEvent error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: GET /api/events/:eventId/my-registration
// Lightweight check — is the current student registered for this event?
// ─────────────────────────────────────────────────────────────────────────────
const checkMyRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await db.execute(
      'SELECT id, status, registered_at FROM registrations WHERE event_id = ? AND user_id = ?',
      [eventId, req.user.id]
    );
    return res.status(200).json({
      success:    true,
      registered: rows.length > 0,
      data:       rows[0] || null,
    });
  } catch (err) {
    console.error('checkMyRegistration error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: GET /api/registrations/my
// All registrations for the currently logged-in student.
// ─────────────────────────────────────────────────────────────────────────────
const getMyRegistrations = async (req, res) => {
  try {
    const [registrations] = await db.execute(
      `SELECT r.id, r.registered_at, r.status,
              e.id AS event_id, e.title, e.event_date, e.venue, e.category, e.image_url
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ?
       ORDER BY r.registered_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    console.error('getMyRegistrations error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching registrations.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT or ADMIN: GET /api/registrations/:id
// Student can only see their own; admin can see any.
// Returns registration details + all form responses.
// ─────────────────────────────────────────────────────────────────────────────
const getRegistrationById = async (req, res) => {
  try {
    const { id }   = req.params;
    const isAdmin  = req.user.role === 'admin';

    let sql    = `SELECT r.id, r.registered_at, r.status, r.user_id, r.event_id,
                         e.title, e.event_date, e.venue, e.category, e.description,
                         u.name AS student_name, u.email AS student_email,
                         u.department, u.roll_number
                  FROM registrations r
                  JOIN events e ON r.event_id = e.id
                  JOIN users u  ON r.user_id  = u.id
                  WHERE r.id = ?`;
    const params = [id];

    if (!isAdmin) {
      sql += ' AND r.user_id = ?';
      params.push(req.user.id);
    }

    const [rows] = await db.execute(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    // Fetch form responses with their field labels
    const [responses] = await db.execute(
      `SELECT fr.id, fr.answer,
              eff.id AS field_id, eff.field_label, eff.field_type, eff.field_order
       FROM form_responses fr
       JOIN event_form_fields eff ON fr.field_id = eff.id
       WHERE fr.registration_id = ?
       ORDER BY eff.field_order ASC`,
      [id]
    );

    return res.status(200).json({ success: true, data: { ...rows[0], responses } });
  } catch (err) {
    console.error('getRegistrationById error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching registration.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: POST /api/events/:eventId/form-fields
// ─────────────────────────────────────────────────────────────────────────────
const addFormField = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { field_label, field_type, field_options, is_required, field_order } = req.body;

    if (!field_label?.trim() || !field_type) {
      return res.status(400).json({ success: false, message: 'Field label and type are required.' });
    }

    const VALID_TYPES = ['text', 'number', 'email', 'select', 'textarea'];
    if (!VALID_TYPES.includes(field_type)) {
      return res.status(400).json({ success: false, message: `Invalid type. Use: ${VALID_TYPES.join(', ')}.` });
    }

    if (field_type === 'select' && !field_options?.trim()) {
      return res.status(400).json({ success: false, message: 'Select fields require at least one option.' });
    }

    const [ev] = await db.execute('SELECT id FROM events WHERE id = ?', [eventId]);
    if (ev.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const [result] = await db.execute(
      `INSERT INTO event_form_fields
         (event_id, field_label, field_type, field_options, is_required, field_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        field_label.trim(),
        field_type,
        field_options?.trim() || null,
        is_required ? 1 : 0,
        field_order ?? 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Form field added.',
      data:    { id: result.insertId },
    });
  } catch (err) {
    console.error('addFormField error:', err);
    return res.status(500).json({ success: false, message: 'Server error adding form field.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/events/:eventId/form-fields
// ─────────────────────────────────────────────────────────────────────────────
const getFormFields = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [fields] = await db.execute(
      'SELECT * FROM event_form_fields WHERE event_id = ? ORDER BY field_order ASC',
      [eventId]
    );
    return res.status(200).json({ success: true, count: fields.length, data: fields });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error fetching form fields.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: PUT /api/events/:eventId/form-fields/:fieldId
// ─────────────────────────────────────────────────────────────────────────────
const updateFormField = async (req, res) => {
  try {
    const { eventId, fieldId } = req.params;
    const { field_label, field_type, field_options, is_required, field_order } = req.body;

    if (!field_label?.trim() || !field_type) {
      return res.status(400).json({ success: false, message: 'Field label and type are required.' });
    }

    const [existing] = await db.execute(
      'SELECT id FROM event_form_fields WHERE id = ? AND event_id = ?',
      [fieldId, eventId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Form field not found.' });
    }

    await db.execute(
      `UPDATE event_form_fields
       SET field_label = ?, field_type = ?, field_options = ?, is_required = ?, field_order = ?
       WHERE id = ?`,
      [
        field_label.trim(),
        field_type,
        field_options?.trim() || null,
        is_required ? 1 : 0,
        field_order ?? 0,
        fieldId,
      ]
    );

    return res.status(200).json({ success: true, message: 'Form field updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error updating form field.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: DELETE /api/events/:eventId/form-fields/:fieldId
// ─────────────────────────────────────────────────────────────────────────────
const deleteFormField = async (req, res) => {
  try {
    const { eventId, fieldId } = req.params;
    const [existing] = await db.execute(
      'SELECT id FROM event_form_fields WHERE id = ? AND event_id = ?',
      [fieldId, eventId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Form field not found.' });
    }
    await db.execute('DELETE FROM event_form_fields WHERE id = ?', [fieldId]);
    return res.status(200).json({ success: true, message: 'Form field deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error deleting form field.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/events/:eventId/registrations
// All registrations for a specific event with student details.
// ─────────────────────────────────────────────────────────────────────────────
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [ev] = await db.execute('SELECT id, title FROM events WHERE id = ?', [eventId]);
    if (ev.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const [registrations] = await db.execute(
      `SELECT r.id, r.registered_at, r.status,
              u.id AS user_id, u.name, u.email, u.department, u.roll_number
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ?
       ORDER BY r.registered_at ASC`,
      [eventId]
    );

    return res.status(200).json({
      success: true,
      event:   ev[0],
      count:   registrations.length,
      data:    registrations,
    });
  } catch (err) {
    console.error('getEventRegistrations error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching registrations.' });
  }
};

module.exports = {
  registerForEvent,
  checkMyRegistration,
  getMyRegistrations,
  getRegistrationById,
  addFormField,
  getFormFields,
  updateFormField,
  deleteFormField,
  getEventRegistrations,
};
