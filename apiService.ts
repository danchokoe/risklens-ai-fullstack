import axios from 'axios';
import { mockAuthAPI, mockDataAPI } from './mockBackend';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors and fallback to mock
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Check if backend is available
const isBackendAvailable = async () => {
  try {
    await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, { timeout: 3000 });
    return true;
  } catch (error) {
    console.warn('Backend not available, using mock data');
    return false;
  }
};

// Auth API with fallback
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.warn('Backend login failed, trying mock authentication');
      return await mockAuthAPI.login(email, password);
    }
  },
  
  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error('Registration not available in demo mode');
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      return await mockAuthAPI.getProfile();
    }
  }
};

// Risks API with fallback
export const risksAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/risks');
      return response.data;
    } catch (error) {
      return await mockDataAPI.risks.getAll();
    }
  },
  
  create: async (riskData: any) => {
    try {
      const response = await api.post('/risks', riskData);
      return response.data;
    } catch (error) {
      return await mockDataAPI.risks.create(riskData);
    }
  },
  
  update: async (id: number, riskData: any) => {
    try {
      const response = await api.put(`/risks/${id}`, riskData);
      return response.data;
    } catch (error) {
      return { id, ...riskData, updated_at: new Date().toISOString() };
    }
  },
  
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/risks/${id}`);
      return response.data;
    } catch (error) {
      return { message: 'Risk deleted (demo mode)' };
    }
  },
  
  getStats: async () => {
    try {
      const response = await api.get('/risks/stats');
      return response.data;
    } catch (error) {
      return {
        total: 2,
        open: 1,
        mitigated: 1,
        monitoring: 0,
        closed: 0,
        avg_risk_score: 11.5,
        critical: 1,
        high: 0,
        medium: 1,
        low: 0
      };
    }
  }
};

// Policies API with fallback
export const policiesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/policies');
      return response.data;
    } catch (error) {
      return [
        {
          id: 1,
          name: 'Information Security Policy',
          type: 'Policy',
          category: 'Security',
          compliance_score: 85,
          status: 'Active',
          created_at: new Date().toISOString()
        }
      ];
    }
  },
  
  create: async (policyData: any) => {
    try {
      const response = await api.post('/policies', policyData);
      return response.data;
    } catch (error) {
      return { id: Date.now(), ...policyData, created_at: new Date().toISOString() };
    }
  },
  
  update: async (id: number, policyData: any) => {
    try {
      const response = await api.put(`/policies/${id}`, policyData);
      return response.data;
    } catch (error) {
      return { id, ...policyData, updated_at: new Date().toISOString() };
    }
  }
};

// Assets API with fallback
export const assetsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/assets');
      return response.data;
    } catch (error) {
      return [
        {
          id: 1,
          name: 'Web Server 01',
          type: 'Server',
          risk_level: 'High',
          health_score: 85,
          status: 'Active',
          created_at: new Date().toISOString()
        }
      ];
    }
  },
  
  create: async (assetData: any) => {
    try {
      const response = await api.post('/assets', assetData);
      return response.data;
    } catch (error) {
      return { id: Date.now(), ...assetData, created_at: new Date().toISOString() };
    }
  },
  
  update: async (id: number, assetData: any) => {
    try {
      const response = await api.put(`/assets/${id}`, assetData);
      return response.data;
    } catch (error) {
      return { id, ...assetData, updated_at: new Date().toISOString() };
    }
  }
};

// Audits API with fallback
export const auditsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/audits');
      return response.data;
    } catch (error) {
      return [
        {
          id: 1,
          title: 'Annual Security Audit',
          severity: 'High',
          department: 'IT Security',
          completion_status: 65,
          status: 'In Progress',
          created_at: new Date().toISOString()
        }
      ];
    }
  },
  
  create: async (auditData: any) => {
    try {
      const response = await api.post('/audits', auditData);
      return response.data;
    } catch (error) {
      return { id: Date.now(), ...auditData, created_at: new Date().toISOString() };
    }
  }
};

// Incidents API with fallback
export const incidentsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/incidents');
      return response.data;
    } catch (error) {
      return [];
    }
  },
  
  create: async (incidentData: any) => {
    try {
      const response = await api.post('/incidents', incidentData);
      return response.data;
    } catch (error) {
      return { id: Date.now(), ...incidentData, created_at: new Date().toISOString() };
    }
  }
};

// Actions API with fallback
export const actionsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/actions');
      return response.data;
    } catch (error) {
      return [];
    }
  },
  
  create: async (actionData: any) => {
    try {
      const response = await api.post('/actions', actionData);
      return response.data;
    } catch (error) {
      return { id: Date.now(), ...actionData, created_at: new Date().toISOString() };
    }
  }
};

// Documents API with fallback
export const documentsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      return [];
    }
  },
  
  create: async (documentData: any) => {
    try {
      const response = await api.post('/documents', documentData);
      return response.data;
    } catch (error) {
      return { id: Date.now(), ...documentData, created_at: new Date().toISOString() };
    }
  }
};

// AI API with fallback
export const aiAPI = {
  analyzeRisk: async (riskData: any) => {
    try {
      const response = await api.post('/ai/analyze-risk', { riskData });
      return response.data;
    } catch (error) {
      return await mockDataAPI.ai.analyzeRisk(riskData);
    }
  },
  
  generateBoardReport: async (data: any) => {
    try {
      const response = await api.post('/ai/generate-board-report', { data });
      return response.data;
    } catch (error) {
      return {
        report: `EXECUTIVE BOARD SUMMARY

GOVERNANCE RISK & COMPLIANCE STATUS

RISK OVERVIEW: Current risk portfolio shows ${data.risks?.length || 0} active risks with mixed severity levels requiring board attention and strategic oversight.

COMPLIANCE POSTURE: Policy framework demonstrates strong foundation with ${data.policies?.length || 0} active policies maintaining organizational compliance standards.

OPERATIONAL METRICS: Asset management shows ${data.assets?.length || 0} critical assets under monitoring with health scores indicating stable operational status.

STRATEGIC RECOMMENDATIONS: Continue investment in risk mitigation programs, enhance policy review cycles, and maintain robust asset monitoring capabilities.

Note: This is a demo report. Full AI analysis available with backend deployment.`
      };
    }
  },
  
  analyzeRegulatoryImpact: async (regulationName: string, summary: string) => {
    try {
      const response = await api.post('/ai/analyze-regulatory-impact', { regulationName, summary });
      return response.data;
    } catch (error) {
      return {
        analysis: `REGULATORY IMPACT ASSESSMENT

REGULATION: ${regulationName}

KEY OBLIGATIONS:
• Compliance monitoring and reporting requirements
• Data protection and privacy controls implementation
• Regular audit and assessment procedures

POTENTIAL BUSINESS RISKS:
• Regulatory penalties for non-compliance
• Operational disruption during implementation
• Resource allocation for compliance activities

SUGGESTED INTERNAL CONTROL UPDATES:
• Establish compliance monitoring framework
• Implement regular training programs
• Create audit trail documentation systems

Note: This is a demo analysis. Full regulatory assessment available with backend deployment.`
      };
    }
  },
  
  getAuditLogs: async (limit = 100) => {
    try {
      const response = await api.get(`/ai/audit-logs?limit=${limit}`);
      return response.data;
    } catch (error) {
      return [
        {
          id: 1,
          module: 'Demo Mode',
          action: 'System Status',
          response: 'Running in demonstration mode',
          timestamp: new Date().toISOString(),
          user_name: 'System'
        }
      ];
    }
  },
  
  checkHealth: async () => {
    try {
      const response = await api.get('/ai/health');
      return response.data;
    } catch (error) {
      return await mockDataAPI.ai.checkHealth();
    }
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      return {
        status: 'DEMO_MODE',
        message: 'Backend not available - running in demo mode',
        timestamp: new Date().toISOString(),
        version: '1.0.0-demo'
      };
    }
  }
};

export default api;