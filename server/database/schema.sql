-- RiskLens AI Database Schema
-- SQLite Database for GRC Platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('System Admin', 'CRO', 'Risk Manager', 'Compliance Officer', 'Internal Auditor', 'Board Member')),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Deactivated')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
    likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
    risk_score INTEGER GENERATED ALWAYS AS (impact * likelihood) STORED,
    owner TEXT NOT NULL,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Mitigated', 'Monitoring', 'Closed')),
    category TEXT,
    mitigation_strategy TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Policy', 'SOP')),
    category TEXT NOT NULL,
    content TEXT,
    compliance_score INTEGER DEFAULT 0 CHECK (compliance_score BETWEEN 0 AND 100),
    review_cycle TEXT NOT NULL CHECK (review_cycle IN ('6 Months', '1 Year', '2 Years', '3 Years')),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Review Required', 'Outdated', 'Draft')),
    next_review_date DATE,
    version TEXT DEFAULT '1.0',
    approved_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    manufacturer TEXT,
    type TEXT NOT NULL CHECK (type IN ('Server', 'Workstation', 'Laptop', 'Network', 'Cloud Instance', 'Mobile Device', 'Other')),
    serial_number TEXT,
    value DECIMAL(10,2),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('Critical', 'High', 'Medium', 'Low')),
    responsible_team TEXT,
    location TEXT,
    purchase_date DATE,
    warranty_expiry DATE,
    health_score INTEGER DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Retired', 'Disposed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    cvss_score DECIMAL(3,1) CHECK (cvss_score BETWEEN 0.0 AND 10.0),
    affected_assets TEXT, -- JSON array of asset IDs
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Accepted Risk')),
    discovered_date DATE DEFAULT (date('now')),
    remediation_deadline DATE,
    remediation_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audits table
CREATE TABLE IF NOT EXISTS audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    department TEXT NOT NULL,
    auditor TEXT,
    due_date DATE,
    completion_status INTEGER DEFAULT 0 CHECK (completion_status BETWEEN 0 AND 100),
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Overdue')),
    findings TEXT,
    management_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    category TEXT,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Investigating', 'Resolved', 'Closed')),
    reported_by TEXT,
    assigned_to TEXT,
    impact_assessment TEXT,
    resolution_notes TEXT,
    occurred_at DATETIME,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Actions table
CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    assignee TEXT NOT NULL,
    due_date DATE,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Overdue')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    category TEXT,
    related_risk_id INTEGER,
    related_audit_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (related_risk_id) REFERENCES risks(id),
    FOREIGN KEY (related_audit_id) REFERENCES audits(id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Policy', 'SOP', 'Report', 'Manual', 'Other')),
    category TEXT,
    content TEXT,
    file_path TEXT,
    version TEXT DEFAULT '1.0',
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Approved', 'Archived')),
    review_cycle TEXT CHECK (review_cycle IN ('6 Months', '1 Year', '2 Years', '3 Years')),
    next_review_date DATE,
    owner_id INTEGER,
    approved_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Regulations table
CREATE TABLE IF NOT EXISTS regulations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    jurisdiction TEXT,
    category TEXT,
    effective_date DATE,
    compliance_deadline DATE,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Proposed', 'Superseded')),
    impact_assessment TEXT,
    compliance_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Audit Logs table
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_name TEXT,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    prompt TEXT,
    response TEXT,
    model TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_owner ON risks(owner);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_assets_risk_level ON assets(risk_level);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);
CREATE INDEX IF NOT EXISTS idx_actions_assignee ON actions(assignee);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_timestamp ON ai_audit_logs(timestamp);