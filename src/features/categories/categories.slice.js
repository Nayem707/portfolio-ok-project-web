import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit";
import { slugify } from "@/utils";
import { api } from "@/services/api";

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getCategories();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load categories",
      );
    }
  },
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategories(state, action) {
      state.items = action.payload || [];
    },
    addCategory: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(data) {
        return {
          payload: {
            id: nanoid(),
            slug: slugify(data.name || ""),
            status: "Active",
            createdAt: new Date().toISOString().slice(0, 10),
            image: "",
            ...data,
          },
        };
      },
    },
    updateCategory(state, action) {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteCategory(state, action) {
      state.items = state.items.filter((c) => c.id !== action.payload);
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
        state.items = action.payload || [];
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load categories";
      });
  },
});

export const { setCategories, addCategory, updateCategory, deleteCategory } =
  categorySlice.actions;
export default categorySlice.reducer;
