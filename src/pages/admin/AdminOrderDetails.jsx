import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import EmptyState from "@/components/common/EmptyState";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import {
  selectOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/store/slices/orderSlice";
import { formatCurrency, formatDate, getDiscountedPrice } from "@/utils";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/constants";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const order = useSelector(selectOrders).find((o) => o.id === id);

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        action={
          <Button as={Link} to="/admin/orders">
            Back to orders
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate("/admin/orders")}
            className="mb-2 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back to orders
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Order {order.id}
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Placed on {formatDate(order.date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Status controls */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900">Manage Order</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Select
            label="Order status"
            value={order.status}
            onChange={(e) => {
              dispatch(
                updateOrderStatus({ id: order.id, status: e.target.value }),
              );
              toast.success(`Order marked as ${e.target.value}`);
            }}
          >
            {Object.values(ORDER_STATUS).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Select
            label="Payment status"
            value={order.paymentStatus}
            onChange={(e) => {
              dispatch(
                updatePaymentStatus({
                  id: order.id,
                  paymentStatus: e.target.value,
                }),
              );
              toast.success(`Payment marked as ${e.target.value}`);
            }}
          >
            {Object.values(PAYMENT_STATUS).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div className="mt-6">
          <OrderStatusTimeline status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Products</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 rounded-lg border border-slate-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    Qty: {item.quantity} ×{" "}
                    {formatCurrency(
                      getDiscountedPrice(item.price, item.discount),
                    )}
                  </p>
                </div>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(
                    getDiscountedPrice(item.price, item.discount) *
                      item.quantity,
                  )}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="text-slate-800">
                {formatCurrency(order.subtotal)}
              </dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <dt>Discount</dt>
                <dd>−{formatCurrency(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">Shipping</dt>
              <dd className="text-slate-800">
                {order.shippingCost === 0
                  ? "Free"
                  : formatCurrency(order.shippingCost)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
              <dt>Total</dt>
              <dd>{formatCurrency(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900">Customer</h2>
            <div className="mt-3 text-sm text-slate-600">
              <p className="font-medium text-slate-800">
                {order.customer.name}
              </p>
              <p>{order.customer.email}</p>
              <Link
                to={`/admin/users/${order.customer.id}`}
                className="text-primary-600 hover:text-primary-700 mt-2 inline-block text-sm font-medium"
              >
                View customer →
              </Link>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900">Shipping Address</h2>
            <div className="mt-3 space-y-0.5 text-sm text-slate-600">
              <p className="font-medium text-slate-800">
                {order.shipping.fullName}
              </p>
              <p>{order.shipping.phone}</p>
              <p>{order.shipping.address}</p>
              <p>
                {order.shipping.city}, {order.shipping.postalCode}
              </p>
              <p>{order.shipping.country}</p>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900">Payment</h2>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">{order.paymentMethod}</span>
              <OrderStatusBadge status={order.paymentStatus} type="payment" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
