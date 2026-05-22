const router = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/:username/:slug', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT et.*, u.name as host_name, u.email as host_email, u.timezone as host_timezone
       FROM event_types et
       JOIN users u ON et.user_id = u.id
       WHERE u.username = $1 AND et.slug = $2 AND et.is_active = TRUE`,
      [req.params.username, req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Event type not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:username/:slug/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required' });
  try {
    const etRes = await db.query(
      `SELECT et.*, u.id as user_id, u.timezone
       FROM event_types et
       JOIN users u ON et.user_id = u.id
       WHERE u.username = $1 AND et.slug = $2 AND et.is_active = TRUE`,
      [req.params.username, req.params.slug]
    );
    if (!etRes.rows.length) return res.status(404).json({ error: 'Event type not found' });
    const eventType = etRes.rows[0];
    const duration = eventType.duration;

    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    const schedRes = await db.query(
      `SELECT ar.start_time, ar.end_time, ar.is_available
       FROM availability a
       JOIN availability_rules ar ON ar.availability_id = a.id
       WHERE a.user_id = $1 AND a.is_default = TRUE AND ar.day_of_week = $2`,
      [eventType.user_id, dayOfWeek]
    );

    if (!schedRes.rows.length || !schedRes.rows[0].is_available) {
      return res.json({ slots: [] });
    }

    const overrideRes = await db.query(
      `SELECT * FROM date_overrides 
       WHERE availability_id = (SELECT id FROM availability WHERE user_id=$1 AND is_default=TRUE)
       AND date = $2`,
      [eventType.user_id, date]
    );

    let startTime, endTime;
    if (overrideRes.rows.length) {
      const override = overrideRes.rows[0];
      if (override.is_blocked) return res.json({ slots: [] });
      startTime = override.start_time;
      endTime = override.end_time;
    } else {
      startTime = schedRes.rows[0].start_time;
      endTime = schedRes.rows[0].end_time;
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const start = new Date(year, month - 1, day, startH, startM, 0);
    const end = new Date(year, month - 1, day, endH, endM, 0);

    const bookingsRes = await db.query(
      `SELECT b.start_time, b.end_time FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       WHERE et.user_id = $1 
         AND b.status = 'confirmed'
         AND DATE(b.start_time AT TIME ZONE 'UTC') = $2`,
      [eventType.user_id, date]
    );

    const slots = [];
    let current = new Date(start);
    const now = new Date();

    while (current < end) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      if (slotEnd > end) break;
      if (current > now) {
        const overlaps = bookingsRes.rows.some(b => {
          const bStart = new Date(b.start_time);
          const bEnd = new Date(b.end_time);
          return current < bEnd && slotEnd > bStart;
        });
        if (!overlaps) {
          const hh = String(current.getHours()).padStart(2, '0');
          const mm = String(current.getMinutes()).padStart(2, '0');
          slots.push(`${hh}:${mm}`);
        }
      }
      current = new Date(current.getTime() + duration * 60000);
    }

    res.json({ slots, date, duration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:username/:slug/book', async (req, res) => {
  const { date, time, name, email, notes } = req.body;
  if (!date || !time || !name || !email) {
    return res.status(400).json({ error: 'date, time, name, and email are required' });
  }
  try {
    const etRes = await db.query(
      `SELECT et.*, u.id as user_id FROM event_types et
       JOIN users u ON et.user_id = u.id
       WHERE u.username = $1 AND et.slug = $2 AND et.is_active = TRUE`,
      [req.params.username, req.params.slug]
    );
    if (!etRes.rows.length) return res.status(404).json({ error: 'Event type not found' });
    const eventType = etRes.rows[0];

    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(year, month - 1, day, hours, minutes, 0);
    const endTime = new Date(startTime.getTime() + eventType.duration * 60000);

    const conflict = await db.query(
      `SELECT id FROM bookings
       WHERE event_type_id IN (SELECT id FROM event_types WHERE user_id = $1)
         AND status = 'confirmed'
         AND start_time < $2 AND end_time > $3`,
      [eventType.user_id, endTime, startTime]
    );
    if (conflict.rows.length) {
      return res.status(409).json({ error: 'This slot is already booked. Please choose another time.' });
    }

    const uid = uuidv4();
    const { rows } = await db.query(
      `INSERT INTO bookings (event_type_id, booker_name, booker_email, booker_notes, start_time, end_time, uid)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [eventType.id, name, email, notes || null, startTime, endTime, uid]
    );

    res.status(201).json({
      booking: rows[0],
      event: { title: eventType.title, duration: eventType.duration },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;