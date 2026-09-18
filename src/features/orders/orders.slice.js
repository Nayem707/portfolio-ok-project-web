import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { clearCart } from "@/features/cart/cart.slice";
import { api } from "@/services/api";
import {
  toOrderStatusKey,
  toOrderStatusLabel,
  toPaymentStatusKey,
  toPaymentStatusLabel,
} from "@/constants";
import { getProductImage } from "@/utils";

const normalizeOrder = (order) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  date: order.createdAt,
  status: toOrderStatusLabel(order.status),
  paymentStatus: toPaymentStatusLabel(order.paymentStatus),
  paymentMethod:
    order.paymentMethod === "ONLINE" ? "Online Payment" : "Cash on Delivery",
  items: (order.items || []).map((item) => ({
    id: item.productId || item.id,
    productId: item.productId,
    name: item.productName,
    price: Number(item.unitPrice || 0),
    discount: 0,
    quantity: item.quantity,
    selectedColor: item.selectedColor || null,
    selectedSize: item.selectedSize || null,
    image: getProductImage(item) || null,
    subtotal: Number(item.subtotal || 0),
  })),
  shipping: {
    fullName: order.shipFullName,
    phone: order.shipPhone,
    address: order.shipStreet,
    city: order.shipCity,
    postalCode: order.shipPostalCode,
    country: order.shipCountry,
  },
  customer: {
    id: order.user?.id || order.userId,
    name: order.user?.name || order.shipFullName || "Customer",
    email: order.user?.email || "",
  },
  subtotal: Number(order.subtotal || 0),
  discount: Number(order.discount || 0),
  shippingCost: Number(order.shippingFee || 0),
  total: Number(order.totalAmount || 0),
});

export const fetchAdminOrders = createAsyncThunk(
  "order/fetchAdminOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const statusKey = params.status
        ? toOrderStatusKey(params.status)
        : undefined;
      const response = await api.getOrders({
        page: params.page || 1,
        limit: params.limit || 100,
        ...(statusKey ? { status: statusKey } : {}),
        ...(params.search ? { search: params.search } : {}),
      });
      return {
        items: (response?.data || []).map(normalizeOrder),
        meta: response?.meta || null,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load orders",
      );
    }
  },
);

export const fetchAdminOrderById = createAsyncThunk(
  "order/fetchAdminOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.getOrderById(orderId);
      return normalizeOrder(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load order",
      );
    }
  },
);

export const updateAdminOrderStatus = createAsyncThunk(
  "order/updateAdminOrderStatus",
  async ({ id, status, paymentStatus }, { rejectWithValue }) => {
    try {
      const payload = {
        status: toOrderStatusKey(status),
        ...(paymentStatus
          ? { paymentStatus: toPaymentStatusKey(paymentStatus) }
          : {}),
      };
      const response = await api.updateOrderStatus(id, payload);
      return normalizeOrder(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to update order",
      );
    }
  },
);

export const fetchMyOrders = createAsyncThunk(
  "order/fetchMyOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const statusKey = params.status
        ? toOrderStatusKey(params.status)
        : undefined;
      const response = await api.getMyOrders({
        ...params,
        ...(statusKey ? { status: statusKey } : {}),
      });
      return {
        items: (response?.data || []).map(normalizeOrder),
        meta: response?.meta || null,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load orders",
      );
    }
  },
);

export const fetchMyOrderById = createAsyncThunk(
  "order/fetchMyOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.getMyOrderById(orderId);
      return normalizeOrder(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load order",
      );
    }
  },
);

export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (payload, { getState, dispatch, rejectWithValue }) => {
    try {
      const cartItems = getState().cart?.items || [];
      if (!cartItems.length) {
        return rejectWithValue("Your cart is empty");
      }

      for (const item of cartItems) {
        if (!item?.id) {
          return rejectWithValue("Cart contains an invalid product");
        }
        if (!item.quantity || item.quantity < 1) {
          return rejectWithValue(`Invalid quantity for ${item.name || "item"}`);
        }
      }

      const items = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        ...(item.selectedColor ? { selectedColor: item.selectedColor } : {}),
        ...(item.selectedSize ? { selectedSize: item.selectedSize } : {}),
      }));

      const response = await api.checkout({
        ...payload,
        items,
      });

      dispatch(clearCart());
      return normalizeOrder(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to place order",
      );
    }
  },
);

const upsertOrder = (list = [], order) => {
  const index = list.findIndex((item) => item.id === order.id);
  if (index === -1) return [order, ...list];
  const next = [...list];
  next[index] = order;
  return next;
};

const initialState = {
  items: [],
  adminMeta: null,
  myItems: [],
  myMeta: null,
  currentOrder: null,
  loading: false,
  loadingDetails: false,
  updatingStatus: false,
  placingOrder: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearMyOrderState(state) {
      state.myItems = [];
      state.myMeta = null;
      state.currentOrder = null;
      state.loading = false;
      state.loadingDetails = false;
      state.placingOrder = false;
      state.error = null;
    },
    clearAdminOrderState(state) {
      state.items = [];
      state.adminMeta = null;
      state.currentOrder = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.adminMeta = action.payload.meta;
        state.error = null;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load orders";
      })
      .addCase(fetchAdminOrderById.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchAdminOrderById.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentOrder = action.payload;
        state.items = upsertOrder(state.items, action.payload);
        state.error = null;
      })
      .addCase(fetchAdminOrderById.rejected, (state, action) => {
        state.loadingDetails = false;
        state.currentOrder = null;
        state.error = action.payload || "Failed to load order";
      })
      .addCase(updateAdminOrderStatus.pending, (state) => {
        state.updatingStatus = true;
        state.error = null;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        state.currentOrder = action.payload;
        state.items = upsertOrder(state.items, action.payload);
        state.myItems = upsertOrder(state.myItems, action.payload);
        state.error = null;
      })
      .addCase(updateAdminOrderStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.payload || "Failed to update order";
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myItems = action.payload.items;
        state.myMeta = action.payload.meta;
        state.error = null;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load orders";
      })
      .addCase(fetchMyOrderById.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchMyOrderById.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchMyOrderById.rejected, (state, action) => {
        state.loadingDetails = false;
        state.currentOrder = null;
        state.error = action.payload || "Failed to load order";
      })
      .addCase(placeOrder.pending, (state) => {
        state.placingOrder = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placingOrder = false;
        state.currentOrder = action.payload;
        state.myItems.unshift(action.payload);
        state.error = null;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placingOrder = false;
        state.error = action.payload || "Failed to place order";
      });
  },
});

export const { clearMyOrderState, clearAdminOrderState } = orderSlice.actions;
export default orderSlice.reducer;
