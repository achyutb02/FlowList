// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  onboarding_completed: boolean;
  current_energy: number;
  current_focus: number;
  time_available_minutes: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string | null;
  energy_required: number;
  focus_required: number;
  time_estimate_minutes: number;
  due_date: string | null;
  status: string;
  category: string | null;
  tags: string | null;
  importance_score: number;
  times_snoozed: number;
  created_at: string;
  completed_at: string | null;
}

export interface TaskCreate {
  title: string;
  description?: string;
  energy_required?: number;
  focus_required?: number;
  time_estimate_minutes?: number;
  due_date?: string;
  category?: string;
  tags?: string;
  importance_score?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  energy_required?: number;
  focus_required?: number;
  time_estimate_minutes?: number;
  due_date?: string;
  category?: string;
  tags?: string;
  importance_score?: number;
  status?: string;
}

// Context types
export interface Context {
  energy: number;
  focus: number;
  time_available_minutes: number;
}

export interface ContextUpdate {
  energy: number;
  focus: number;
  time_available_minutes: number;
}

// Recommendation types
export interface RecommendationReason {
  factor: string;
  description: string;
  score_contribution: number;
}

export interface TaskRecommendation {
  task: Task;
  score: number;
  rank: number;
  reasons: RecommendationReason[];
}

export interface RecommendationsResponse {
  recommendations: TaskRecommendation[];
  context: Context;
}

// Activity log types
export interface ActivityLog {
  id: string;
  task_id: string | null;
  action: string;
  user_energy: number | null;
  user_focus: number | null;
  time_available_minutes: number | null;
  recommendation_rank: number | null;
  recommendation_score: number | null;
  timestamp: string;
}

