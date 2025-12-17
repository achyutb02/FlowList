import apiClient from './client';
import { Task, TaskCreate, TaskUpdate, ActivityLog } from './types';

export const tasksApi = {
  /**
   * Get all tasks for the current user
   */
  getTasks: async (status?: string, category?: string): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    
    const response = await apiClient.get<Task[]>(`/tasks?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a specific task by ID
   */
  getTask: async (taskId: string): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Create a new task
   */
  createTask: async (data: TaskCreate): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  },

  /**
   * Update a task
   */
  updateTask: async (taskId: string, data: TaskUpdate): Promise<Task> => {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, data);
    return response.data;
  },

  /**
   * Delete a task
   */
  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  /**
   * Accept a task recommendation
   */
  acceptTask: async (
    taskId: string,
    recommendationRank?: number,
    recommendationScore?: number,
    timeToDecisionSeconds?: number
  ): Promise<ActivityLog> => {
    const params = new URLSearchParams();
    if (recommendationRank) params.append('recommendation_rank', recommendationRank.toString());
    if (recommendationScore) params.append('recommendation_score', recommendationScore.toString());
    if (timeToDecisionSeconds) params.append('time_to_decision_seconds', timeToDecisionSeconds.toString());
    
    const response = await apiClient.post<ActivityLog>(`/tasks/${taskId}/accept?${params.toString()}`);
    return response.data;
  },

  /**
   * Snooze a task recommendation
   */
  snoozeTask: async (
    taskId: string,
    recommendationRank?: number,
    recommendationScore?: number,
    timeToDecisionSeconds?: number
  ): Promise<ActivityLog> => {
    const params = new URLSearchParams();
    if (recommendationRank) params.append('recommendation_rank', recommendationRank.toString());
    if (recommendationScore) params.append('recommendation_score', recommendationScore.toString());
    if (timeToDecisionSeconds) params.append('time_to_decision_seconds', timeToDecisionSeconds.toString());
    
    const response = await apiClient.post<ActivityLog>(`/tasks/${taskId}/snooze?${params.toString()}`);
    return response.data;
  },

  /**
   * Complete a task
   */
  completeTask: async (taskId: string): Promise<Task> => {
    const response = await apiClient.post<Task>(`/tasks/${taskId}/complete`);
    return response.data;
  },
};

