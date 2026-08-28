import { createSlice } from "@reduxjs/toolkit";
import { orders as seedOrders } from "@/data/orders";

const initialState = {
  items: seedOrders,
};

const genId = () => `ORD-${Math.floor(10000 + Math.random() * 89999)}`;

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    placeOrder: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(data) {
        return {
          payload: {
            id: genId(),
            date: new Date().toISOString().slice(0, 10),
            status: "Pending",
            paymentStatus:
              data.paymentMethod === "Online Payment" ? "Paid" : "Unpaid",
            ...data,
          },
        };
      },
    },
    updateOrderStatus(state, action) {
      const { id, status } = action.payload;
      const order = state.items.find((o) => o.id === id);
      if (order) order.status = status;
    },
    updatePaymentStatus(state, action) {
      const { id, paymentStatus } = action.payload;
      const order = state.items.find((o) => o.id === id);
      if (order) order.paymentStatus = paymentStatus;
    },
  },
});

export const { placeOrder, updateOrderStatus, updatePaymentStatus } =
  orderSlice.actions;
export default orderSlice.reducer;
