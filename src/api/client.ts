import axios, { AxiosInstance, AxiosError } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Base URL for the API - change this to your server URL
// Use your computer's local IP for physical devices, localhost for simulators
const API_BASE_URL = 'http://192.168.0.30:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Token storage key
const TOKEN_KEY = 'flowlist_auth_token';

// Storage functions that work on both web and native
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      storage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// Token management functions
export const setAuthToken = async (token: string) => {
  await storage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = async () => {
  return await storage.getItem(TOKEN_KEY);
};

export const clearAuthToken = async () => {
  await storage.removeItem(TOKEN_KEY);
};

export default apiClient;
