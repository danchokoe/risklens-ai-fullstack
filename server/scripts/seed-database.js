const bcrypt = require('bcryptjs');
const Database = require('../database/database');

async function seedDatabase() {
  console.log('🌱 Seeding RiskLens AI Database...');
  
  try {
    const db = new Database();
    
    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await db.createUser({
      name: 'System Administrator',
      email: 'admin@risklens.ai',
      password_hash: adminPassword,
      role: 'System Admin',
      status: 'Active'
    });
    
    // Create sample users
    const users = [
      { name: 'John Smith', email: 'john.smith@company.com', role: 'CRO' },
      { name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'Risk Manager' },
      { name: 'Mike Chen', email: 'mike.chen@company.com', role: 'Compliance Officer' },
      { name: 'Lisa Brown', email: 'lisa.brown@company.com', role: 'Internal Auditor' }
    ];
    
    for (const user of users) {
      const password = await bcrypt.hash('password123', 12);
      await db.createUser({
        ...user,
        password_hash: password,
        status: 'Active'
      });
    }
    
    // Create sample risks
    const risks = [
      {
        title: 'Data Breach Risk',
        description: 'Risk of unauthorized access to customer data',
        impact: 5,
        likelihood: 3,
        owner: 'IT Security Team',
        status: 'Open',
        category: 'Cybersecurity',
        mitigation_strategy: 'Implement multi-factor authentication and encryption',
        created_by: 1
      },
      {
        title: 'Regulatory Compliance Risk',
        description: 'Risk of non-compliance with GDPR regulations',
        impact: 4,
        likelihood: 2,
        owner: 'Compliance Team',
        status: 'Mitigated',
        category: 'Regulatory',
        mitigation_strategy: 'Regular compliance audits and staff training',
        created_by: 1
      },
      {
        title: 'Operational Disruption',
        description: 'Risk of business interruption due to system failures',
        impact: 4,
        likelihood: 3,
        owner: 'Operations Team',
        status: 'Monitoring',
        category: 'Operational',
        mitigation_strategy: 'Implement redundant systems and disaster recovery plan',
        created_by: 1
      }
    ];
    
    for (const risk of risks) {
      await db.createRisk(risk);
    }
    
    // Create sample policies
    const policies = [
      {
        name: 'Information Security Policy',
        type: 'Policy',
        category: 'Security',
        content: 'This policy defines the security requirements for all information systems...',
        compliance_score: 85,
        review_cycle: '1 Year',
        status: 'Active',
        next_review_date: '2025-12-31',
        version: '2.1',
        approved_by: 1
      },
      {
        name: 'Data Protection SOP',
        type: 'SOP',
        category: 'Privacy',
        content: 'Standard operating procedure for handling personal data...',
        compliance_score: 92,
        review_cycle: '6 Months',
        status: 'Active',
        next_review_date: '2025-06-30',
        version: '1.3',
        approved_by: 1
      }
    ];
    
    for (const policy of policies) {
      await db.createPolicy(policy);
    }
    
    // Create sample assets
    const assets = [
      {
        name: 'Web Server 01',
        manufacturer: 'Dell',
        type: 'Server',
        serial_number: 'SRV001',
        value: 15000,
        risk_level: 'High',
        responsible_team: 'IT Infrastructure',
        location: 'Data Center A',
        purchase_date: '2023-01-15',
        warranty_expiry: '2026-01-15',
        health_score: 85,
        status: 'Active'
      },
      {
        name: 'Database Server',
        manufacturer: 'HP',
        type: 'Server',
        serial_number: 'DB001',
        value: 25000,
        risk_level: 'Critical',
        responsible_team: 'Database Team',
        location: 'Data Center A',
        purchase_date: '2022-06-01',
        warranty_expiry: '2025-06-01',
        health_score: 78,
        status: 'Active'
      }
    ];
    
    for (const asset of assets) {
      await db.createAsset(asset);
    }
    
    // Create sample vulnerabilities
    const vulnerabilities = [
      {
        title: 'CVE-2024-1234: Critical RCE in Web Framework',
        description: 'Remote code execution vulnerability in web application framework',
        severity: 'Critical',
        cvss_score: 9.8,
        affected_assets: [1],
        status: 'Open',
        discovered_date: '2024-01-15',
        remediation_deadline: '2024-02-15',
        remediation_notes: 'Patch available, scheduled for deployment'
      },
      {
        title: 'Weak Password Policy',
        description: 'Current password policy does not meet security standards',
        severity: 'Medium',
        cvss_score: 5.3,
        affected_assets: [1, 2],
        status: 'In Progress',
        discovered_date: '2024-01-10',
        remediation_deadline: '2024-03-01',
        remediation_notes: 'New policy being drafted'
      }
    ];
    
    for (const vuln of vulnerabilities) {
      await db.createVulnerability(vuln);
    }
    
    // Create sample audits
    const audits = [
      {
        title: 'Annual Security Audit',
        description: 'Comprehensive security assessment of all systems',
        severity: 'High',
        department: 'IT Security',
        auditor: 'External Auditor Inc.',
        due_date: '2024-12-31',
        completion_status: 65,
        status: 'In Progress',
        findings: 'Several security controls need improvement',
        management_response: 'Action plan developed to address findings'
      },
      {
        title: 'GDPR Compliance Review',
        description: 'Review of data protection practices',
        severity: 'Medium',
        department: 'Legal',
        auditor: 'Internal Audit Team',
        due_date: '2024-06-30',
        completion_status: 90,
        status: 'In Progress',
        findings: 'Minor gaps in data retention policies',
        management_response: 'Policies being updated'
      }
    ];
    
    for (const audit of audits) {
      await db.createAudit(audit);
    }
    
    console.log('✅ Database seeded successfully!');
    console.log('📊 Created:');
    console.log('   • 5 Users (admin@risklens.ai / admin123)');
    console.log('   • 3 Risks');
    console.log('   • 2 Policies');
    console.log('   • 2 Assets');
    console.log('   • 2 Vulnerabilities');
    console.log('   • 2 Audits');
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();