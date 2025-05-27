
const express = require('express');
const pool = require('../database/connection');
const router = express.Router();

// Export all data
router.get('/all', async (req, res) => {
  try {
    // Get all visitors with additional visitors
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
      ORDER BY v.visitor_number
    `;
    
    const visitorsResult = await pool.query(visitorsQuery);
    
    const visitors = visitorsResult.rows.map(row => ({
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
    
    // Get all settings
    const settingsResult = await pool.query('SELECT * FROM settings');
    const settings = {};
    settingsResult.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    // Get counter
    const counterResult = await pool.query('SELECT value FROM counters WHERE name = $1', ['visitor_counter']);
    const visitorCounter = counterResult.rows[0]?.value || 100;
    
    const exportData = {
      visitors,
      settings,
      visitorCounter,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="visitor-export-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import data
router.post('/import', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { visitors = [], settings = {}, visitorCounter } = req.body;
    
    // Clear existing data
    await client.query('DELETE FROM additional_visitors');
    await client.query('DELETE FROM visitors');
    await client.query('DELETE FROM settings');
    
    // Import visitors
    for (const visitor of visitors) {
      const insertVisitorQuery = `
        INSERT INTO visitors (id, name, first_name, company, contact, visitor_number, check_in_time, check_out_time, additional_visitor_count, notes, policy_accepted, signature)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;
      
      await client.query(insertVisitorQuery, [
        visitor.id,
        visitor.name,
        visitor.firstName,
        visitor.company,
        visitor.contact,
        visitor.visitorNumber,
        visitor.checkInTime,
        visitor.checkOutTime,
        visitor.additionalVisitorCount,
        visitor.notes,
        visitor.policyAccepted,
        visitor.signature
      ]);
      
      // Import additional visitors
      if (visitor.additionalVisitors) {
        for (const additionalVisitor of visitor.additionalVisitors) {
          const insertAdditionalQuery = `
            INSERT INTO additional_visitors (id, visitor_id, name, first_name, visitor_number)
            VALUES ($1, $2, $3, $4, $5)
          `;
          
          await client.query(insertAdditionalQuery, [
            additionalVisitor.id,
            visitor.id,
            additionalVisitor.name,
            additionalVisitor.firstName,
            additionalVisitor.visitorNumber
          ]);
        }
      }
    }
    
    // Import settings
    for (const [key, value] of Object.entries(settings)) {
      const insertSettingQuery = `
        INSERT INTO settings (key, value, category)
        VALUES ($1, $2, $3)
      `;
      
      await client.query(insertSettingQuery, [key, JSON.stringify(value), 'general']);
    }
    
    // Update visitor counter
    if (visitorCounter) {
      await client.query('UPDATE counters SET value = $1 WHERE name = $2', [visitorCounter, 'visitor_counter']);
    }
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Data imported successfully',
      visitorsImported: visitors.length,
      settingsImported: Object.keys(settings).length
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
