import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";

const normalizeCategoryItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.categories)) return payload.categories;
  return [];
};

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (options = {}, { rejectWithValue }) => {
    try {
      return await api.getCategories(options?.all ? { all: "true" } : {});
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load categories",
      );
    }
  },
);

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (payload, { rejectWithValue }) => {
    try {
      return await api.createCategory(payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to create category",
      );
    }
  },
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await api.updateCategory(id, payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to update category",
      );
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to delete category",
      );
    }
  },
);

export const toggleCategoryStatus = createAsyncThunk(
  "category/toggleCategoryStatus",
  async (category, { rejectWithValue }) => {
    const nextStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      return await api.updateCategory(category.id, { status: nextStatus });
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message ||
          "Failed to toggle category status",
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

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategories(state, action) {
      state.items = normalizeCategoryItems(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = normalizeCategoryItems(action.payload);
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load categories";
      })
      .addCase(createCategory.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to create category";
      })
      .addCase(updateCategory.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.mutationLoading = false;
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to update category";
      })
      .addCase(toggleCategoryStatus.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.mutationLoading = false;
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to toggle category status";
      })
      .addCase(deleteCategory.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to delete category";
      });
  },
});

export const { setCategories } = categorySlice.actions;
export const addCategory = createCategory;
export default categorySlice.reducer;
