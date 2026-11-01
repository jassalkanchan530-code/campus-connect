const db       = require('../config/db');
const auditLog = require('../utils/auditLog');

// Helper: format JS date to MySQL DATETIME string
const toMySQL = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString().slice(0, 19).replace('T', ' ');
};

// ─── GET /api/events ──────────────────────────────────────────────────────────
// Public — returns upcoming events sorted by date ASC
const getAllEvents = async (req, res) => {
  try {
    const [events] = await db.execute(`
      SELECT
        e.id, e.title, e.description, e.venue, e.event_date,
        e.last_registration_date, e.max_participants, e.category,
        e.image_url, e.created_at,
        u.name  AS created_by_name,
        (SELECT COUNT(*) FROM registrations r
         WHERE r.event_id = e.id AND r.status = 'registered') AS registered_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.event_date >= NOW()
      ORDER BY e.event_date ASC
    `);

    return res.status(200).json({
      success: true,
      count:   events.length,
      data:    events,
    });
  } catch (err) {
    console.error('getAllEvents error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching events.' });
  }
};

// ─── GET /api/events/manage ───────────────────────────────────────────────────
// Admin only — returns ALL events (past + upcoming) sorted by date DESC
const getAllEventsAdmin = async (req, res) => {
  try {
    const [events] = await db.execute(`
      SELECT
        e.id, e.title, e.description, e.venue, e.event_date,
        e.last_registration_date, e.max_participants, e.category,
        e.image_url, e.created_at,
        u.name AS created_by_name,
        (SELECT COUNT(*) FROM registrations r
         WHERE r.event_id = e.id AND r.status = 'registered') AS registered_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.event_date DESC
    `);

    return res.status(200).json({
      success: true,
      count:   events.length,
      data:    events,
    });
  } catch (err) {
    console.error('getAllEventsAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching events.' });
  }
};

// ─── GET /api/events/:id ──────────────────────────────────────────────────────
// Public — returns one event with its form fields
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await db.execute(`
      SELECT
        e.*,
        u.name AS created_by_name,
        (SELECT COUNT(*) FROM registrations r
         WHERE r.event_id = e.id AND r.status = 'registered') AS registered_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [id]);

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Fetch any custom registration form fields for this event
    const [formFields] = await db.execute(
      `SELECT * FROM event_form_fields WHERE event_id = ? ORDER BY field_order ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data:    { ...events[0], form_fields: formFields },
    });
  } catch (err) {
    console.error('getEventById error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching event.' });
  }
};

// ─── POST /api/events ─────────────────────────────────────────────────────────
// Admin only — create a new event
const createEvent = async (req, res) => {
  try {
    const {
      title, description, venue, event_date,
      last_registration_date, max_participants, category, image_url,
    } = req.body;

    if (!title?.trim() || !description?.trim() || !venue?.trim() || !event_date) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, venue, and event date are required.',
      });
    }

    const [result] = await db.execute(
      `INSERT INTO events
         (title, description, venue, event_date, last_registration_date,
          max_participants, category, image_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        venue.trim(),
        toMySQL(event_date),
        toMySQL(last_registration_date),
        max_participants ? Number(max_participants) : null,
        category?.trim()   || null,
        image_url?.trim()  || null,
        req.user.id,
      ]
    );

    await auditLog({
      actorId:    req.user.id,
      actorRole:  req.user.role,
      action:     'EVENT_CREATED',
      entityType: 'event',
      entityId:   result.insertId,
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data:    { id: result.insertId },
    });
  } catch (err) {
    console.error('createEvent error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating event.' });
  }
};

// ─── PUT /api/events/:id ──────────────────────────────────────────────────────
// Admin only — update an existing event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, venue, event_date,
      last_registration_date, max_participants, category, image_url,
    } = req.body;

    if (!title?.trim() || !description?.trim() || !venue?.trim() || !event_date) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, venue, and event date are required.',
      });
    }

    const [existing] = await db.execute('SELECT id FROM events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await db.execute(
      `UPDATE events
       SET title = ?, description = ?, venue = ?, event_date = ?,
           last_registration_date = ?, max_participants = ?, category = ?, image_url = ?
       WHERE id = ?`,
      [
        title.trim(),
        description.trim(),
        venue.trim(),
        toMySQL(event_date),
        toMySQL(last_registration_date),
        max_participants ? Number(max_participants) : null,
        category?.trim()  || null,
        image_url?.trim() || null,
        id,
      ]
    );

    return res.status(200).json({ success: true, message: 'Event updated successfully.' });
  } catch (err) {
    console.error('updateEvent error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating event.' });
  }
};

// ─── DELETE /api/events/:id ───────────────────────────────────────────────────
// Admin only — delete an event (cascades to form_fields, registrations, responses)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT id FROM events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await db.execute('DELETE FROM events WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Event deleted successfully.' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting event.' });
  }
};

module.exports = {
  getAllEvents,
  getAllEventsAdmin,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
