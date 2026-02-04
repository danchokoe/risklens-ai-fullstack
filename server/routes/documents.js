const express = require('express');
const Joi = require('joi');
const Database = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

const documentSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  type: Joi.string().valid('Policy', 'SOP', 'Report', 'Manual', 'Other').required(),
  category: Joi.string().max(100).allow(''),
  content: Joi.string().allow(''),
  file_path: Joi.string().max(500).allow(''),
  version: Joi.string().default('1.0'),
  status: Joi.string().valid('Draft', 'Review', 'Approved', 'Archived').default('Draft'),
  review_cycle: Joi.string().valid('6 Months', '1 Year', '2 Years', '3 Years').allow(null),
  next_review_date: Joi.date().allow(null)
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const documents = await db.getAllDocuments();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = documentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const documentData = {
      ...value,
      owner_id: req.user.userId,
      approved_by: req.user.userId
    };

    const result = await db.createDocument(documentData);
    const createdDocument = await db.get('SELECT * FROM documents WHERE id = ?', [result.id]);
    
    res.status(201).json(createdDocument);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

module.exports = router;