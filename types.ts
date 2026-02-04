
export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type DocStatus = 'Draft' | 'Awaiting Approval' | 'Approved' | 'In Review' | 'Archived';
export type AssetStatus = 'Active' | 'Maintenance' | 'Retired' | 'Risk Flagged';
export type UserRole = 'CRO' | 'Risk Manager' | 'Internal Auditor' | 'Compliance Officer' | 'Board Member' | 'System Admin';
export type ReviewCycle = '6 Months' | '1 Year' | '2 Years' | '3 Years';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  lastLogin: string;
  status: 'Active' | 'Deactivated';
}

export interface QueuedEmail {
  id: string;
  recipient: string;
  subject: string;
  content: string;
  type: 'Enrollment' | 'Status Change' | 'Role Modification';
  timestamp: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  impact: number; // 1-5 (Inherent)
  likelihood: number; // 1-5 (Inherent)
  status: 'Open' | 'Mitigated' | 'Monitoring';
  owner: string;
  lastUpdated: string;
  // Extended Enterprise Fields
  category?: 'Operational' | 'Financial' | 'Strategic' | 'Compliance' | 'Reputational' | 'Cyber/IT';
  rootCause?: string;
  consequences?: string;
  dateIdentified?: string;
  existingControls?: string;
  controlEffectiveness?: 'Satisfactory' | 'Needs Improvement' | 'Weak' | 'None';
  residualImpact?: number;
  residualLikelihood?: number;
  treatmentStrategy?: 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';
}

export interface Policy {
  id: string;
  name: string;
  type: 'Policy' | 'SOP';
  category: string;
  lastReviewDate: string;
  nextReviewDate: string;
  reviewCycle: ReviewCycle;
  complianceScore: number;
  status: 'Active' | 'Review Required' | 'Outdated';
}

export interface AuditFinding {
  id: string;
  title: string;
  severity: RiskLevel;
  department: string;
  dueDate: string;
  completionStatus: number;
}

export interface Clause {
  id: string;
  reference: string;
  text: string;
  linkedControlId?: string;
  linkedControlName?: string;
  status: 'Compliant' | 'Partial' | 'Non-Compliant' | 'Unmapped';
}

export interface RegulatoryUpdate {
  id: string;
  regulation: string;
  summary: string;
  impact: 'Critical' | 'Major' | 'Minor';
  date: string;
  clauses?: Clause[];
  complianceScore?: number;
}

export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  priority: RiskLevel;
  dueDate: string;
  daysPending: number;
  complexity: 'Low' | 'Medium' | 'High';
  historicalSLA?: number; // % success rate for similar tasks
}

export interface ApprovalStep {
  id: string;
  approverName: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp?: string;
}

export interface Signature {
  id: string;
  signerName: string;
  signerRole: string;
  timestamp: string;
  hash: string;
}

export interface ManagedDocument {
  id: string;
  title: string;
  content: string;
  status: DocStatus;
  version: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  reviewCycle: ReviewCycle;
  nextReviewDate: string;
  approvals: ApprovalStep[];
  signatures: Signature[];
}

export interface DigitalAsset {
  id: string;
  name: string;
  manufacturer: string;
  serialNumber: string;
  type: 'Server' | 'Workstation' | 'Laptop' | 'Network' | 'Cloud Instance' | 'Mobile Device' | 'Other';
  status: AssetStatus;
  responsibleTeam: string;
  responsibleManager: string;
  owner: string;
  location: string;
  purchaseDate: string;
  warrantyExpiration: string;
  value: number; // In ZAR
  riskLevel: RiskLevel;
  specifications?: string;
  healthScore?: number; // AI-driven score 0-100
}

export interface Vulnerability {
  id: string;
  assetId: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cveId?: string;
  status: 'Open' | 'In Progress' | 'Patched' | 'Risk Accepted';
  discoveredAt: string;
}

export interface Incident {
  id: string;
  title: string;
  type: 'Cyber' | 'Operational' | 'Media' | 'Legal' | 'Financial';
  severity: RiskLevel;
  status: 'Reported' | 'Investigating' | 'Contained' | 'Resolved' | 'Closed';
  reporter: string;
  timestamp: string;
  description: string;
  remediationPlan?: string;
}

export interface AiAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  module: string;
  action: string;
  prompt: string;
  response: string;
  model: string;
}

// Fixed missing Notification export
export interface Notification {
  id: string | number;
  title: string;
  description: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  time: string;
}
