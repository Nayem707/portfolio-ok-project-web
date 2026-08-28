import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  BanknotesIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import StatCard from "@/components/common/StatCard";
import Badge from "@/components/common/Badge";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import { selectOrders } from "@/features/orders";
import { selectProducts } from "@/features/products";
import { users } from "@/data/users";
import { salesByMonth, topProducts } from "@/data/orders";
import { formatCurrency, formatDate } from "@/utils";
import { ORDER_STATUS } from "@/constants";

export default function AdminDashboardView() {
  const orders = useSelector(selectOrders);
  const products = useSelector(selectProducts);

  const revenue = orders
    .filter((o) => o.status !== ORDER_STATUS.CANCELLED)
    .reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter(
    (o) => o.status === ORDER_STATUS.PENDING,
  ).length;
  const completed = orders.filter(
    (o) => o.status === ORDER_STATUS.DELIVERED,
  ).length;

  const recentOrders = orders.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back — here’s what’s happening in your store.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(revenue)}
          icon={BanknotesIcon}
          tone="green"
          trend={{ positive: true, value: "12.5%", label: "vs last month" }}
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={ShoppingCartIcon}
          tone="primary"
          trend={{ positive: true, value: "8.2%", label: "vs last month" }}
        />
        <StatCard
          label="Products"
          value={products.length}
          icon={CubeIcon}
          tone="blue"
        />
        <StatCard
          label="Total Users"
          value={users.length}
          icon={UsersIcon}
          tone="purple"
          trend={{ positive: true, value: "4.1%", label: "vs last month" }}
        />
        <StatCard
          label="Pending"
          value={pending}
          icon={ClockIcon}
          tone="yellow"
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircleIcon}
          tone="green"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Revenue Overview</h2>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesByMonth} margin={{ left: -10, right: 10 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                }}
                formatter={(value) => [formatCurrency(value), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">
            Top Selling Products
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ left: 20, right: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                width={90}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                }}
              />
              <Bar
                dataKey="sales"
                fill="#f97316"
                radius={[0, 6, 6, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders overview bar */}
      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Orders Overview</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={salesByMonth} margin={{ left: -10, right: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 13,
              }}
            />
            <Bar
              dataKey="orders"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent orders + users */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
            >
              View all <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-3.5 transition hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {order.id}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.customer.name} · {formatDate(order.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="hidden text-sm font-semibold text-slate-800 sm:block">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Recent Users</h2>
            <Link
              to="/admin/users"
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
            >
              View all <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentUsers.map((user) => (
              <li key={user.id}>
                <Link
                  to={`/admin/users/${user.id}`}
                  className="flex items-center gap-3 px-6 py-3.5 transition hover:bg-slate-50"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {user.email}
                    </p>
                  </div>
                  <Badge
                    color={user.status === "Active" ? "green" : "gray"}
                    dot
                  >
                    {user.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
