/**
 * Demo accounts for the frontend-only auth UI.
 * These simulate a signed-in session so role-based routing can be showcased.
 * No real authentication — replace with API/JWT auth later.
 */
export const demoAccounts = [
  {
    id: "u-1",
    name: "Alex Morgan",
    email: "user@shoply.com",
    password: "user1234",
    role: "USER",
    phone: "+1 202 555 0112",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "u-4",
    name: "Sam Rivera",
    email: "admin@shoply.com",
    password: "admin1234",
    role: "ADMIN",
    phone: "+1 202 555 0177",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
];
