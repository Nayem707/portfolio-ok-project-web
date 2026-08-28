/** Mock orders for order-management UI. Demo/visualization only. */
export const orders = [
  {
    id: "ORD-10231",
    customer: {
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      id: "u-1",
    },
    date: "2026-08-20",
    items: [
      {
        id: "p-1",
        name: "Aurora Wireless Headphones",
        price: 199.99,
        discount: 20,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80",
      },
      {
        id: "p-13",
        name: "Halo Wireless Charger",
        price: 29.99,
        discount: 0,
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1591290619762-c588f0c19bfd?w=200&q=80",
      },
    ],
    shipping: {
      fullName: "Alex Morgan",
      phone: "+1 202 555 0112",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      postalCode: "62704",
      country: "United States",
    },
    paymentMethod: "Online Payment",
    paymentStatus: "Paid",
    status: "Delivered",
    subtotal: 219.97,
    shippingCost: 0,
    discount: 32,
    total: 219.97,
  },
  {
    id: "ORD-10232",
    customer: {
      name: "Jordan Lee",
      email: "jordan.lee@example.com",
      id: "u-2",
    },
    date: "2026-08-22",
    items: [
      {
        id: "p-3",
        name: "Nimbus Running Sneakers",
        price: 129.99,
        discount: 15,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80",
      },
    ],
    shipping: {
      fullName: "Jordan Lee",
      phone: "+1 202 555 0148",
      address: "18 Maple Street",
      city: "Portland",
      postalCode: "97205",
      country: "United States",
    },
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Unpaid",
    status: "Shipped",
    subtotal: 110.49,
    shippingCost: 12,
    discount: 19.5,
    total: 122.49,
  },
  {
    id: "ORD-10233",
    customer: {
      name: "Casey Nguyen",
      email: "casey.nguyen@example.com",
      id: "u-5",
    },
    date: "2026-08-24",
    items: [
      {
        id: "p-7",
        name: "Velvet Glow Serum",
        price: 44.0,
        discount: 10,
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80",
      },
      {
        id: "p-15",
        name: "Sculpt Face Roller",
        price: 27.5,
        discount: 0,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80",
      },
    ],
    shipping: {
      fullName: "Casey Nguyen",
      phone: "+1 202 555 0125",
      address: "900 Bay Ave",
      city: "San Diego",
      postalCode: "92101",
      country: "United States",
    },
    paymentMethod: "Online Payment",
    paymentStatus: "Paid",
    status: "Processing",
    subtotal: 106.7,
    shippingCost: 12,
    discount: 8.8,
    total: 118.7,
  },
  {
    id: "ORD-10234",
    customer: {
      name: "Riley Patel",
      email: "riley.patel@example.com",
      id: "u-6",
    },
    date: "2026-08-25",
    items: [
      {
        id: "p-8",
        name: "Peak Trail Backpack 30L",
        price: 89.99,
        discount: 5,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80",
      },
      {
        id: "p-11",
        name: "Zen Yoga Mat",
        price: 34.99,
        discount: 12,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=200&q=80",
      },
    ],
    shipping: {
      fullName: "Riley Patel",
      phone: "+1 202 555 0133",
      address: "55 Hill Road",
      city: "Austin",
      postalCode: "73301",
      country: "United States",
    },
    paymentMethod: "Online Payment",
    paymentStatus: "Paid",
    status: "Confirmed",
    subtotal: 116.28,
    shippingCost: 12,
    discount: 8.8,
    total: 128.28,
  },
  {
    id: "ORD-10235",
    customer: {
      name: "Taylor Brooks",
      email: "taylor.brooks@example.com",
      id: "u-3",
    },
    date: "2026-08-26",
    items: [
      {
        id: "p-12",
        name: "The Midnight Library",
        price: 18.99,
        discount: 0,
        quantity: 3,
        image:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80",
      },
    ],
    shipping: {
      fullName: "Taylor Brooks",
      phone: "+1 202 555 0190",
      address: "12 Ocean Drive",
      city: "Miami",
      postalCode: "33139",
      country: "United States",
    },
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Unpaid",
    status: "Pending",
    subtotal: 56.97,
    shippingCost: 12,
    discount: 0,
    total: 68.97,
  },
  {
    id: "ORD-10236",
    customer: {
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      id: "u-1",
    },
    date: "2026-08-27",
    items: [
      {
        id: "p-2",
        name: "Meridian Smart Watch",
        price: 249.0,
        discount: 10,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80",
      },
    ],
    shipping: {
      fullName: "Alex Morgan",
      phone: "+1 202 555 0112",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      postalCode: "62704",
      country: "United States",
    },
    paymentMethod: "Online Payment",
    paymentStatus: "Paid",
    status: "Cancelled",
    subtotal: 224.1,
    shippingCost: 0,
    discount: 24.9,
    total: 224.1,
  },
];

export const getOrderById = (id) => orders.find((o) => o.id === id);

/** Aggregated stats for dashboards. */
export const salesByMonth = [
  { month: "Mar", revenue: 12400, orders: 82 },
  { month: "Apr", revenue: 15200, orders: 96 },
  { month: "May", revenue: 13900, orders: 88 },
  { month: "Jun", revenue: 18700, orders: 121 },
  { month: "Jul", revenue: 21300, orders: 139 },
  { month: "Aug", revenue: 24800, orders: 158 },
];

export const topProducts = [
  { name: "Nimbus Sneakers", sales: 512 },
  { name: "Midnight Library", sales: 431 },
  { name: "Velvet Glow Serum", sales: 389 },
  { name: "Aurora Headphones", sales: 318 },
  { name: "Echo Speaker", sales: 289 },
];
