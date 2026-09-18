import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { orders as seedOrders } from "@/data/orders";
import { clearCart } from "@/features/cart/cart.slice";
import { api } from "@/services/api";

const toTitleCase = (value) => {
  if (!value) return "";
  const text = String(value).toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const normalizeOrder = (order) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  date: order.createdAt,
  status: toTitleCase(order.status),
  paymentStatus: toTitleCase(order.paymentStatus),
  paymentMethod:
    order.paymentMethod === "ONLINE" ? "Online Payment" : "Cash on Delivery",
  items: (order.items || []).map((item) => ({
    id: item.productId,
    name: item.productName,
    price: Number(item.unitPrice || 0),
    discount: 0,
    quantity: item.quantity,
    selectedColor: item.selectedColor || null,
    selectedSize: item.selectedSize || null,
    image: null,
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
    name: order.user?.name,
    email: order.user?.email,
  },
  subtotal: Number(order.subtotal || 0),
  discount: Number(order.discount || 0),
  shippingCost: Number(order.shippingFee || 0),
  total: Number(order.totalAmount || 0),
});

export const fetchMyOrders = createAsyncThunk(
  "order/fetchMyOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getMyOrders(params);
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

      // Clear local cart only after the order is successfully created.
      dispatch(clearCart());
      return normalizeOrder(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to place order",
      );
    }
  },
);

const initialState = {
  items: seedOrders,
  myItems: [],
  myMeta: null,
  currentOrder: null,
  loading: false,
  loadingDetails: false,
  placingOrder: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    updateOrderStatus(state, action) {
      const { id, status } = action.payload;
      const order = state.items.find((o) => o.id === id);
      if (order) order.status = status;
    },
    updatePaymentStatus(state, action) {
      const { id, paymentStatus } = action.payload;
      const order = state.items.find((o) => o.id === id);
      if (order) order.paymentStatus = paymentStatus;
    },
    clearMyOrderState(state) {
      state.myItems = [];
      state.myMeta = null;
      state.currentOrder = null;
      state.loading = false;
      state.loadingDetails = false;
      state.placingOrder = false;
      state.error = null;
    },
    addLocalOrder(state, action) {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
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

export const {
  updateOrderStatus,
  updatePaymentStatus,
  clearMyOrderState,
  addLocalOrder,
} = orderSlice.actions;
export default orderSlice.reducer;
