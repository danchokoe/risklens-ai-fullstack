const express = require('express');
const axios = require('axios');
const Database = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Generic Ollama API call
const callOllama = async (prompt, model = DEFAULT_MODEL, expectJson = false) => {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model,
      prompt: expectJson ? `${prompt}\n\nPlease respond with valid JSON only.` : prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      }
    });

    return response.data.response || '';
  } catch (error) {
    console.error('Ollama API Error:', error);
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      throw new Error('Ollama is not running. Please start Ollama service first.');
    }
    throw new Error('Failed to connect to local AI model. Please check Ollama configuration.');
  }
};

// Log AI interactions
const logAiInteraction = async (userId, userName, module, action, prompt, response, model) => {
  try {
    await db.createAiAuditLog({
      user_id: userId,
      user_name: userName,
      module,
      action,
      prompt: prompt.substring(0, 500), // Truncate long prompts
      response: response.substring(0, 1000), // Truncate long responses
      model
    });
  } catch (error) {
    console.error('Error logging AI interaction:', error);
  }
};

// Risk analysis endpoint
router.post('/analyze-risk', authenticateToken, async (req, res) => {
  try {
    const { riskData } = req.body;
    const prompt = `Analyze the following risk data and provide 3 key insights for the Board: ${JSON.stringify(riskData)}. 
    
    IMPORTANT: Do NOT use markdown symbols like ###, ##, **, or * for formatting. Use plain text only. Use ALL CAPS for section headers. Use simple bullet points (•) for lists.`;
    
    const response = await callOllama(prompt);
    
    await logAiInteraction(
      req.user.userId,
      req.user.email,
      'Risk Register',
      'Strategic Insights',
      prompt,
      response,
      DEFAULT_MODEL
    );
    
    res.json({ analysis: response });
  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Board report generation
router.post('/generate-board-report', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `As an AI Risk Analyst, write a professional Board Executive Summary based on this GRC data: ${JSON.stringify(data)}. Use a formal, strategic tone. 
    
    IMPORTANT: Do NOT use markdown symbols like ###, ##, **, or * for formatting. Use plain text only. Use ALL CAPS for section headers. Use simple bullet points (•) for lists.`;
    
    const response = await callOllama(prompt);
    
    await logAiInteraction(
      req.user.userId,
      req.user.email,
      'Reporting',
      'Board Summary Generation',
      prompt,
      response,
      DEFAULT_MODEL
    );
    
    res.json({ report: response });
  } catch (error) {
    console.error('Board report generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Regulatory impact analysis
router.post('/analyze-regulatory-impact', authenticateToken, async (req, res) => {
  try {
    const { regulationName, summary } = req.body;
    const prompt = `Perform a high-level Regulatory Impact Assessment for "${regulationName}". Summary: ${summary}. 
    Identify: 
    1. Key Obligations
    2. Potential Business Risks
    3. Suggested Internal Control Updates.
    
    IMPORTANT: Do NOT use markdown symbols like ###, ##, **, or * for formatting. Use plain text only. Use ALL CAPS for section headers. Use simple bullet points (•) for lists.`;
    
    const response = await callOllama(prompt);
    
    await logAiInteraction(
      req.user.userId,
      req.user.email,
      'Regulatory Monitoring',
      'Impact Assessment',
      prompt,
      response,
      DEFAULT_MODEL
    );
    
    res.json({ analysis: response });
  } catch (error) {
    console.error('Regulatory impact analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get AI audit logs
router.get('/audit-logs', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await db.getAllAiAuditLogs(limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching AI audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch AI audit logs' });
  }
});

// Health check for AI service
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });
    const models = response.data.models || [];
    const modelExists = models.some(model => model.name.includes(DEFAULT_MODEL));
    
    res.json({
      status: 'OK',
      ollama_url: OLLAMA_BASE_URL,
      model: DEFAULT_MODEL,
      model_available: modelExists,
      available_models: models.map(m => m.name)
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      error: 'Ollama service unavailable',
      message: error.message
    });
  }
});

module.exports = router;