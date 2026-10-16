const STORAGE_KEY = "shoply_guest_cancel_codes";

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

export const saveGuestCancelCode = (orderNumber, code) => {
  if (!orderNumber || !code) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readAll(), [orderNumber]: code }),
    );
  } catch {
    // Storage full or blocked: the code is still shown on screen.
  }
};

export const getGuestCancelCode = (orderNumber) => readAll()[orderNumber] || "";
