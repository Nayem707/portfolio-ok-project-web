import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { toUserStatusKey, toUserStatusLabel } from "@/constants";

export const normalizeAdminUser = (user) => {
  if (!user) return null;
  const avatarUrl = user.avatarUrl || user.avatar || null;
  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "USER",
    status: toUserStatusLabel(user.status),
    avatarUrl,
    avatar: avatarUrl,
    phone: user.phone || "",
    orders: Number(user.orders ?? 0),
    addresses: user.addresses || [],
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt,
  };
};

const upsertUser = (items, user) => {
  if (!user?.id) return items;
  const index = items.findIndex((item) => item.id === user.id);
  if (index === -1) return [user, ...items];
  const next = items.slice();
  next[index] = { ...items[index], ...user };
  return next;
};

export const fetchAdminUsers = createAsyncThunk(
  "users/fetchAdminUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const statusKey = params.status
        ? toUserStatusKey(params.status)
        : undefined;
      const response = await api.getUsers({
        page: params.page || 1,
        limit: params.limit || 100,
        ...(params.search ? { search: params.search } : {}),
        ...(params.role ? { role: params.role } : {}),
        ...(statusKey ? { status: statusKey } : {}),
      });
      return {
        items: (response?.data || []).map(normalizeAdminUser),
        meta: response?.meta || null,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load users",
      );
    }
  },
);

export const fetchAdminUserById = createAsyncThunk(
  "users/fetchAdminUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getUserById(id);
      return normalizeAdminUser(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load user",
      );
    }
  },
);

export const updateAdminUserStatus = createAsyncThunk(
  "users/updateAdminUserStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.updateUserStatus(id, toUserStatusKey(status));
      return normalizeAdminUser(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to update user status",
      );
    }
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    meta: null,
    currentUser: null,
    loading: false,
    loadingDetails: false,
    updatingStatus: false,
    error: null,
  },
  reducers: {
    clearCurrentAdminUser(state) {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta;
        state.error = null;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load users";
      })
      .addCase(fetchAdminUserById.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchAdminUserById.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentUser = action.payload;
        state.items = upsertUser(state.items, action.payload);
        state.error = null;
      })
      .addCase(fetchAdminUserById.rejected, (state, action) => {
        state.loadingDetails = false;
        state.currentUser = null;
        state.error = action.payload || "Failed to load user";
      })
      .addCase(updateAdminUserStatus.pending, (state) => {
        state.updatingStatus = true;
        state.error = null;
      })
      .addCase(updateAdminUserStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        state.items = upsertUser(state.items, action.payload);
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = { ...state.currentUser, ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateAdminUserStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.payload || "Failed to update user status";
      });
  },
});

export const { clearCurrentAdminUser } = usersSlice.actions;
export default usersSlice.reducer;
