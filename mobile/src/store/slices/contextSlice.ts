import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contextApi } from '../../api';
import { Context, ContextUpdate } from '../../api/types';

interface ContextState {
  energy: number;
  focus: number;
  timeAvailableMinutes: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: ContextState = {
  energy: 3,
  focus: 3,
  timeAvailableMinutes: 60,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchContext = createAsyncThunk(
  'context/fetchContext',
  async (_, { rejectWithValue }) => {
    try {
      const context = await contextApi.getContext();
      return context;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch context');
    }
  }
);

export const updateContext = createAsyncThunk(
  'context/updateContext',
  async (data: ContextUpdate, { rejectWithValue }) => {
    try {
      const context = await contextApi.updateContext(data);
      return context;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update context');
    }
  }
);

const contextSlice = createSlice({
  name: 'context',
  initialState,
  reducers: {
    setEnergy: (state, action: PayloadAction<number>) => {
      state.energy = action.payload;
    },
    setFocus: (state, action: PayloadAction<number>) => {
      state.focus = action.payload;
    },
    setTimeAvailable: (state, action: PayloadAction<number>) => {
      state.timeAvailableMinutes = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch context
    builder.addCase(fetchContext.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchContext.fulfilled, (state, action) => {
      state.isLoading = false;
      state.energy = action.payload.energy;
      state.focus = action.payload.focus;
      state.timeAvailableMinutes = action.payload.time_available_minutes;
      state.lastUpdated = new Date().toISOString();
    });
    builder.addCase(fetchContext.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update context
    builder.addCase(updateContext.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateContext.fulfilled, (state, action) => {
      state.isLoading = false;
      state.energy = action.payload.energy;
      state.focus = action.payload.focus;
      state.timeAvailableMinutes = action.payload.time_available_minutes;
      state.lastUpdated = new Date().toISOString();
    });
    builder.addCase(updateContext.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setEnergy, setFocus, setTimeAvailable, clearError } = contextSlice.actions;
export default contextSlice.reducer;

