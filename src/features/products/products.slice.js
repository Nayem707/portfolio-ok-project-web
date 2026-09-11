import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit";
import { api } from "@/services/api";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getProducts(params);
      return {
        items: response?.data || [],
        meta: response?.meta || null,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load products",
      );
    }
  },
);

export const fetchFeaturedProducts = createAsyncThunk(
  "product/fetchFeaturedProducts",
  async (limit = 8, { rejectWithValue }) => {
    try {
      return await api.getFeaturedProducts(limit);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message ||
          "Failed to load featured products",
      );
    }
  },
);

export const fetchPopularProducts = createAsyncThunk(
  "product/fetchPopularProducts",
  async (limit = 8, { rejectWithValue }) => {
    try {
      return await api.getPopularProducts(limit);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message ||
          "Failed to load popular products",
      );
    }
  },
);

export const fetchNewArrivalProducts = createAsyncThunk(
  "product/fetchNewArrivalProducts",
  async (limit = 8, { rejectWithValue }) => {
    try {
      return await api.getNewArrivals(limit);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load new arrivals",
      );
    }
  },
);

export const fetchProductByIdOrSlug = createAsyncThunk(
  "product/fetchProductByIdOrSlug",
  async (idOrSlug, { rejectWithValue }) => {
    try {
      return await api.getProductByIdOrSlug(idOrSlug);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load product",
      );
    }
  },
);

const initialState = {
  items: [],
  listMeta: null,
  featuredItems: [],
  popularItems: [],
  newArrivalItems: [],
  currentProduct: null,
  loading: false,
  detailsLoading: false,
  error: null,
  detailsError: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts(state, action) {
      state.items = action.payload || [];
      state.loading = false;
      state.error = null;
    },
    addProduct: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(data) {
        return {
          payload: {
            id: nanoid(),
            rating: 0,
            reviews: 0,
            featured: false,
            popular: false,
            newArrival: true,
            createdAt: new Date().toISOString().slice(0, 10),
            images: [],
            ...data,
          },
        };
      },
    },
    updateProduct(state, action) {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteProduct(state, action) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    clearCurrentProduct(state) {
      state.currentProduct = null;
      state.detailsLoading = false;
      state.detailsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.listMeta = action.payload.meta;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load products";
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredItems = action.payload || [];
      })
      .addCase(fetchPopularProducts.fulfilled, (state, action) => {
        state.popularItems = action.payload || [];
      })
      .addCase(fetchNewArrivalProducts.fulfilled, (state, action) => {
        state.newArrivalItems = action.payload || [];
      })
      .addCase(fetchProductByIdOrSlug.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchProductByIdOrSlug.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentProduct = action.payload;
        state.detailsError = null;

        const exists = state.items.some(
          (item) => item.id === action.payload.id,
        );
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchProductByIdOrSlug.rejected, (state, action) => {
        state.detailsLoading = false;
        state.currentProduct = null;
        state.detailsError = action.payload || "Failed to load product";
      });
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  clearCurrentProduct,
} = productSlice.actions;
export default productSlice.reducer;
