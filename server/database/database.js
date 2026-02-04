const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, 'risklens.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.initializeDatabase();
      }
    });
  }

  initializeDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    this.db.exec(schema, (err) => {
      if (err) {
        console.error('Error initializing database:', err.message);
      } else {
        console.log('Database schema initialized successfully');
      }
    });
  }

  // Generic query methods
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // User methods
  async createUser(userData) {
    const { name, email, password_hash, role, status = 'Active' } = userData;
    const sql = `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    return this.run(sql, [name, email, password_hash, role, status]);
  }

  async getUserByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    return this.get(sql, [email]);
  }

  async getUserById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    return this.get(sql, [id]);
  }

  async getAllUsers() {
    const sql = 'SELECT id, name, email, role, status, created_at FROM users ORDER BY name';
    return this.all(sql);
  }

  // Risk methods
  async createRisk(riskData) {
    const { title, description, impact, likelihood, owner, status = 'Open', category, mitigation_strategy, created_by } = riskData;
    const sql = `
      INSERT INTO risks (title, description, impact, likelihood, owner, status, category, mitigation_strategy, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [title, description, impact, likelihood, owner, status, category, mitigation_strategy, created_by]);
  }

  async getAllRisks() {
    const sql = 'SELECT * FROM risks ORDER BY risk_score DESC, created_at DESC';
    return this.all(sql);
  }

  async updateRisk(id, riskData) {
    const { title, description, impact, likelihood, owner, status, category, mitigation_strategy } = riskData;
    const sql = `
      UPDATE risks 
      SET title = ?, description = ?, impact = ?, likelihood = ?, owner = ?, status = ?, 
          category = ?, mitigation_strategy = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return this.run(sql, [title, description, impact, likelihood, owner, status, category, mitigation_strategy, id]);
  }

  async deleteRisk(id) {
    const sql = 'DELETE FROM risks WHERE id = ?';
    return this.run(sql, [id]);
  }

  // Policy methods
  async createPolicy(policyData) {
    const { name, type, category, content, compliance_score, review_cycle, status = 'Draft', next_review_date, version = '1.0', approved_by } = policyData;
    const sql = `
      INSERT INTO policies (name, type, category, content, compliance_score, review_cycle, status, next_review_date, version, approved_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [name, type, category, content, compliance_score, review_cycle, status, next_review_date, version, approved_by]);
  }

  async getAllPolicies() {
    const sql = 'SELECT * FROM policies ORDER BY name';
    return this.all(sql);
  }

  async updatePolicy(id, policyData) {
    const { name, type, category, content, compliance_score, review_cycle, status, next_review_date, version } = policyData;
    const sql = `
      UPDATE policies 
      SET name = ?, type = ?, category = ?, content = ?, compliance_score = ?, 
          review_cycle = ?, status = ?, next_review_date = ?, version = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return this.run(sql, [name, type, category, content, compliance_score, review_cycle, status, next_review_date, version, id]);
  }

  // Asset methods
  async createAsset(assetData) {
    const { name, manufacturer, type, serial_number, value, risk_level, responsible_team, location, purchase_date, warranty_expiry, health_score = 100, status = 'Active' } = assetData;
    const sql = `
      INSERT INTO assets (name, manufacturer, type, serial_number, value, risk_level, responsible_team, location, purchase_date, warranty_expiry, health_score, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [name, manufacturer, type, serial_number, value, risk_level, responsible_team, location, purchase_date, warranty_expiry, health_score, status]);
  }

  async getAllAssets() {
    const sql = 'SELECT * FROM assets ORDER BY name';
    return this.all(sql);
  }

  async updateAsset(id, assetData) {
    const { name, manufacturer, type, serial_number, value, risk_level, responsible_team, location, purchase_date, warranty_expiry, health_score, status } = assetData;
    const sql = `
      UPDATE assets 
      SET name = ?, manufacturer = ?, type = ?, serial_number = ?, value = ?, risk_level = ?, 
          responsible_team = ?, location = ?, purchase_date = ?, warranty_expiry = ?, 
          health_score = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return this.run(sql, [name, manufacturer, type, serial_number, value, risk_level, responsible_team, location, purchase_date, warranty_expiry, health_score, status, id]);
  }

  // Vulnerability methods
  async createVulnerability(vulnData) {
    const { title, description, severity, cvss_score, affected_assets, status = 'Open', discovered_date, remediation_deadline, remediation_notes } = vulnData;
    const sql = `
      INSERT INTO vulnerabilities (title, description, severity, cvss_score, affected_assets, status, discovered_date, remediation_deadline, remediation_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [title, description, severity, cvss_score, JSON.stringify(affected_assets), status, discovered_date, remediation_deadline, remediation_notes]);
  }

  async getAllVulnerabilities() {
    const sql = 'SELECT * FROM vulnerabilities ORDER BY severity DESC, discovered_date DESC';
    const rows = await this.all(sql);
    return rows.map(row => ({
      ...row,
      affected_assets: row.affected_assets ? JSON.parse(row.affected_assets) : []
    }));
  }

  // Audit methods
  async createAudit(auditData) {
    const { title, description, severity, department, auditor, due_date, completion_status = 0, status = 'Open', findings, management_response } = auditData;
    const sql = `
      INSERT INTO audits (title, description, severity, department, auditor, due_date, completion_status, status, findings, management_response)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [title, description, severity, department, auditor, due_date, completion_status, status, findings, management_response]);
  }

  async getAllAudits() {
    const sql = 'SELECT * FROM audits ORDER BY due_date ASC';
    return this.all(sql);
  }

  // Incident methods
  async createIncident(incidentData) {
    const { title, description, severity, category, status = 'Open', reported_by, assigned_to, impact_assessment, resolution_notes, occurred_at } = incidentData;
    const sql = `
      INSERT INTO incidents (title, description, severity, category, status, reported_by, assigned_to, impact_assessment, resolution_notes, occurred_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [title, description, severity, category, status, reported_by, assigned_to, impact_assessment, resolution_notes, occurred_at]);
  }

  async getAllIncidents() {
    const sql = 'SELECT * FROM incidents ORDER BY occurred_at DESC';
    return this.all(sql);
  }

  // Action methods
  async createAction(actionData) {
    const { title, description, assignee, due_date, priority = 'Medium', status = 'Open', completion_percentage = 0, category, related_risk_id, related_audit_id } = actionData;
    const sql = `
      INSERT INTO actions (title, description, assignee, due_date, priority, status, completion_percentage, category, related_risk_id, related_audit_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [title, description, assignee, due_date, priority, status, completion_percentage, category, related_risk_id, related_audit_id]);
  }

  async getAllActions() {
    const sql = 'SELECT * FROM actions ORDER BY due_date ASC';
    return this.all(sql);
  }

  // Document methods
  async createDocument(docData) {
    const { title, type, category, content, file_path, version = '1.0', status = 'Draft', review_cycle, next_review_date, owner_id, approved_by } = docData;
    const sql = `
      INSERT INTO documents (title, type, category, content, file_path, version, status, review_cycle, next_review_date, owner_id, approved_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [title, type, category, content, file_path, version, status, review_cycle, next_review_date, owner_id, approved_by]);
  }

  async getAllDocuments() {
    const sql = 'SELECT * FROM documents ORDER BY title';
    return this.all(sql);
  }

  // AI Audit Log methods
  async createAiAuditLog(logData) {
    const { user_id, user_name, module, action, prompt, response, model } = logData;
    const sql = `
      INSERT INTO ai_audit_logs (user_id, user_name, module, action, prompt, response, model)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [user_id, user_name, module, action, prompt, response, model]);
  }

  async getAllAiAuditLogs(limit = 100) {
    const sql = 'SELECT * FROM ai_audit_logs ORDER BY timestamp DESC LIMIT ?';
    return this.all(sql, [limit]);
  }

  // Close database connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

module.exports = Database;