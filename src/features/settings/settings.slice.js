import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import {
  DEFAULT_BDT_PER_USD,
  setRuntimeBdtPerUsd,
  setRuntimeCurrency,
} from "@/utils/currencyRuntime";
import { APP_NAME, SOCIAL_LINK_KEYS } from "@/constants";

const SETTINGS_CACHE_KEY = "shoply_settings_currency";
const RATE_CACHE_KEY = "shoply_settings_bdt_per_usd";

const defaultSocialLinks = Object.fromEntries(
  SOCIAL_LINK_KEYS.map((key) => [key, ""]),
);

// Contact/footer fields stay empty until the API responds so the storefront
// never shows placeholder contact details.
const defaultSettings = {
  storeName: APP_NAME,
  supportEmail: "",
  phone: "",
  currency: "USD",
  bdtPerUsd: DEFAULT_BDT_PER_USD,
  address: "",
  shippingFlatRate: 12,
  freeShippingMin: 150,
  deliveryInsideDhaka: 70,
  deliveryOutsideDhaka: 150,
  whatsapp: "",
  logoUrl: "",
  footerDescription: "",
  supportHours: "",
  copyrightName: "",
  socialLinks: defaultSocialLinks,
};

const mergeSettings = (current, incoming = {}) => ({
  ...current,
  ...incoming,
  socialLinks: {
    ...defaultSocialLinks,
    ...current?.socialLinks,
    ...incoming?.socialLinks,
  },
});

const cachedCurrency =
  typeof localStorage !== "undefined"
    ? localStorage.getItem(SETTINGS_CACHE_KEY)
    : null;
const cachedRate =
  typeof localStorage !== "undefined"
    ? Number(localStorage.getItem(RATE_CACHE_KEY))
    : NaN;

if (cachedCurrency) setRuntimeCurrency(cachedCurrency);
if (Number.isFinite(cachedRate) && cachedRate > 0) {
  setRuntimeBdtPerUsd(cachedRate);
}

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getSettings();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message || "Failed to load settings",
      );
    }
  },
);

export const saveStoreSettings = createAsyncThunk(
  "settings/saveStoreSettings",
  async (payload, { rejectWithValue }) => {
    try {
      return await api.updateStoreSettings(payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message ||
          "Failed to save store settings",
      );
    }
  },
);

export const saveShippingSettings = createAsyncThunk(
  "settings/saveShippingSettings",
  async (payload, { rejectWithValue }) => {
    try {
      return await api.updateShippingSettings(payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error?.message ||
          "Failed to save shipping settings",
      );
    }
  },
);

function applySettingsSideEffects(settings) {
  if (!settings) return;
  if (settings.currency) {
    setRuntimeCurrency(settings.currency);
    try {
      localStorage.setItem(SETTINGS_CACHE_KEY, settings.currency);
    } catch {
      // ignore
    }
  }
  if (settings.bdtPerUsd != null) {
    setRuntimeBdtPerUsd(settings.bdtPerUsd);
    try {
      localStorage.setItem(RATE_CACHE_KEY, String(settings.bdtPerUsd));
    } catch {
      // ignore
    }
  }
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    data: {
      ...defaultSettings,
      currency: cachedCurrency || defaultSettings.currency,
      bdtPerUsd:
        Number.isFinite(cachedRate) && cachedRate > 0
          ? cachedRate
          : defaultSettings.bdtPerUsd,
    },
    loading: false,
    saving: false,
    error: null,
    hydrated: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.data = mergeSettings(defaultSettings, action.payload);
        applySettingsSideEffects(state.data);
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.error = action.payload || "Failed to load settings";
      })
      .addCase(saveStoreSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveStoreSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.data = mergeSettings(state.data, action.payload);
        applySettingsSideEffects(state.data);
      })
      .addCase(saveStoreSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to save store settings";
      })
      .addCase(saveShippingSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveShippingSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.data = mergeSettings(state.data, action.payload);
      })
      .addCase(saveShippingSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to save shipping settings";
      });
  },
});

export default settingsSlice.reducer;
