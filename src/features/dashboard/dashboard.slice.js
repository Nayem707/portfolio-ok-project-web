import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import {
  toOrderStatusLabel,
  toPaymentStatusLabel,
  toUserStatusLabel,
} from "@/constants";

const normalizeRecentOrder = (order) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: toOrderStatusLabel(order.status),
  paymentStatus: toPaymentStatusLabel(order.paymentStatus),
  total: Number(order.totalAmount || order.total || 0),
  date: order.createdAt || order.date,
  customer: {
    id: order.customer?.id || order.user?.id || order.userId,
    name: order.customer?.name || order.user?.name || "Customer",
    email: order.customer?.email || order.user?.email || "",
  },
  itemCount: order.itemCount || order.items?.length || 0,
});

const normalizeRecentUser = (user) => ({
  id: user.id,
  name: user.name || "",
  email: user.email || "",
  role: user.role || "USER",
  status: toUserStatusLabel(user.status),
  avatarUrl: user.avatarUrl || user.avatar || null,
  avatar: user.avatarUrl || user.avatar || null,
  createdAt: user.createdAt,
});

export const fetchAdminDashboard = createAsyncThunk(
  "dashboard/fetchAdminDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const [overview, stats] = await Promise.all([
        api.getDashboardOverview(),
        api.getDashboardStats(),
      ]);
      return { overview, stats };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load dashboard",
      );
    }
  },
);

const initialState = {
  overview: null,
  stats: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard(state) {
      state.overview = null;
      state.stats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.overview = action.payload.overview || null;
        state.stats = {
          ...(action.payload.stats || {}),
          recentOrders: (action.payload.stats?.recentOrders || []).map(
            normalizeRecentOrder,
          ),
          topProducts: (action.payload.stats?.topProducts || []).map((p) => ({
            productId: p.productId,
            name: p.name,
            sales: Number(p.sales ?? p.unitsSold ?? 0),
          })),
        };
        if (state.overview?.recentUsers) {
          state.overview = {
            ...state.overview,
            recentUsers: state.overview.recentUsers.map(normalizeRecentUser),
          };
        }
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load dashboard";
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
