
const express = require('express');
const pool = require('../database/connection');
const router = express.Router();

// Get all visitors
router.get('/', async (req, res) => {
  try {
    const visitorsQuery = `
      SELECT v.*, 
             json_agg(
               json_build_object(
                 'id', av.id,
                 'name', av.name,
                 'firstName', av.first_name,
                 'visitorNumber', av.visitor_number
               ) ORDER BY av.visitor_number
             ) FILTER (WHERE av.id IS NOT NULL) as additional_visitors
      FROM visitors v
      LEFT JOIN additional_visitors av ON v.id = av.visitor_id
      GROUP BY v.id
      ORDER BY v.visitor_number DESC
    `;
    
    const result = await pool.query(visitorsQuery);
    
    const visitors = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      firstName: row.first_name,
      company: row.company,
      contact: row.contact,
      visitorNumber: row.visitor_number,
      checkInTime: row.check_in_time,
      checkOutTime: row.check_out_time,
      additionalVisitorCount: row.additional_visitor_count,
      notes: row.notes,
      policyAccepted: row.policy_accepted,
      signature: row.signature,
      additionalVisitors: row.additional_visitors || []
    }));
    
    res.json(visitors);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new visitor
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { name, firstName, company, contact, additionalVisitors = [] } = req.body;
    
    // Get next visitor number
    const counterResult = await client.query('SELECT value FROM counters WHERE name = $1', ['visitor_counter']);
    const visitorNumber = counterResult.rows[0].value;
    
    // Insert main visitor
    const visitorId = require('crypto').randomUUID();
    const insertVisitorQuery = `
      INSERT INTO visitors (id, name, first_name, company, contact, visitor_number, check_in_time, additional_visitor_count)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
      RETURNING *
    `;
    
    const visitorResult = await client.query(insertVisitorQuery, [
      visitorId, name, firstName, company, contact, visitorNumber, additionalVisitors.length
    ]);
    
    let currentVisitorNumber = visitorNumber;
    const addedAdditionalVisitors = [];
    
    // Insert additional visitors
    for (const additionalVisitor of additionalVisitors) {
      currentVisitorNumber++;
      const additionalVisitorId = require('crypto').randomUUID();
      
      const insertAdditionalQuery = `
        INSERT INTO additional_visitors (id, visitor_id, name, first_name, visitor_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const additionalResult = await client.query(insertAdditionalQuery, [
        additionalVisitorId, visitorId, additionalVisitor.name, additionalVisitor.firstName, currentVisitorNumber
      ]);
      
      addedAdditionalVisitors.push({
        id: additionalResult.rows[0].id,
        name: additionalResult.rows[0].name,
        firstName: additionalResult.rows[0].first_name,
        visitorNumber: additionalResult.rows[0].visitor_number
      });
    }
    
    // Update counter
    await client.query('UPDATE counters SET value = $1 WHERE name = $2', [currentVisitorNumber + 1, 'visitor_counter']);
    
    await client.query('COMMIT');
    
    const visitor = {
      id: visitorResult.rows[0].id,
      name: visitorResult.rows[0].name,
      firstName: visitorResult.rows[0].first_name,
      company: visitorResult.rows[0].company,
      contact: visitorResult.rows[0].contact,
      visitorNumber: visitorResult.rows[0].visitor_number,
      checkInTime: visitorResult.rows[0].check_in_time,
      checkOutTime: visitorResult.rows[0].check_out_time,
      additionalVisitorCount: visitorResult.rows[0].additional_visitor_count,
      notes: visitorResult.rows[0].notes,
      policyAccepted: visitorResult.rows[0].policy_accepted,
      signature: visitorResult.rows[0].signature,
      additionalVisitors: addedAdditionalVisitors
    };
    
    res.status(201).json(visitor);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating visitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Update visitor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updates).forEach(key => {
      if (key === 'firstName') {
        setClause.push(`first_name = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      } else if (key === 'checkInTime') {
        setClause.push(`check_in_time = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      } else if (key === 'checkOutTime') {
        setClause.push(`check_out_time = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      } else if (key === 'additionalVisitorCount') {
        setClause.push(`additional_visitor_count = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      } else if (key === 'policyAccepted') {
        setClause.push(`policy_accepted = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      } else {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });
    
    values.push(id);
    setClause.push(`updated_at = NOW()`);
    
    const query = `UPDATE visitors SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating visitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete visitor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM visitors WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    
    res.json({ message: 'Visitor deleted successfully' });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visitor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT v.*, 
             json_agg(
               json_build_object(
                 'id', av.id,
                 'name', av.name,
                 'firstName', av.first_name,
                 'visitorNumber', av.visitor_number
               ) ORDER BY av.visitor_number
             ) FILTER (WHERE av.id IS NOT NULL) as additional_visitors
      FROM visitors v
      LEFT JOIN additional_visitors av ON v.id = av.visitor_id
      WHERE v.id = $1
      GROUP BY v.id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    
    const visitor = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      firstName: result.rows[0].first_name,
      company: result.rows[0].company,
      contact: result.rows[0].contact,
      visitorNumber: result.rows[0].visitor_number,
      checkInTime: result.rows[0].check_in_time,
      checkOutTime: result.rows[0].check_out_time,
      additionalVisitorCount: result.rows[0].additional_visitor_count,
      notes: result.rows[0].notes,
      policyAccepted: result.rows[0].policy_accepted,
      signature: result.rows[0].signature,
      additionalVisitors: result.rows[0].additional_visitors || []
    };
    
    res.json(visitor);
  } catch (error) {
    console.error('Error fetching visitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
