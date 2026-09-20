import { DEFAULT_BDT_PER_USD } from "@/utils/currencyRuntime";

export const selectSettings = (state) => state.settings?.data;
export const selectCurrency = (state) =>
  state.settings?.data?.currency || "USD";
export const selectBdtPerUsd = (state) =>
  Number(state.settings?.data?.bdtPerUsd) || DEFAULT_BDT_PER_USD;
export const selectSettingsLoading = (state) =>
  Boolean(state.settings?.loading);
export const selectSettingsSaving = (state) => Boolean(state.settings?.saving);
