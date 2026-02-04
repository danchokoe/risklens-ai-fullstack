const express = require('express');
const Joi = require('joi');
const Database = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

const incidentSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  severity: Joi.string().valid('Critical', 'High', 'Medium', 'Low').required(),
  category: Joi.string().max(100).allow(''),
  status: Joi.string().valid('Open', 'Investigating', 'Resolved', 'Closed').default('Open'),
  reported_by: Joi.string().max(100).allow(''),
  assigned_to: Joi.string().max(100).allow(''),
  impact_assessment: Joi.string().allow(''),
  resolution_notes: Joi.string().allow(''),
  occurred_at: Joi.date().allow(null)
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const incidents = await db.getAllIncidents();
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = incidentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await db.createIncident(value);
    const createdIncident = await db.get('SELECT * FROM incidents WHERE id = ?', [result.id]);
    
    res.status(201).json(createdIncident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

module.exports = router;