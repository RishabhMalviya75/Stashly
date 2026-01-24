/**
 * API Service
 * ===========
 * Axios instance configured for our backend API.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. AXIOS INSTANCE: Instead of configuring every request,
 *    we create an instance with default settings.
 * 
 * 2. CREDENTIALS: 'withCredentials: true' ensures cookies
 *    are sent with requests (needed for sessions).
 * 
 * 3. INTERCEPTORS: Middleware for requests/responses.
 *    Great for handling auth errors globally.
 */

import axios from 'axios';

// Determine API base URL
// In production: use VITE_API_URL environment variable
// In development: use '/api' which Vite proxies to localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with defaults
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important: Send cookies with requests!
});

// Response interceptor for global error handling
api.interceptors.response.use(
    // Success: just return the response
    (response) => response,

    // Error: handle specific status codes
    (error) => {
        const message = error.response?.data?.message || 'An error occurred';

        // Handle 401 Unauthorized globally
        if (error.response?.status === 401) {
            // Could dispatch a logout action here
            // For now, we'll let the component handle it
        }

        // Attach a user-friendly message
        error.userMessage = message;

        return Promise.reject(error);
    }
);

// =====================
// Auth API Functions
// =====================

export const authAPI = {
    // Register new user
    register: (data) => api.post('/auth/register', data),

    // Login user
    login: (data) => api.post('/auth/login', data),

    // Logout current user
    logout: () => api.post('/auth/logout'),

    // Get current user
    getCurrentUser: () => api.get('/auth/me'),

    // Request password reset
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

    // Verify 6-digit reset code
    verifyResetCode: (email, code) => api.post('/auth/verify-reset-code', { email, code }),

    // Reset password with email, code, and new password
    resetPassword: (email, code, password) =>
        api.post('/auth/reset-password', { email, code, password }),
};

// =====================
// Folder API Functions (for later)
// =====================

export const folderAPI = {
    getAll: () => api.get('/folders'),
    create: (data) => api.post('/folders', data),
    update: (id, data) => api.put(`/folders/${id}`, data),
    delete: (id) => api.delete(`/folders/${id}`),
};

// =====================
// Resource API Functions (for later)
// =====================

export const resourceAPI = {
    getAll: (params) => api.get('/resources', { params }),
    getById: (id) => api.get(`/resources/${id}`),
    create: (data) => api.post('/resources', data),
    update: (id, data) => api.put(`/resources/${id}`, data),
    delete: (id) => api.delete(`/resources/${id}`),
    search: (query) => api.get('/resources/search', { params: { q: query } }),
};

// =====================
// Upload API Functions
// =====================

export const uploadAPI = {
    // Upload a file (for documents)
    upload: (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: onProgress
        });
    },
    // Delete a file from Cloudinary
    delete: (publicId) => api.delete(`/upload/${encodeURIComponent(publicId)}`)
};

export default api;
