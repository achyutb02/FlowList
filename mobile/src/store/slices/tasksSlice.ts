import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tasksApi } from '../../api';
import { Task, TaskCreate, TaskUpdate, TaskRecommendation } from '../../api/types';
import { contextApi } from '../../api';

interface TasksState {
  tasks: Task[];
  recommendations: TaskRecommendation[];
  selectedTask: Task | null;
  isLoading: boolean;
  isLoadingRecommendations: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  recommendations: [],
  selectedTask: null,
  isLoading: false,
  isLoadingRecommendations: false,
  error: null,
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ status, category }: { status?: string; category?: string } = {}, { rejectWithValue }) => {
    try {
      const tasks = await tasksApi.getTasks(status, category);
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch tasks');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'tasks/fetchRecommendations',
  async ({ energy, timeAvailable, limit = 3 }: { energy: number; timeAvailable: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await contextApi.getRecommendations(energy, timeAvailable, limit);
      return response.recommendations;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch recommendations');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: TaskCreate, { rejectWithValue }) => {
    try {
      const task = await tasksApi.createTask(data);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, data }: { taskId: string; data: TaskUpdate }, { rejectWithValue }) => {
    try {
      const task = await tasksApi.updateTask(taskId, data);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await tasksApi.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete task');
    }
  }
);

export const acceptTask = createAsyncThunk(
  'tasks/acceptTask',
  async ({ taskId, rank, score }: { taskId: string; rank?: number; score?: number }, { rejectWithValue }) => {
    try {
      await tasksApi.acceptTask(taskId, rank, score);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to accept task');
    }
  }
);

export const snoozeTask = createAsyncThunk(
  'tasks/snoozeTask',
  async ({ taskId, rank, score }: { taskId: string; rank?: number; score?: number }, { rejectWithValue }) => {
    try {
      await tasksApi.snoozeTask(taskId, rank, score);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to snooze task');
    }
  }
);

export const completeTask = createAsyncThunk(
  'tasks/completeTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const task = await tasksApi.completeTask(taskId);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to complete task');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    clearRecommendations: (state) => {
      state.recommendations = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = action.payload;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch recommendations
    builder.addCase(fetchRecommendations.pending, (state) => {
      state.isLoadingRecommendations = true;
      state.error = null;
    });
    builder.addCase(fetchRecommendations.fulfilled, (state, action) => {
      state.isLoadingRecommendations = false;
      state.recommendations = action.payload;
    });
    builder.addCase(fetchRecommendations.rejected, (state, action) => {
      state.isLoadingRecommendations = false;
      state.error = action.payload as string;
    });

    // Create task
    builder.addCase(createTask.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks.unshift(action.payload);
    });
    builder.addCase(createTask.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update task
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask = action.payload;
      }
    });

    // Delete task
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
    });

    // Accept task
    builder.addCase(acceptTask.fulfilled, (state, action) => {
      // Remove from recommendations
      state.recommendations = state.recommendations.filter(r => r.task.id !== action.payload);
    });

    // Snooze task
    builder.addCase(snoozeTask.fulfilled, (state, action) => {
      // Remove from recommendations
      state.recommendations = state.recommendations.filter(r => r.task.id !== action.payload);
      // Update snooze count in tasks
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.times_snoozed += 1;
      }
    });

    // Complete task
    builder.addCase(completeTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      // Remove from recommendations
      state.recommendations = state.recommendations.filter(r => r.task.id !== action.payload.id);
    });
  },
});

export const { clearError, setSelectedTask, clearRecommendations } = tasksSlice.actions;
export default tasksSlice.reducer;

