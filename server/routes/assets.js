const express = require('express');
const Joi = require('joi');
const Database = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

const assetSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  manufacturer: Joi.string().max(100).allow(''),
  type: Joi.string().valid('Server', 'Workstation', 'Laptop', 'Network', 'Cloud Instance', 'Mobile Device', 'Other').required(),
  serial_number: Joi.string().max(100).allow(''),
  value: Joi.number().min(0).allow(null),
  risk_level: Joi.string().valid('Critical', 'High', 'Medium', 'Low').required(),
  responsible_team: Joi.string().max(100).allow(''),
  location: Joi.string().max(200).allow(''),
  purchase_date: Joi.date().allow(null),
  warranty_expiry: Joi.date().allow(null),
  health_score: Joi.number().integer().min(0).max(100).default(100),
  status: Joi.string().valid('Active', 'Maintenance', 'Retired', 'Disposed').default('Active')
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const assets = await db.getAllAssets();
    res.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = assetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await db.createAsset(value);
    const createdAsset = await db.get('SELECT * FROM assets WHERE id = ?', [result.id]);
    
    res.status(201).json(createdAsset);
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = assetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await db.updateAsset(id, value);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const updatedAsset = await db.get('SELECT * FROM assets WHERE id = ?', [id]);
    res.json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

module.exports = router;