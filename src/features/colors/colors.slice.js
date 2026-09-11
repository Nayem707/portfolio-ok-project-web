import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";

export const fetchColors = createAsyncThunk(
  "color/fetchColors",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getColors();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load colors",
      );
    }
  },
);

export const createColor = createAsyncThunk(
  "color/createColor",
  async (payload, { rejectWithValue }) => {
    try {
      return await api.createColor(payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to create color",
      );
    }
  },
);

export const updateColor = createAsyncThunk(
  "color/updateColor",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await api.updateColor(id, payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to update color",
      );
    }
  },
);

export const deleteColor = createAsyncThunk(
  "color/deleteColor",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteColor(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to delete color",
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

const colorSlice = createSlice({
  name: "color",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchColors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.error = null;
      })
      .addCase(fetchColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load colors";
      })
      .addCase(createColor.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(createColor.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createColor.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to create color";
      })
      .addCase(updateColor.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(updateColor.fulfilled, (state, action) => {
        state.mutationLoading = false;
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateColor.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to update color";
      })
      .addCase(deleteColor.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(deleteColor.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteColor.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to delete color";
      });
  },
});

export default colorSlice.reducer;
export const addColor = createColor;
