import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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

// Handle auth errors
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

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Risks API
export const risksAPI = {
  getAll: async () => {
    const response = await api.get('/risks');
    return response.data;
  },
  
  create: async (riskData: any) => {
    const response = await api.post('/risks', riskData);
    return response.data;
  },
  
  update: async (id: number, riskData: any) => {
    const response = await api.put(`/risks/${id}`, riskData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/risks/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/risks/stats');
    return response.data;
  }
};

// Policies API
export const policiesAPI = {
  getAll: async () => {
    const response = await api.get('/policies');
    return response.data;
  },
  
  create: async (policyData: any) => {
    const response = await api.post('/policies', policyData);
    return response.data;
  },
  
  update: async (id: number, policyData: any) => {
    const response = await api.put(`/policies/${id}`, policyData);
    return response.data;
  }
};

// Assets API
export const assetsAPI = {
  getAll: async () => {
    const response = await api.get('/assets');
    return response.data;
  },
  
  create: async (assetData: any) => {
    const response = await api.post('/assets', assetData);
    return response.data;
  },
  
  update: async (id: number, assetData: any) => {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data;
  }
};

// Audits API
export const auditsAPI = {
  getAll: async () => {
    const response = await api.get('/audits');
    return response.data;
  },
  
  create: async (auditData: any) => {
    const response = await api.post('/audits', auditData);
    return response.data;
  }
};

// Incidents API
export const incidentsAPI = {
  getAll: async () => {
    const response = await api.get('/incidents');
    return response.data;
  },
  
  create: async (incidentData: any) => {
    const response = await api.post('/incidents', incidentData);
    return response.data;
  }
};

// Actions API
export const actionsAPI = {
  getAll: async () => {
    const response = await api.get('/actions');
    return response.data;
  },
  
  create: async (actionData: any) => {
    const response = await api.post('/actions', actionData);
    return response.data;
  }
};

// Documents API
export const documentsAPI = {
  getAll: async () => {
    const response = await api.get('/documents');
    return response.data;
  },
  
  create: async (documentData: any) => {
    const response = await api.post('/documents', documentData);
    return response.data;
  }
};

// AI API
export const aiAPI = {
  analyzeRisk: async (riskData: any) => {
    const response = await api.post('/ai/analyze-risk', { riskData });
    return response.data;
  },
  
  generateBoardReport: async (data: any) => {
    const response = await api.post('/ai/generate-board-report', { data });
    return response.data;
  },
  
  analyzeRegulatoryImpact: async (regulationName: string, summary: string) => {
    const response = await api.post('/ai/analyze-regulatory-impact', { regulationName, summary });
    return response.data;
  },
  
  getAuditLogs: async (limit = 100) => {
    const response = await api.get(`/ai/audit-logs?limit=${limit}`);
    return response.data;
  },
  
  checkHealth: async () => {
    const response = await api.get('/ai/health');
    return response.data;
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;