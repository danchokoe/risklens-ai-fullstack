#!/usr/bin/env node

import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.2';

async function checkOllamaHealth() {
  console.log('🔍 Checking Local AI Health...\n');
  
  try {
    // Check if Ollama is running
    console.log('1. Checking Ollama service...');
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    console.log('   ✅ Ollama is running');
    
    // Check if model is available
    console.log('2. Checking model availability...');
    const models = response.data.models || [];
    const modelExists = models.some(model => model.name.includes(MODEL_NAME));
    
    if (modelExists) {
      console.log(`   ✅ Model '${MODEL_NAME}' is available`);
    } else {
      console.log(`   ❌ Model '${MODEL_NAME}' not found`);
      console.log('   Available models:', models.map(m => m.name).join(', '));
      console.log(`   Run: ollama pull ${MODEL_NAME}`);
      return false;
    }
    
    // Test a simple generation
    console.log('3. Testing AI generation...');
    const testResponse = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL_NAME,
      prompt: 'Say "AI is working" in exactly 3 words.',
      stream: false,
      options: { temperature: 0.1 }
    }, { timeout: 30000 });
    
    if (testResponse.data && testResponse.data.response) {
      console.log('   ✅ AI generation successful');
      console.log(`   Response: "${testResponse.data.response.trim()}"`);
    } else {
      console.log('   ❌ AI generation failed');
      return false;
    }
    
    console.log('\n🎉 All systems operational!');
    console.log(`📊 Configuration:`);
    console.log(`   • Ollama URL: ${OLLAMA_URL}`);
    console.log(`   • Model: ${MODEL_NAME}`);
    console.log(`   • Available models: ${models.length}`);
    
    return true;
    
  } catch (error) {
    console.log('   ❌ Health check failed');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🚨 Ollama is not running!');
      console.log('   Start it with: ollama serve');
    } else if (error.response?.status === 404) {
      console.log('\n🚨 Model not found!');
      console.log(`   Pull it with: ollama pull ${MODEL_NAME}`);
    } else {
      console.log('\n🚨 Unexpected error:', error.message);
    }
    
    console.log('\n📖 See setup-local-ai.md for detailed instructions');
    return false;
  }
}

// Run the health check
checkOllamaHealth().then(success => {
  process.exit(success ? 0 : 1);
});