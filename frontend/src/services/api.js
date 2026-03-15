import axios from 'axios'
import authApi from './authApi'

const DEFAULT_API_URL = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : 'https://ciphersqlstudio-1km8.onrender.com/api'

const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '')

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s timeout for query execution
})

// Request interceptor (add auth token)
api.interceptors.request.use(
  (config) => {
    const token = authApi.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      error.message = 'Cannot connect to server. Is the backend running on port 5000?'
    }
    return Promise.reject(error)
  }
)

// ── Assignments API ───────────────────────────────────────
export const assignmentsAPI = {
  getAll: (params = {}) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  deleteWorkspace: (workspaceId) => api.delete(`/assignments/workspace/${workspaceId}`),
}

// ── Query API ─────────────────────────────────────────────
export const queryAPI = {
  /** Run query and get basic results */
  execute: (query, workspaceId) =>
    api.post('/query/execute', { query, workspaceId }),

  /** Run query and validate against expected output */
  validate: (query, workspaceId, assignmentId) =>
    api.post('/query/validate', { query, workspaceId, assignmentId }),
}

// ── Hint API ──────────────────────────────────────────────
export const hintAPI = {
  generateHint: (assignmentId, userQuery = '') =>
    api.post('/hint/generate', { assignmentId, userQuery }),
}

// ── Progress API ──────────────────────────────────────────
export const progressAPI = {
  saveAttempt: (assignmentId, workspaceId, sqlQuery, isCompleted = false) =>
    api.post('/progress/attempt', { assignmentId, workspaceId, sqlQuery, isCompleted }),
  getProgress: () => api.get('/progress'),
  getAssignmentProgress: (assignmentId) => api.get(`/progress/assignment/${assignmentId}`),
}

// ── Health Check ──────────────────────────────────────────
export const healthAPI = {
  check: () => api.get('/health'),
}

export default api
