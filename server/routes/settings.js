
const express = require('express');
const pool = require('../database/connection');
const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM settings';
    const values = [];
    
    if (category) {
      query += ' WHERE category = $1';
      values.push(category);
    }
    
    query += ' ORDER BY key';
    
    const result = await pool.query(query, values);
    
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update setting
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, category = 'general' } = req.body;
    
    const query = `
      INSERT INTO settings (key, value, category, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET value = $2, updated_at = NOW()
      RETURNING *
    `;
    
    const result = await pool.query(query, [key, JSON.stringify(value), category]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visitor counter
router.get('/counter/visitor', async (req, res) => {
  try {
    const result = await pool.query('SELECT value FROM counters WHERE name = $1', ['visitor_counter']);
    res.json({ value: result.rows[0]?.value || 100 });
  } catch (error) {
    console.error('Error fetching counter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset visitor counter
router.put('/counter/visitor', async (req, res) => {
  try {
    const { value = 100 } = req.body;
    
    const result = await pool.query(
      'UPDATE counters SET value = $1 WHERE name = $2 RETURNING *',
      [value, 'visitor_counter']
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating counter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
