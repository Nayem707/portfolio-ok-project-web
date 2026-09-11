import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";

export const fetchSizes = createAsyncThunk(
  "size/fetchSizes",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getSizes();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load sizes",
      );
    }
  },
);

export const createSize = createAsyncThunk(
  "size/createSize",
  async (payload, { rejectWithValue }) => {
    try {
      return await api.createSize(payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to create size",
      );
    }
  },
);

export const updateSize = createAsyncThunk(
  "size/updateSize",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await api.updateSize(id, payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to update size",
      );
    }
  },
);

export const deleteSize = createAsyncThunk(
  "size/deleteSize",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteSize(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to delete size",
      );
    }
  },
);

const initialState = {
  items: [],
  loading: false,
  mutationLoading: false,
  error: null,
};

const sizeSlice = createSlice({
  name: "size",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.error = null;
      })
      .addCase(fetchSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load sizes";
      })
      .addCase(createSize.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(createSize.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createSize.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to create size";
      })
      .addCase(updateSize.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(updateSize.fulfilled, (state, action) => {
        state.mutationLoading = false;
        const index = state.items.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateSize.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to update size";
      })
      .addCase(deleteSize.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(deleteSize.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.items = state.items.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteSize.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to delete size";
      });
  },
});

export default sizeSlice.reducer;
export const addSize = createSize;
