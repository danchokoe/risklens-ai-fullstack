const express = require('express');
const Joi = require('joi');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schema
const riskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  impact: Joi.number().integer().min(1).max(5).required(),
  likelihood: Joi.number().integer().min(1).max(5).required(),
  owner: Joi.string().min(2).max(100).required(),
  status: Joi.string().valid('Open', 'Mitigated', 'Monitoring', 'Closed').default('Open'),
  category: Joi.string().max(100).allow(''),
  mitigation_strategy: Joi.string().max(1000).allow('')
});

// Get all risks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = req.db;
    const risks = await db.getAllRisks();
    res.json(risks);
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

// Create new risk
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = riskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const riskData = {
      ...value,
      created_by: req.user.userId
    };

    const result = await db.createRisk(riskData);
    
    // Fetch the created risk to return complete data
    const createdRisk = await db.get('SELECT * FROM risks WHERE id = ?', [result.id]);
    
    res.status(201).json(createdRisk);
  } catch (error) {
    console.error('Error creating risk:', error);
    res.status(500).json({ error: 'Failed to create risk' });
  }
});

// Update risk
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = riskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await db.updateRisk(id, value);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    // Fetch updated risk
    const updatedRisk = await db.get('SELECT * FROM risks WHERE id = ?', [id]);
    res.json(updatedRisk);
  } catch (error) {
    console.error('Error updating risk:', error);
    res.status(500).json({ error: 'Failed to update risk' });
  }
});

// Delete risk
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.deleteRisk(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    res.json({ message: 'Risk deleted successfully' });
  } catch (error) {
    console.error('Error deleting risk:', error);
    res.status(500).json({ error: 'Failed to delete risk' });
  }
});

// Get risk statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await db.all(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'Mitigated' THEN 1 ELSE 0 END) as mitigated,
        SUM(CASE WHEN status = 'Monitoring' THEN 1 ELSE 0 END) as monitoring,
        SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed,
        AVG(risk_score) as avg_risk_score,
        SUM(CASE WHEN risk_score >= 20 THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN risk_score >= 12 AND risk_score < 20 THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN risk_score >= 6 AND risk_score < 12 THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN risk_score < 6 THEN 1 ELSE 0 END) as low
      FROM risks
    `);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching risk statistics:', error);
    res.status(500).json({ error: 'Failed to fetch risk statistics' });
  }
});

module.exports = router;