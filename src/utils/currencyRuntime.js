/** Runtime currency settings kept in sync with Redux (used by formatCurrency). */

const DEFAULT_BDT_PER_USD = 122;

let runtimeCurrency = "USD";
let runtimeBdtPerUsd = DEFAULT_BDT_PER_USD;

export function setRuntimeCurrency(code) {
  const next = String(code || "USD").toUpperCase();
  runtimeCurrency = next === "BDT" ? "BDT" : "USD";
}

export function getRuntimeCurrency() {
  return runtimeCurrency || "USD";
}

export function setRuntimeBdtPerUsd(rate) {
  const next = Number(rate);
  runtimeBdtPerUsd =
    Number.isFinite(next) && next > 0 ? next : DEFAULT_BDT_PER_USD;
}

export function getRuntimeBdtPerUsd() {
  return runtimeBdtPerUsd || DEFAULT_BDT_PER_USD;
}

export { DEFAULT_BDT_PER_USD };
