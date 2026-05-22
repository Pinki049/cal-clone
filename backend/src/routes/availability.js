const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const scheduleRes = await db.query(
      'SELECT * FROM availability WHERE user_id = 1 AND is_default = TRUE LIMIT 1'
    );
    if (!scheduleRes.rows.length) return res.status(404).json({ error: 'No availability found' });

    const schedule = scheduleRes.rows[0];

    const rulesRes = await db.query(
      'SELECT * FROM availability_rules WHERE availability_id = $1 ORDER BY day_of_week',
      [schedule.id]
    );

    const overridesRes = await db.query(
      'SELECT * FROM date_overrides WHERE availability_id = $1 AND date >= CURRENT_DATE ORDER BY date',
      [schedule.id]
    );

    res.json({ ...schedule, rules: rulesRes.rows, overrides: overridesRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  const { timezone, rules } = req.body;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const schedRes = await client.query(
      'SELECT id FROM availability WHERE user_id = 1 AND is_default = TRUE LIMIT 1'
    );
    const scheduleId = schedRes.rows[0]?.id;
    if (!scheduleId) throw new Error('Availability schedule not found');

    await client.query('UPDATE availability SET timezone = $1 WHERE id = $2', [timezone, scheduleId]);
    await client.query('DELETE FROM availability_rules WHERE availability_id = $1', [scheduleId]);

    for (const rule of rules) {
      await client.query(
        `INSERT INTO availability_rules (availability_id, day_of_week, start_time, end_time, is_available)
         VALUES ($1, $2, $3, $4, $5)`,
        [scheduleId, rule.day_of_week, rule.start_time, rule.end_time, rule.is_available]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Availability updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;