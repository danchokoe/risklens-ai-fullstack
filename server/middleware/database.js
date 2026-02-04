const Database = require('../database/database');

// Create a single database instance
let dbInstance = null;

const getDatabase = () => {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
};

// Middleware to attach database to request
const attachDatabase = (req, res, next) => {
  req.db = getDatabase();
  next();
};

module.exports = {
  getDatabase,
  attachDatabase
};