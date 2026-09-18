import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import Avatar from "@/components/common/Avatar";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import {
  fetchAdminDashboard,
  selectDashboardError,
  selectDashboardLoading,
  selectDashboardOverview,
  selectDashboardRecentOrders,
  selectDashboardRecentUsers,
  selectDashboardSalesByMonth,
  selectDashboardStats,
  selectDashboardTopProducts,
} from "@/features/dashboard";
import { formatCurrency, formatDate } from "@/utils";
import { USER_STATUS } from "@/constants";

function trendFromApi(trend) {
  if (!trend) return undefined;
  return {
    positive: Boolean(trend.positive),
    value: `${Math.abs(Number(trend.value || 0))}%`,
    label: trend.label || "vs last month",
  };
}

export default function AdminDashboardView() {
  const dispatch = useDispatch();
  const overview = useSelector(selectDashboardOverview);
  const stats = useSelector(selectDashboardStats);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const salesByMonth = useSelector(selectDashboardSalesByMonth);
  const topProducts = useSelector(selectDashboardTopProducts);
  const recentOrders = useSelector(selectDashboardRecentOrders);
  const recentUsers = useSelector(selectDashboardRecentUsers);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  if (loading && !overview && !stats) {
    return <LoadingSpinner className="py-16" label="Loading dashboard..." />;
  }

  if (error && !overview && !stats) {
    return (
      <ErrorState
        title="Could not load dashboard"
        description={error}
        onRetry={() => dispatch(fetchAdminDashboard())}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back — here’s what’s happening in your store.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(overview?.totalRevenue || 0)}
          icon={BanknotesIcon}
          tone="green"
          trend={trendFromApi(overview?.trends?.revenue)}
        />
        <StatCard
          label="Total Orders"
          value={overview?.totalOrders || 0}
          icon={ShoppingCartIcon}
          tone="primary"
          trend={trendFromApi(overview?.trends?.orders)}
        />
        <StatCard
          label="Products"
          value={overview?.totalProducts || 0}
          icon={CubeIcon}
          tone="blue"
        />
        <StatCard
          label="Total Users"
          value={overview?.totalUsers || 0}
          icon={UsersIcon}
          tone="purple"
          trend={trendFromApi(overview?.trends?.users)}
        />
        <StatCard
          label="Pending"
          value={overview?.pendingOrders || 0}
          icon={ClockIcon}
          tone="yellow"
        />
        <StatCard
          label="Completed"
          value={overview?.deliveredOrders || 0}
          icon={CheckCircleIcon}
          tone="green"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Revenue Overview</h2>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>
          {salesByMonth.length === 0 ? (
            <EmptyState
              title="No revenue data"
              description="Orders will appear here once customers start checking out."
            />
          ) : (
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
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">
            Top Selling Products
          </h2>
          {topProducts.length === 0 ? (
            <EmptyState
              title="No sales yet"
              description="Top products will show once orders include items."
            />
          ) : (
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
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Orders Overview</h2>
        {salesByMonth.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Monthly order volume will appear after the first checkout."
          />
        ) : (
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
        )}
      </div>

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
          {recentOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No recent orders" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-3.5 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {order.orderNumber || order.id}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.customer?.name || "Customer"} ·{" "}
                        {formatDate(order.date)}
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
          )}
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
          {recentUsers.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No recent users" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentUsers.map((user) => (
                <li key={user.id}>
                  <Link
                    to={`/admin/users/${user.id}`}
                    className="flex items-center gap-3 px-6 py-3.5 transition hover:bg-slate-50"
                  >
                    <Avatar user={user} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {user.email}
                      </p>
                    </div>
                    <Badge
                      color={
                        user.status === USER_STATUS.ACTIVE ? "green" : "gray"
                      }
                      dot
                    >
                      {user.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
