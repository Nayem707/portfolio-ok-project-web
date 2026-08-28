export const loadState = (key, fallback) => {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return fallback;
    return JSON.parse(serialized);
  } catch {
    return fallback;
  }
};

export const saveState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore write errors */
  }
};

export const removeState = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};
