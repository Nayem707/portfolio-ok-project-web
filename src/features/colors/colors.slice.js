import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit";
import { slugify } from "@/utils";
import { api } from "@/services/api";

const seedColors = [
  {
    id: "color-black",
    name: "Black",
    slug: "black",
    hex: "#111827",
    status: "Active",
    createdAt: "2025-11-02",
  },
  {
    id: "color-white",
    name: "White",
    slug: "white",
    hex: "#F8FAFC",
    status: "Active",
    createdAt: "2025-11-02",
  },
  {
    id: "color-navy",
    name: "Navy",
    slug: "navy",
    hex: "#1E3A8A",
    status: "Active",
    createdAt: "2025-11-03",
  },
  {
    id: "color-sand",
    name: "Sand",
    slug: "sand",
    hex: "#D6B894",
    status: "Active",
    createdAt: "2025-11-04",
  },
  {
    id: "color-olive",
    name: "Olive",
    slug: "olive",
    hex: "#708238",
    status: "Active",
    createdAt: "2025-11-05",
  },
  {
    id: "color-rose",
    name: "Rose",
    slug: "rose",
    hex: "#E9A3B2",
    status: "Active",
    createdAt: "2025-11-06",
  },
  {
    id: "color-blue",
    name: "Blue",
    slug: "blue",
    hex: "#2563EB",
    status: "Active",
    createdAt: "2025-11-07",
  },
  {
    id: "color-red",
    name: "Red",
    slug: "red",
    hex: "#DC2626",
    status: "Active",
    createdAt: "2025-11-08",
  },
];

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

const initialState = {
  items: seedColors,
  loading: false,
  error: null,
};

const colorSlice = createSlice({
  name: "color",
  initialState,
  reducers: {
    addColor: {
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
            hex: "#111827",
            ...data,
          },
        };
      },
    },
    updateColor(state, action) {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteColor(state, action) {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
  },
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
      });
  },
});

export const { addColor, updateColor, deleteColor } = colorSlice.actions;
export default colorSlice.reducer;
