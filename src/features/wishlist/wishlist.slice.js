import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";

const mapWishlist = (items = []) =>
  items.map((item) => ({
    id: item.productId,
    wishlistItemId: item.id,
    name: item.name,
    slug: item.slug,
    price: Number(item.price || 0),
    discount: Number(item.discount || 0),
    image: item.image,
    rating: Number(item.rating || 0),
    stock: item.stock,
    createdAt: item.createdAt,
  }));

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getWishlist();
      return mapWishlist(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load wishlist",
      );
    }
  },
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (product, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const exists = (state.wishlist.items || []).some(
        (item) => item.id === product.id,
      );
      const response = exists
        ? await api.removeFromWishlist(product.id)
        : await api.addToWishlist(product.id);
      return mapWishlist(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to update wishlist",
      );
    }
  },
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.removeFromWishlist(productId);
      return mapWishlist(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message ||
          "Failed to remove wishlist item",
      );
    }
  },
);

export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const ids = (getState().wishlist.items || []).map((item) => item.id);
      for (const id of ids) {
        // Backend does not expose a bulk clear endpoint, so remove items one by one.
        // eslint-disable-next-line no-await-in-loop
        await dispatch(removeFromWishlist(id)).unwrap();
      }
      return [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to clear wishlist",
      );
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    mutating: false,
    error: null,
    initialized: false,
  },
  reducers: {
    resetWishlistState(state) {
      state.items = [];
      state.loading = false;
      state.mutating = false;
      state.error = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
        state.initialized = true;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load wishlist";
        state.initialized = true;
      })
      .addCase(toggleWishlist.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.mutating = false;
        state.items = action.payload;
        state.error = null;
        state.initialized = true;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload || "Failed to update wishlist";
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.mutating = false;
        state.items = action.payload;
        state.error = null;
        state.initialized = true;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload || "Failed to remove wishlist item";
      })
      .addCase(clearWishlist.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.mutating = false;
        state.items = [];
        state.error = null;
        state.initialized = true;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload || "Failed to clear wishlist";
      });
  },
});

export const { resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
