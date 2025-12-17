import apiClient from './client';
import { Context, ContextUpdate, RecommendationsResponse } from './types';

export const contextApi = {
  /**
   * Update the user's current context
   */
  updateContext: async (data: ContextUpdate): Promise<Context> => {
    const response = await apiClient.post<Context>('/tasks/context', data);
    return response.data;
  },

  /**
   * Get the user's current context
   */
  getContext: async (): Promise<Context> => {
    const response = await apiClient.get<Context>('/tasks/context/current');
    return response.data;
  },

  /**
   * Get task recommendations based on explicit context
   */
  getRecommendations: async (energy: number, timeAvailable: number, limit: number = 3): Promise<RecommendationsResponse> => {
    const response = await apiClient.post<RecommendationsResponse>(`/recommendations?limit=${limit}`, {
      user_energy: energy,
      time_available_minutes: timeAvailable,
    });
    return response.data;
  },
};

