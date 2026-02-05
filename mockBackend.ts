// Mock backend for AWS Amplify deployment
// This provides offline functionality when backend is not available

import { MOCK_USERS } from './constants';

// Mock authentication
export const mockAuthAPI = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check credentials
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // For demo purposes, accept any password for existing users
    // In production, you'd verify the actual password
    const validPasswords = ['admin123', 'password123'];
    if (!validPasswords.includes(password)) {
      throw new Error('Invalid credentials');
    }
    
    // Generate mock token
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email, role: user.role }));
    
    return {
      message: 'Login successful',
      token,
      user
    };
  },
  
  getProfile: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No token provided');
    }
    
    try {
      const decoded = JSON.parse(atob(token));
      const user = MOCK_USERS.find(u => u.id === decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};

// Mock data APIs
export const mockDataAPI = {
  risks: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 1,
          title: 'Data Breach Risk',
          description: 'Risk of unauthorized access to customer data',
          impact: 5,
          likelihood: 3,
          risk_score: 15,
          owner: 'IT Security Team',
          status: 'Open',
          category: 'Cybersecurity',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Regulatory Compliance Risk',
          description: 'Risk of non-compliance with GDPR regulations',
          impact: 4,
          likelihood: 2,
          risk_score: 8,
          owner: 'Compliance Team',
          status: 'Mitigated',
          category: 'Regulatory',
          created_at: new Date().toISOString()
        }
      ];
    },
    create: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id: Date.now(), ...data, created_at: new Date().toISOString() };
    }
  },
  
  ai: {
    analyzeRisk: async (riskData: any) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        analysis: `RISK ANALYSIS SUMMARY

KEY INSIGHTS FOR BOARD CONSIDERATION:

• IMPACT ASSESSMENT: The identified risk shows ${riskData.impact || 'moderate'} potential impact on business operations and could affect customer trust and regulatory standing.

• LIKELIHOOD EVALUATION: Based on current controls and threat landscape, the probability of occurrence is ${riskData.likelihood || 'medium'} requiring immediate attention from leadership.

• STRATEGIC RECOMMENDATIONS: Implement enhanced monitoring systems, conduct regular security assessments, and establish incident response protocols to mitigate potential business disruption.

Note: This is a demo analysis. In production, this would be powered by local AI processing for complete privacy and detailed risk assessment.`
      };
    },
    
    checkHealth: async () => {
      return {
        status: 'DEMO_MODE',
        message: 'Running in demo mode - AI features simulated',
        ollama_url: 'Not connected (demo mode)',
        model: 'Demo simulation',
        model_available: false
      };
    }
  }
};