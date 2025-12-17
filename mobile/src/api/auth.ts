import apiClient, { setAuthToken, clearAuthToken } from './client';
import { User, LoginRequest, RegisterRequest, AuthResponse } from './types';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Login with email and password (JSON body)
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login/json', data);
    // Store the token
    await setAuthToken(response.data.access_token);
    return response.data;
  },

  /**
   * Get the current authenticated user
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Logout - clear the stored token
   */
  logout: async (): Promise<void> => {
    await clearAuthToken();
  },
};

