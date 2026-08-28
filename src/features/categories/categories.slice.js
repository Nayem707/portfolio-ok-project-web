import { createSlice, nanoid } from "@reduxjs/toolkit";
import { categories as seedCategories } from "@/data/products";
import { slugify } from "@/utils";

const initialState = {
  items: seedCategories,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    addCategory: {
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
            image: "",
            ...data,
          },
        };
      },
    },
    updateCategory(state, action) {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteCategory(state, action) {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addCategory, updateCategory, deleteCategory } =
  categorySlice.actions;
export default categorySlice.reducer;
