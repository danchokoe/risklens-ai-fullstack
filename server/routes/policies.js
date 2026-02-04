const express = require('express');
const Joi = require('joi');
const Database = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

const policySchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  type: Joi.string().valid('Policy', 'SOP').required(),
  category: Joi.string().min(2).max(100).required(),
  content: Joi.string().allow(''),
  compliance_score: Joi.number().integer().min(0).max(100).default(0),
  review_cycle: Joi.string().valid('6 Months', '1 Year', '2 Years', '3 Years').required(),
  status: Joi.string().valid('Active', 'Review Required', 'Outdated', 'Draft').default('Draft'),
  next_review_date: Joi.date().allow(null),
  version: Joi.string().default('1.0')
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const policies = await db.getAllPolicies();
    res.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = policySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const policyData = {
      ...value,
      approved_by: req.user.userId
    };

    const result = await db.createPolicy(policyData);
    const createdPolicy = await db.get('SELECT * FROM policies WHERE id = ?', [result.id]);
    
    res.status(201).json(createdPolicy);
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ error: 'Failed to create policy' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = policySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await db.updatePolicy(id, value);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    const updatedPolicy = await db.get('SELECT * FROM policies WHERE id = ?', [id]);
    res.json(updatedPolicy);
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
});

module.exports = router;