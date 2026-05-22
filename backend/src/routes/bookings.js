const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const { filter = 'upcoming' } = req.query;
  try {
    let whereClause = '';
    if (filter === 'upcoming') {
      whereClause = "AND b.start_time > NOW() AND b.status = 'confirmed'";
    } else if (filter === 'past') {
      whereClause = "AND b.start_time <= NOW()";
    }

    const { rows } = await db.query(
      `SELECT b.*, et.title as event_title, et.duration, et.color, et.slug
       FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       WHERE et.user_id = 1 ${whereClause}
       ORDER BY b.start_time ${filter === 'past' ? 'DESC' : 'ASC'}
       LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:uid', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT b.*, et.title as event_title, et.duration, et.color, et.slug
       FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       WHERE b.uid = $1`,
      [req.params.uid]
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:uid', async (req, res) => {
  const { reason } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE bookings 
       SET status='cancelled', cancelled_at=NOW(), cancel_reason=$1, updated_at=NOW()
       WHERE uid=$2 RETURNING *`,
      [reason || null, req.params.uid]
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking cancelled', booking: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;