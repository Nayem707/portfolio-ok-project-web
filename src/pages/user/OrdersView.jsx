import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  EyeIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import Tabs from "@/components/common/Tabs";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import {
  fetchMyOrders,
  selectMyOrders,
  selectMyOrdersMeta,
  selectOrdersError,
  selectOrdersLoading,
} from "@/features/orders";
import { formatCurrency, formatDate } from "@/utils";

const filters = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrdersView() {
  const dispatch = useDispatch();
  const orders = useSelector(selectMyOrders);
  const meta = useSelector(selectMyOrdersMeta);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const [active, setActive] = useState("All");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const status = active === "All" ? undefined : active.toUpperCase();
    dispatch(fetchMyOrders({ page, limit, status }));
  }, [dispatch, active, page]);

  useEffect(() => {
    setPage(1);
  }, [active]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track and manage all your orders.
        </p>
      </div>

      <Tabs tabs={filters} active={active} onChange={setActive} />

      {loading ? (
        <LoadingSpinner className="py-16" label="Loading your orders..." />
      ) : error ? (
        <ErrorState
          title="Could not load orders"
          description={error}
          onRetry={() => {
            const status = active === "All" ? undefined : active.toUpperCase();
            dispatch(fetchMyOrders({ page, limit, status }));
          }}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ClipboardDocumentListIcon}
          title="No orders here"
          description="You don’t have any orders in this category yet."
          action={
            <Button as={Link} to="/products">
              Shop now
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {order.orderNumber || order.id}
                  </p>
                  <p className="text-xs text-slate-400">
                    Placed on {formatDate(order.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge
                    status={order.paymentStatus}
                    type="payment"
                  />
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 4).map((item, idx) =>
                    item.image ? (
                      <img
                        key={`${item.id}-${idx}`}
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg border-2 border-white object-cover"
                      />
                    ) : (
                      <span
                        key={`${item.id}-${idx}`}
                        className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-slate-100 text-[10px] font-medium text-slate-500"
                      >
                        {item.name?.slice(0, 2)?.toUpperCase() || "PR"}
                      </span>
                    ),
                  )}
                  {order.items.length > 4 && (
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-slate-100 text-xs font-medium text-slate-500">
                      +{order.items.length - 4}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="font-bold text-slate-900">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                  <Button
                    as={Link}
                    to={`/account/orders/${order.id}`}
                    variant="outline"
                    size="sm"
                    leftIcon={EyeIcon}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Pagination
            page={meta?.page || page}
            totalPages={meta?.totalPages || 1}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
