const Database = require('../database/database');

async function initializeDatabase() {
  console.log('🔄 Initializing RiskLens AI Database...');
  
  try {
    const db = new Database();
    
    // Database will be initialized automatically when Database class is instantiated
    console.log('✅ Database initialized successfully!');
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();