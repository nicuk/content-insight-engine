import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Define types for our API responses
export interface ContentResponse {
  id: string;
  url: string;
  status: string;
  summary?: string;
  keywords?: string[];
}

export interface SubmitContentRequest {
  url: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Content API
export const contentApi = {
  // Submit a URL for processing
  submitContent: async (data: SubmitContentRequest): Promise<ContentResponse> => {
    const response = await api.post('/content', data);
    return response.data;
  },

  // Get content by ID
  getContent: async (id: string): Promise<ContentResponse> => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },

  // Get content processing status
  getContentStatus: async (id: string): Promise<{ status: string }> => {
    const response = await api.get(`/content/${id}/status`);
    return response.data;
  },
};

// Auth API
export const authApi = {
  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  // Logout (client-side only)
  logout: (): void => {
    localStorage.removeItem('token');
  },
};

export default api;
