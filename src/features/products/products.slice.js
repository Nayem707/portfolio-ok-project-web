import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message || fallback;

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
      return rejectWithValue(getErrorMessage(error, "Failed to load products"));
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
        getErrorMessage(error, "Failed to load featured products"),
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
        getErrorMessage(error, "Failed to load popular products"),
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
        getErrorMessage(error, "Failed to load new arrivals"),
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
      return rejectWithValue(getErrorMessage(error, "Failed to load product"));
    }
  },
);

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (payload, { rejectWithValue }) => {
    try {
      return await api.createProduct(payload);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create product"),
      );
    }
  },
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await api.updateProduct(id, payload);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update product"),
      );
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete product"),
      );
    }
  },
);

const upsertItem = (items, product) => {
  const index = items.findIndex((item) => item.id === product.id);
  if (index === -1) {
    items.unshift(product);
    return;
  }
  items[index] = product;
};

const bumpMetaTotal = (meta, delta) => {
  if (!meta) return meta;
  const total = Math.max(0, (meta.total || 0) + delta);
  const limit = meta.limit || 1;
  return {
    ...meta,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const initialState = {
  items: [],
  listMeta: null,
  featuredItems: [],
  popularItems: [],
  newArrivalItems: [],
  currentProduct: null,
  listRequestId: null,
  detailsRequestedKey: null,
  loading: false,
  detailsLoading: false,
  mutationLoading: false,
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
    clearCurrentProduct(state) {
      state.currentProduct = null;
      state.detailsRequestedKey = null;
      state.detailsLoading = false;
      state.detailsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.listRequestId = action.meta.requestId;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.listRequestId) return;
        state.loading = false;
        state.items = action.payload.items;
        state.listMeta = action.payload.meta;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (action.meta.requestId !== state.listRequestId) return;
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
      .addCase(fetchProductByIdOrSlug.pending, (state, action) => {
        const requested = action.meta.arg;
        state.detailsRequestedKey = requested;
        state.detailsLoading = true;
        state.detailsError = null;
        // Drop stale details immediately when navigating A → B so the UI
        // never paints Product A's image/data while Product B is loading.
        const current = state.currentProduct;
        if (
          !current ||
          (current.id !== requested && current.slug !== requested)
        ) {
          state.currentProduct = null;
        }
      })
      .addCase(fetchProductByIdOrSlug.fulfilled, (state, action) => {
        if (action.meta.arg !== state.detailsRequestedKey) return;
        state.detailsLoading = false;
        state.currentProduct = action.payload;
        state.detailsError = null;
      })
      .addCase(fetchProductByIdOrSlug.rejected, (state, action) => {
        if (action.meta.aborted) return;
        if (action.meta.arg !== state.detailsRequestedKey) return;
        state.detailsLoading = false;
        state.currentProduct = null;
        state.detailsError = action.payload || "Failed to load product";
      })
      .addCase(createProduct.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.mutationLoading = false;
        upsertItem(state.items, action.payload);
        state.listMeta = bumpMetaTotal(state.listMeta, 1);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to create product";
      })
      .addCase(updateProduct.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.mutationLoading = false;
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to update product";
      })
      .addCase(deleteProduct.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.items = state.items.filter((p) => p.id !== action.payload);
        state.listMeta = bumpMetaTotal(state.listMeta, -1);
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || "Failed to delete product";
      });
  },
});

export const { setProducts, clearCurrentProduct } = productSlice.actions;
export const addProduct = createProduct;
export default productSlice.reducer;
