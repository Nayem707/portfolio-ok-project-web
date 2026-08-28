import { createSlice, nanoid } from "@reduxjs/toolkit";
import { products as seedProducts } from "@/data/products";

const initialState = {
  items: seedProducts,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    addProduct: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(data) {
        return {
          payload: {
            id: nanoid(),
            rating: 0,
            reviews: 0,
            featured: false,
            popular: false,
            newArrival: true,
            createdAt: new Date().toISOString().slice(0, 10),
            images: [],
            ...data,
          },
        };
      },
    },
    updateProduct(state, action) {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteProduct(state, action) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
  },
});

export const { addProduct, updateProduct, deleteProduct } =
  productSlice.actions;
export default productSlice.reducer;
