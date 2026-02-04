const express = require('express');
const Joi = require('joi');
const Database = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

const auditSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  severity: Joi.string().valid('Critical', 'High', 'Medium', 'Low').required(),
  department: Joi.string().min(2).max(100).required(),
  auditor: Joi.string().max(100).allow(''),
  due_date: Joi.date().allow(null),
  completion_status: Joi.number().integer().min(0).max(100).default(0),
  status: Joi.string().valid('Open', 'In Progress', 'Completed', 'Overdue').default('Open'),
  findings: Joi.string().allow(''),
  management_response: Joi.string().allow('')
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const audits = await db.getAllAudits();
    res.json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({ error: 'Failed to fetch audits' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = auditSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await db.createAudit(value);
    const createdAudit = await db.get('SELECT * FROM audits WHERE id = ?', [result.id]);
    
    res.status(201).json(createdAudit);
  } catch (error) {
    console.error('Error creating audit:', error);
    res.status(500).json({ error: 'Failed to create audit' });
  }
});

module.exports = router;