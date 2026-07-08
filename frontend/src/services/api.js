/**
 * api.js  –  Axios API Layer
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export const authAPI = {
  register:       (data)            => api.post('/auth/register', data),
  login:          (data)            => api.post('/auth/login', data),
  getMe:          ()                => api.get('/auth/me'),
  googleLogin:    (credential)      => api.post('/auth/google-login', { credential }),
  updateMe:       (data)            => api.put('/auth/me', data),
  forgotPassword: (email)           => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (data)            => api.post('/auth/change-password', data),
};

export const resumeAPI = {
  getAll:      ()                  => api.get('/resume/'),
  getById:     (id)                => api.get(`/resume/${id}`),
  create:      (data)              => api.post('/resume/', data),
  update:      (id, data)          => api.put(`/resume/${id}`, data),
  delete:      (id)                => api.delete(`/resume/${id}`),
  getHistory:  (id)                => api.get(`/resume/${id}/history`),
  restore:     (id, snapshotId)    => api.post(`/resume/${id}/restore/${snapshotId}`),
  updateScore: (id, score)         => api.put(`/resume/${id}/score`, { ats_score: score }),
  toggleShare: (id, enable)        => api.post(`/resume/${id}/share`, { enable }),
  getPublic:   (token)             => api.get(`/resume/public/${token}`),
};

export const aiAPI = {
  generateResume:      (data) => api.post('/ai/generate', data),
  analyzeResume:       (data) => api.post('/ai/analyze', data),
  analyzeDetailed:     (data) => api.post('/ai/analyze-detailed', data),
  generateCoverLetter: (data) => api.post('/ai/cover-letter', data),
  improveSummary:      (data) => api.post('/ai/improve-summary', data),
  estimateSalary:      (data) => api.post('/ai/salary', data),
  analyzeSkillGap:     (data) => api.post('/ai/skill-gap', data),
  checkGrammar:        (data) => api.post('/ai/grammar-check', data),
  translateResume:     (data) => api.post('/ai/translate', data),
  emailCoverLetter:    (data) => api.post('/ai/email-cover-letter', data),
};

export const interviewAPI = {
  generateQuestions: (data) => api.post('/interview/generate', data),
  evaluateAnswer:    (data) => api.post('/interview/evaluate', data),
};

export const docxAPI = {
  generate: (resumeData) => api.post('/docx/generate', resumeData, { responseType: 'blob' }),
};

export const pdfAPI = {
  getUrl: (resumeId) => `${BASE_URL}/pdf/${resumeId}`,
};

export const jobAPI = {
  getAll:  ()          => api.get('/jobs/'),
  create:  (data)      => api.post('/jobs/', data),
  update:  (id, data)  => api.put(`/jobs/${id}`, data),
  delete:  (id)        => api.delete(`/jobs/${id}`),
};

export default api;
