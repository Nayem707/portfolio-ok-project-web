import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  EyeIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import Tabs from "@/components/common/Tabs";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import { selectCurrentUser } from "@/store/auth";
import { selectOrders } from "@/store/orders";
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
  const user = useSelector(selectCurrentUser);
  const allOrders = useSelector(selectOrders);
  const [active, setActive] = useState("All");

  const orders = allOrders.filter((o) => o.customer?.id === user?.id);
  const filtered =
    active === "All" ? orders : orders.filter((o) => o.status === active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track and manage all your orders.
        </p>
      </div>

      <Tabs tabs={filters} active={active} onChange={setActive} />

      {filtered.length === 0 ? (
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
          {filtered.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {order.id}
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
                  {order.items.slice(0, 4).map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg border-2 border-white object-cover"
                    />
                  ))}
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
        </div>
      )}
    </div>
  );
}
