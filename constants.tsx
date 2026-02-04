
import { Risk, Policy, AuditFinding, RegulatoryUpdate, ActionItem, ManagedDocument, DigitalAsset, User, Vulnerability, Incident } from './types';

export const MOCK_USERS: User[] = [
  { id: 'U-000', name: 'Admin Root', email: 'admin@risklens.ai', role: 'System Admin', lastLogin: '2024-03-18 10:00', status: 'Active' },
  { id: 'U-001', name: 'Jane Doe', email: 'jane.doe@risklens.ai', role: 'CRO', lastLogin: '2024-03-18 08:30', status: 'Active' },
  { id: 'U-002', name: 'Sibusiso Gumede', email: 'sbu.gumede@risklens.ai', role: 'Risk Manager', lastLogin: '2024-03-18 09:15', status: 'Active' },
  { id: 'U-003', name: 'Sarah Smith', email: 'sarah.smith@risklens.ai', role: 'Internal Auditor', lastLogin: '2024-03-17 14:45', status: 'Active' },
  { id: 'U-004', name: 'Khotso Motaung', email: 'khotso.m@risklens.ai', role: 'Compliance Officer', lastLogin: '2024-03-18 07:20', status: 'Active' },
  { id: 'U-005', name: 'Zolani Mkonto', email: 'zolani.m@risklens.ai', role: 'Board Member', lastLogin: '2024-03-15 16:00', status: 'Active' },
];

export const MOCK_RISKS: Risk[] = [
  // QCTO Specific Risks
  { 
    id: 'R-QCTO-01', 
    title: 'Certification Backlog & Data Integrity', 
    description: 'Delays in issuing trade certificates due to data mismatches between SDPs and the National Learners\' Records Database (NLRD). Impact on NQF mandate.', 
    impact: 5, 
    likelihood: 4, 
    status: 'Open', 
    owner: 'Chief Director: Certification', 
    lastUpdated: '2024-03-15',
    category: 'Operational',
    rootCause: 'Legacy IT systems at SDP level failing to sync learner achievements in real-time.',
    consequences: 'Reputational damage, student unemployability, and potential litigation.',
    controlEffectiveness: 'Needs Improvement',
    residualImpact: 4,
    residualLikelihood: 3,
    treatmentStrategy: 'Mitigate'
  },
  { 
    id: 'R-QCTO-02', 
    title: 'PFMA Non-Compliance in Procurement', 
    description: 'Risk of irregular expenditure due to deviations from Supply Chain Management (SCM) processes during emergency procurement cycles.', 
    impact: 5, 
    likelihood: 3, 
    status: 'Monitoring', 
    owner: 'CFO', 
    lastUpdated: '2024-03-10',
    category: 'Financial',
    rootCause: 'Lack of automated segregation of duties in the current ERP system.',
    consequences: 'Qualified Audit Opinion from AGSA, financial penalties, and leadership censure.',
    controlEffectiveness: 'Satisfactory',
    residualImpact: 3,
    residualLikelihood: 2,
    treatmentStrategy: 'Mitigate'
  },
  { 
    id: 'R-QCTO-03', 
    title: 'AQP Capacity Failure', 
    description: 'Assessment Quality Partners (AQPs) failing to uphold moderation standards for new occupational qualifications.', 
    impact: 4, 
    likelihood: 3, 
    status: 'Open', 
    owner: 'Director: Quality Assurance', 
    lastUpdated: '2024-03-12',
    category: 'Strategic',
    rootCause: 'Funding constraints limiting AQP site visits and moderator training.',
    consequences: 'De-accreditation of qualifications and loss of industry trust.',
    controlEffectiveness: 'Weak',
    residualImpact: 4,
    residualLikelihood: 3,
    treatmentStrategy: 'Transfer'
  },
  { 
    id: 'R-QCTO-04', 
    title: 'Cybersecurity of Learner Data (POPIA)', 
    description: 'Unauthorized access to the certification registry containing PII of millions of learners.', 
    impact: 5, 
    likelihood: 2, 
    status: 'Mitigated', 
    owner: 'CIO', 
    lastUpdated: '2024-02-28',
    category: 'Cyber/IT',
    rootCause: 'Outdated firewall configurations on the NLRD interface node.',
    consequences: 'Information Regulator fines (up to R10m) and massive reputational loss.',
    controlEffectiveness: 'Satisfactory',
    residualImpact: 2,
    residualLikelihood: 1,
    treatmentStrategy: 'Avoid'
  },
];

export const MOCK_POLICIES: Policy[] = [
  // 🏛️ 1. QCTO Governance (PFMA & NQF)
  { 
    id: 'POL-QCTO-01', 
    name: 'Supply Chain Management (SCM) Policy', 
    type: 'Policy', 
    category: 'Finance (PFMA)', 
    lastReviewDate: '2024-01-15', 
    nextReviewDate: '2025-01-15', 
    reviewCycle: '1 Year', 
    complianceScore: 98, 
    status: 'Active' 
  },
  { 
    id: 'POL-QCTO-02', 
    name: 'Irregular, Fruitless & Wasteful Expenditure Framework', 
    type: 'Policy', 
    category: 'Finance (PFMA)', 
    lastReviewDate: '2023-11-01', 
    nextReviewDate: '2024-11-01', 
    reviewCycle: '1 Year', 
    complianceScore: 100, 
    status: 'Active' 
  },
  { 
    id: 'POL-NQF-01', 
    name: 'Accreditation of Skills Development Providers (SDPs)', 
    type: 'Policy', 
    category: 'Occupational Quality (NQF)', 
    lastReviewDate: '2023-06-15', 
    nextReviewDate: '2025-06-15', 
    reviewCycle: '2 Years', 
    complianceScore: 92, 
    status: 'Active' 
  },
  { 
    id: 'POL-NQF-02', 
    name: 'Certification & Qualification Issuance Policy', 
    type: 'Policy', 
    category: 'Occupational Quality (NQF)', 
    lastReviewDate: '2024-02-01', 
    nextReviewDate: '2025-02-01', 
    reviewCycle: '1 Year', 
    complianceScore: 85, 
    status: 'Active' 
  },
  { 
    id: 'SOP-NQF-01', 
    name: 'Assessment Quality Partner (AQP) Monitoring Procedure', 
    type: 'SOP', 
    category: 'Occupational Quality (NQF)', 
    lastReviewDate: '2024-03-01', 
    nextReviewDate: '2024-09-01', 
    reviewCycle: '6 Months', 
    complianceScore: 78, 
    status: 'Active' 
  },

  // 🛡️ 2. Enterprise Risk Management
  { id: 'POL-RM-01', name: 'Enterprise Risk Management (ERM)', type: 'Policy', category: 'Risk', lastReviewDate: '2024-03-01', nextReviewDate: '2025-03-01', reviewCycle: '1 Year', complianceScore: 94, status: 'Active' },
  
  // ⚖️ 3. Legal, Compliance & Regulatory
  { id: 'POL-LCR-01', name: 'Protection of Personal Information (POPIA)', type: 'Policy', category: 'Legal & Compliance', lastReviewDate: '2023-11-20', nextReviewDate: '2024-11-20', reviewCycle: '1 Year', complianceScore: 92, status: 'Active' },
  
  // 💻 5. IT, Cybersecurity & Digital
  { id: 'POL-IT-01', name: 'Information Security Policy', type: 'Policy', category: 'IT & Digital', lastReviewDate: '2023-11-20', nextReviewDate: '2024-11-20', reviewCycle: '1 Year', complianceScore: 92, status: 'Active' },
];

export const MOCK_DOCUMENTS: ManagedDocument[] = [
  {
    id: 'DOC-001',
    title: 'Code of Conduct 2024',
    content: 'Enterprise professional standards for all employees...',
    status: 'Approved',
    version: '2.1',
    owner: 'HR Director',
    createdAt: '2024-01-10',
    updatedAt: '2024-02-15',
    reviewCycle: '1 Year',
    nextReviewDate: '2025-01-10',
    approvals: [
      { id: 'app-1', approverName: 'Jane Doe', role: 'CRO', status: 'Approved', timestamp: '2024-02-14' }
    ],
    signatures: [
      { id: 'sig-1', signerName: 'Jane Doe', signerRole: 'Chief Risk Officer', timestamp: '2024-02-14 09:30', hash: 'sha256:7f8e...' }
    ]
  },
  {
    id: 'DOC-002',
    title: 'Cloud Security Standard',
    content: 'Technical guidelines for banking AWS/Azure environments...',
    status: 'Awaiting Approval',
    version: '1.0',
    owner: 'CISO',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-05',
    reviewCycle: '1 Year',
    nextReviewDate: '2025-03-01',
    approvals: [
      { id: 'app-2', approverName: 'Jane Doe', role: 'CRO', status: 'Pending' }
    ],
    signatures: []
  },
];

export const MOCK_ASSETS: DigitalAsset[] = [
  { 
    id: 'AST-001', 
    name: 'NLRD Database Cluster', 
    manufacturer: 'IBM',
    serialNumber: 'IBM-QCTO-9921',
    type: 'Server', 
    status: 'Active', 
    responsibleTeam: 'Database Ops',
    responsibleManager: 'Sibusiso Gumede',
    owner: 'Infrastructure Lead', 
    location: 'DC-Pretoria-1', 
    purchaseDate: '2022-05-20', 
    warrantyExpiration: '2025-05-20',
    value: 12350000, 
    riskLevel: 'Medium', 
    specifications: 'Z/Architecture node, 256GB RAM, Hosting Certification Records' 
  },
  { 
    id: 'AST-003', 
    name: 'Legacy Certification Printer', 
    manufacturer: 'Xerox',
    serialNumber: 'XRX-SECURE-001',
    type: 'Other', 
    status: 'Risk Flagged', 
    responsibleTeam: 'Operations',
    responsibleManager: 'Peter Johnson',
    owner: 'Ops Manager', 
    location: 'HQ-Secure-Room', 
    purchaseDate: '2016-02-15', 
    warrantyExpiration: '2019-02-15',
    value: 5850000, 
    riskLevel: 'Critical', 
    specifications: 'EOL hardware, high MTBF, used for secure certificate printing' 
  },
];

export const MOCK_AUDITS: AuditFinding[] = [
  { id: 'A-22', title: 'Irregular Expenditure (Travel)', severity: 'High', department: 'Finance', dueDate: '2024-04-15', completionStatus: 25 },
  { id: 'A-23', title: 'SDP Accreditation Delays', severity: 'Medium', department: 'Quality Assurance', dueDate: '2024-05-01', completionStatus: 60 },
];

export const MOCK_REGULATIONS: RegulatoryUpdate[] = [
  { 
    id: 'REG-01', 
    regulation: 'Occupational Qualifications Sub-Framework (OQSF) Policy 2023', 
    summary: 'New directives regarding the realignment of legacy trades to the new QCTO format.', 
    impact: 'Critical', 
    date: '2024-03-12',
    complianceScore: 65,
    clauses: [
      { id: 'C1', reference: 'Section 4.1', text: 'All legacy qualifications must be de-activated by June 2024.', status: 'Non-Compliant' },
      { id: 'C2', reference: 'Section 5.2', text: 'Introduction of E-Assessment protocols for trade tests.', status: 'Unmapped' }
    ]
  },
  { 
    id: 'REG-02', 
    regulation: 'PFMA Instruction Note 3 of 2024', 
    summary: 'Updated cost containment measures for public entities.', 
    impact: 'Major', 
    date: '2024-03-05',
    complianceScore: 90,
    clauses: [
      { id: 'C4', reference: 'Standard 7.1', text: 'Restriction on catering expenses for internal meetings.', status: 'Compliant', linkedControlId: 'POL-QCTO-02', linkedControlName: 'Irregular Expenditure Framework' }
    ]
  },
  { 
    id: 'REG-03', 
    regulation: 'POPI Act Enforcement Notice 1/2024', 
    summary: 'Requirements for securing learner data in cloud environments.', 
    impact: 'Major', 
    date: '2024-03-18',
    complianceScore: 60,
    clauses: [
      { id: 'C5', reference: 'Section 19.1', text: 'Encryption of special personal information (learner results) at rest.', status: 'Partial' }
    ]
  },
];

export const MOCK_ACTIONS: ActionItem[] = [
  { id: 'ACT-01', task: 'Remediate SCM Policy Gaps', assignee: 'CFO', priority: 'Critical', dueDate: '2024-03-20', daysPending: 12, complexity: 'High', historicalSLA: 45 },
  { id: 'ACT-03', task: 'Clear Certification Backlog (2023)', assignee: 'Ops Director', priority: 'High', dueDate: '2024-03-15', daysPending: 22, complexity: 'Medium', historicalSLA: 85 },
];

export const MOCK_VULNERABILITIES: Vulnerability[] = [
  { id: 'VUL-001', assetId: 'AST-003', title: 'Printer Firmware Exploit', description: 'Vulnerability in legacy Xerox firmware allowing unauthorized reprint of certificates.', severity: 'Critical', cveId: 'CVE-2023-1122', status: 'Open', discoveredAt: '2024-03-10' },
];

export const MOCK_INCIDENTS: Incident[] = [
  { id: 'INC-001', title: 'NLRD Upload Failure', type: 'Operational', severity: 'High', status: 'Investigating', reporter: 'System Watchdog', timestamp: '2024-03-18 02:45', description: 'Batch processing for learner achievements failed due to schema mismatch with SAQA database.' },
];
