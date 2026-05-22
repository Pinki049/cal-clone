const router = require('express').Router();
const db = require('../db');

router.get('/me', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE id = 1');
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', async (req, res) => {
  const { name, email, timezone } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE users SET name=$1, email=$2, timezone=$3 WHERE id=1 RETURNING *',
      [name, email, timezone]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;