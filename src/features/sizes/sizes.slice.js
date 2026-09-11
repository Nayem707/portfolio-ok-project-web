import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit";
import { slugify } from "@/utils";
import { api } from "@/services/api";

const seedSizes = [
  {
    id: "size-xs",
    name: "XS",
    slug: "xs",
    code: "XS",
    status: "Active",
    createdAt: "2025-11-02",
  },
  {
    id: "size-s",
    name: "S",
    slug: "s",
    code: "S",
    status: "Active",
    createdAt: "2025-11-02",
  },
  {
    id: "size-m",
    name: "M",
    slug: "m",
    code: "M",
    status: "Active",
    createdAt: "2025-11-03",
  },
  {
    id: "size-l",
    name: "L",
    slug: "l",
    code: "L",
    status: "Active",
    createdAt: "2025-11-04",
  },
  {
    id: "size-xl",
    name: "XL",
    slug: "xl",
    code: "XL",
    status: "Active",
    createdAt: "2025-11-05",
  },
  {
    id: "size-standard",
    name: "Standard",
    slug: "standard",
    code: "Standard",
    status: "Active",
    createdAt: "2025-11-06",
  },
];

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

const initialState = {
  items: seedSizes,
  loading: false,
  error: null,
};

const sizeSlice = createSlice({
  name: "size",
  initialState,
  reducers: {
    addSize: {
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
            code: data.name || "",
            ...data,
          },
        };
      },
    },
    updateSize(state, action) {
      const index = state.items.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteSize(state, action) {
      state.items = state.items.filter((s) => s.id !== action.payload);
    },
  },
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
      });
  },
});

export const { addSize, updateSize, deleteSize } = sizeSlice.actions;
export default sizeSlice.reducer;
