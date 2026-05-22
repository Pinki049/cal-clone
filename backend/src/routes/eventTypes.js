const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT et.*, 
        (SELECT COUNT(*) FROM bookings b WHERE b.event_type_id = et.id AND b.status = 'confirmed' AND b.start_time > NOW()) as upcoming_count
       FROM event_types et 
       WHERE et.user_id = 1 AND et.is_active = TRUE 
       ORDER BY et.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM event_types WHERE id = $1 AND user_id = 1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Event type not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { title, description, duration, slug, color } = req.body;
  if (!title || !duration || !slug) {
    return res.status(400).json({ error: 'title, duration, and slug are required' });
  }
  try {
    const existing = await db.query('SELECT id FROM event_types WHERE slug = $1', [slug]);
    if (existing.rows.length) return res.status(409).json({ error: 'Slug already in use' });

    const { rows } = await db.query(
      `INSERT INTO event_types (user_id, title, description, duration, slug, color)
       VALUES (1, $1, $2, $3, $4, $5) RETURNING *`,
      [title, description || null, duration, slug, color || '#0ea5e9']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { title, description, duration, slug, color, is_active } = req.body;
  try {
    if (slug) {
      const existing = await db.query(
        'SELECT id FROM event_types WHERE slug = $1 AND id != $2',
        [slug, req.params.id]
      );
      if (existing.rows.length) return res.status(409).json({ error: 'Slug already in use' });
    }
    const { rows } = await db.query(
      `UPDATE event_types 
       SET title=$1, description=$2, duration=$3, slug=$4, color=$5, is_active=$6, updated_at=NOW()
       WHERE id=$7 AND user_id=1 RETURNING *`,
      [title, description, duration, slug, color, is_active ?? true, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Event type not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'DELETE FROM event_types WHERE id = $1 AND user_id = 1 RETURNING id',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Event type not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;