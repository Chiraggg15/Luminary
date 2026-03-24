/**
 * api.js  –  Axios API Layer
 * --------------------------
 * Centralized HTTP client:
 *  - Automatically attaches JWT Bearer token to every request
 *  - Handles 401 by redirecting to /login
 *  - Exports typed helper functions for each endpoint group
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Create Axios Instance ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 second timeout
});

// ── Request Interceptor: Attach JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: Handle Auth Errors ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// ═══════════════════════════════════════════════════════════════════════════
// Auth API Calls
// ═══════════════════════════════════════════════════════════════════════════
export const authAPI = {
  /** Register a new user */
  register: (data) => api.post('/auth/register', data),

  /** Login and receive JWT */
  login: (data) => api.post('/auth/login', data),

  /** Get current user profile */
  getMe: () => api.get('/auth/me'),

  /** Update user profile */
  updateMe: (data) => api.put('/auth/me', data),
};


// ═══════════════════════════════════════════════════════════════════════════
// Resume API Calls
// ═══════════════════════════════════════════════════════════════════════════
export const resumeAPI = {
  /** Get all resumes for current user */
  getAll: () => api.get('/resume/'),

  /** Get single resume by ID */
  getById: (id) => api.get(`/resume/${id}`),

  /** Create a new resume */
  create: (data) => api.post('/resume/', data),

  /** Update an existing resume */
  update: (id, data) => api.put(`/resume/${id}`, data),

  /** Delete a resume */
  delete: (id) => api.delete(`/resume/${id}`),
};


// ═══════════════════════════════════════════════════════════════════════════
// AI API Calls
// ═══════════════════════════════════════════════════════════════════════════
export const aiAPI = {
  /** Generate resume content from inputs */
  generateResume: (data) => api.post('/ai/generate', data),

  /** Analyze resume against a job description */
  analyzeResume: (data) => api.post('/ai/analyze', data),

  /** Generate a tailored cover letter */
  generateCoverLetter: (data) => api.post('/ai/cover-letter', data),

  /** Improve a professional summary */
  improveSummary: (data) => api.post('/ai/improve-summary', data),
};

// ═══════════════════════════════════════════════════════════════════════════
// Interview API Calls
// ═══════════════════════════════════════════════════════════════════════════
export const interviewAPI = {
  /** Generate mock interview questions */
  generateQuestions: (data) => api.post('/interview/generate', data),
};

export default api;
