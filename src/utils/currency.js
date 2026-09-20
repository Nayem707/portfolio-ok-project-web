import {
  DEFAULT_BDT_PER_USD,
  getRuntimeBdtPerUsd,
  getRuntimeCurrency,
} from "@/utils/currencyRuntime";

export function normalizeCurrency(code) {
  return String(code || "BDT").toUpperCase() === "USD" ? "USD" : "BDT";
}

/**
 * Convert between USD and BDT. `bdtPerUsd` = how many BDT equal 1 USD.
 */
export function convertAmount(
  amount,
  fromCurrency,
  toCurrency,
  bdtPerUsd = getRuntimeBdtPerUsd(),
) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return 0;

  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);
  if (from === to) return value;

  const rate = Number(bdtPerUsd);
  if (!Number.isFinite(rate) || rate <= 0) return value;

  const asUsd = from === "USD" ? value : value / rate;
  const converted = to === "USD" ? asUsd : asUsd * rate;
  return Math.round(converted * 100) / 100;
}

/**
 * Format a stored (base-currency) amount in the current display currency.
 * Pass `{ convert: false }` to format without conversion.
 * Pass `{ from: "USD" }` when the amount is already in a non-default base.
 */
export const formatCurrency = (value = 0, options = {}) => {
  const opts = typeof options === "string" ? { currency: options } : options || {};
  const displayCurrency = normalizeCurrency(
    opts.currency || getRuntimeCurrency() || "USD",
  );
  const fromCurrency = normalizeCurrency(opts.from || "BDT");
  const rate = Number(opts.bdtPerUsd) || getRuntimeBdtPerUsd() || DEFAULT_BDT_PER_USD;
  const amount =
    opts.convert === false
      ? Number(value) || 0
      : convertAmount(value, fromCurrency, displayCurrency, rate);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: displayCurrency,
      minimumFractionDigits: displayCurrency === "BDT" ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  }
};
