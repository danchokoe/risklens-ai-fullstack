const express = require('express');
const Joi = require('joi');
const Database = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

const actionSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  assignee: Joi.string().min(2).max(100).required(),
  due_date: Joi.date().allow(null),
  priority: Joi.string().valid('Critical', 'High', 'Medium', 'Low').default('Medium'),
  status: Joi.string().valid('Open', 'In Progress', 'Completed', 'Overdue').default('Open'),
  completion_percentage: Joi.number().integer().min(0).max(100).default(0),
  category: Joi.string().max(100).allow(''),
  related_risk_id: Joi.number().integer().allow(null),
  related_audit_id: Joi.number().integer().allow(null)
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const actions = await db.getAllActions();
    res.json(actions);
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = actionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await db.createAction(value);
    const createdAction = await db.get('SELECT * FROM actions WHERE id = ?', [result.id]);
    
    res.status(201).json(createdAction);
  } catch (error) {
    console.error('Error creating action:', error);
    res.status(500).json({ error: 'Failed to create action' });
  }
});

module.exports = router;