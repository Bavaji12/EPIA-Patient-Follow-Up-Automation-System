import axios from 'axios';

// Base API URL falls back to relative /api which Vite proxies to localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for consistent error unwrapping
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export const api = {
  // Patients
  getPatients: (params) => apiClient.get('/patients', { params }),
  getDueTodayPatients: () => apiClient.get('/patients/due-today'),
  getPatientById: (id) => apiClient.get(`/patients/${id}`),
  createPatient: (data) => apiClient.post('/patients', data),
  updatePatient: (id, data) => apiClient.put(`/patients/${id}`, data),
  completeFollowUp: (id) => apiClient.patch(`/patients/${id}/complete`),

  // AI Automation Drafts
  generateDrafts: (payload = {}) => apiClient.post('/automation/generate', payload),
  getDrafts: (params) => apiClient.get('/automation/drafts', { params }),
  getDraftById: (id) => apiClient.get(`/automation/drafts/${id}`),
  editDraft: (id, message) => apiClient.patch(`/automation/drafts/${id}`, { message }),
  approveDraft: (id) => apiClient.patch(`/automation/drafts/${id}/approve`),
  rejectDraft: (id, reason) => apiClient.patch(`/automation/drafts/${id}/reject`, { reason }),

  // Dashboard & System
  getDashboardStats: () => apiClient.get('/dashboard/stats'),
  getActivityLogs: (limit = 100) => apiClient.get('/activity-logs', { params: { limit } }),
  getSettings: () => apiClient.get('/settings'),
};

export default api;

