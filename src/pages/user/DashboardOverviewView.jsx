import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  HeartIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import StatCard from "@/components/common/StatCard";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { selectCurrentUser } from "@/features/auth";
import {
  fetchMyOrders,
  selectMyOrders,
  selectOrdersError,
  selectOrdersLoading,
} from "@/features/orders";
import { selectWishlistItems } from "@/features/wishlist";
import { formatCurrency, formatDate } from "@/utils";
import { ORDER_STATUS } from "@/constants";

export default function DashboardOverviewView() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const orders = useSelector(selectMyOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const wishlist = useSelector(selectWishlistItems);

  useEffect(() => {
    dispatch(fetchMyOrders({ page: 1, limit: 4 }));
  }, [dispatch]);

  const pending = orders.filter((o) =>
    [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.SHIPPED,
    ].includes(o.status),
  ).length;
  const completed = orders.filter(
    (o) => o.status === ORDER_STATUS.DELIVERED,
  ).length;

  const recent = orders.slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here’s a quick overview of your account activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={ClipboardDocumentListIcon}
          tone="primary"
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
        <StatCard
          label="Wishlist"
          value={wishlist.length}
          icon={HeartIcon}
          tone="purple"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Recent Orders</h2>
          <Link
            to="/account/orders"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
          >
            View all <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner className="py-10" label="Loading recent orders..." />
        ) : error ? (
          <div className="p-6">
            <ErrorState
              title="Could not load recent orders"
              description={error}
              onRetry={() => dispatch(fetchMyOrders({ page: 1, limit: 4 }))}
            />
          </div>
        ) : recent.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No orders yet"
              description="When you place an order, it will appear here."
              action={
                <Link
                  to="/products"
                  className="text-primary-600 text-sm font-medium"
                >
                  Start shopping →
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/account/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        order.items[0]?.image ||
                        "https://placehold.co/88x88?text=Item"
                      }
                      alt=""
                      className="h-11 w-11 rounded-lg border border-slate-100 object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {order.orderNumber || order.id}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(order.date)} · {order.items.length} item(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="hidden font-semibold text-slate-800 sm:block">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
