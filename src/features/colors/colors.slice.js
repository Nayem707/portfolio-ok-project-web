import { createSlice, nanoid } from "@reduxjs/toolkit";
import { slugify } from "@/utils";

const seedColors = [
  {
    id: "color-black",
    name: "Black",
    slug: "black",
    hex: "#111827",
    status: "Active",
    createdAt: "2025-11-02",
  },
  {
    id: "color-white",
    name: "White",
    slug: "white",
    hex: "#F8FAFC",
    status: "Active",
    createdAt: "2025-11-02",
  },
  {
    id: "color-navy",
    name: "Navy",
    slug: "navy",
    hex: "#1E3A8A",
    status: "Active",
    createdAt: "2025-11-03",
  },
  {
    id: "color-sand",
    name: "Sand",
    slug: "sand",
    hex: "#D6B894",
    status: "Active",
    createdAt: "2025-11-04",
  },
  {
    id: "color-olive",
    name: "Olive",
    slug: "olive",
    hex: "#708238",
    status: "Active",
    createdAt: "2025-11-05",
  },
  {
    id: "color-rose",
    name: "Rose",
    slug: "rose",
    hex: "#E9A3B2",
    status: "Active",
    createdAt: "2025-11-06",
  },
  {
    id: "color-blue",
    name: "Blue",
    slug: "blue",
    hex: "#2563EB",
    status: "Active",
    createdAt: "2025-11-07",
  },
  {
    id: "color-red",
    name: "Red",
    slug: "red",
    hex: "#DC2626",
    status: "Active",
    createdAt: "2025-11-08",
  },
];

const initialState = {
  items: seedColors,
};

const colorSlice = createSlice({
  name: "color",
  initialState,
  reducers: {
    addColor: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(data) {
        return {
          payload: {
            id: nanoid(),
            slug: slugify(data.name || ""),
            status: "Active",
            createdAt: new Date().toISOString().slice(0, 10),
            hex: "#111827",
            ...data,
          },
        };
      },
    },
    updateColor(state, action) {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteColor(state, action) {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addColor, updateColor, deleteColor } = colorSlice.actions;
export default colorSlice.reducer;
