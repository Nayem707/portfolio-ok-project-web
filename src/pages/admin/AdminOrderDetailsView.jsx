import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import Avatar from "@/components/common/Avatar";
import {
  fetchAdminOrderById,
  selectCurrentOrder,
  selectOrderDetailsLoading,
  selectOrderUpdatingStatus,
  selectOrdersError,
  updateAdminOrderStatus,
} from "@/features/orders";
import {
  formatCurrency,
  formatDate,
  getDiscountedPrice,
  getProductImage,
} from "@/utils";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/constants";

export default function AdminOrderDetailsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrderDetailsLoading);
  const updating = useSelector(selectOrderUpdatingStatus);
  const error = useSelector(selectOrdersError);
  const [pendingCancelStatus, setPendingCancelStatus] = useState(null);

  useEffect(() => {
    if (id) dispatch(fetchAdminOrderById(id));
  }, [dispatch, id]);

  const applyStatusUpdate = async ({ status, paymentStatus }) => {
    try {
      await dispatch(
        updateAdminOrderStatus({
          id,
          status,
          paymentStatus,
        }),
      ).unwrap();
      toast.success(
        paymentStatus && paymentStatus !== order?.paymentStatus
          ? `Payment marked as ${paymentStatus}`
          : `Order marked as ${status}`,
      );
    } catch (err) {
      toast.error(err || "Failed to update order");
    }
  };

  const handleStatusChange = (nextStatus) => {
    if (!order) return;
    if (
      nextStatus === ORDER_STATUS.CANCELLED &&
      order.status !== ORDER_STATUS.CANCELLED
    ) {
      setPendingCancelStatus(nextStatus);
      return;
    }
    applyStatusUpdate({
      status: nextStatus,
      paymentStatus: order.paymentStatus,
    });
  };

  const handlePaymentChange = (nextPayment) => {
    if (!order) return;
    applyStatusUpdate({
      status: order.status,
      paymentStatus: nextPayment,
    });
  };

  if (loading && (!order || order.id !== id)) {
    return <LoadingSpinner className="py-16" label="Loading order..." />;
  }

  if (error && (!order || order.id !== id)) {
    return (
      <ErrorState
        title="Could not load order"
        description={error}
        onRetry={() => id && dispatch(fetchAdminOrderById(id))}
      />
    );
  }

  if (!order || order.id !== id) {
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
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="mb-2 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back to orders
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Order {order.orderNumber || order.id}
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mt-6 border-b border-slate-100 pb-6">
            <OrderStatusTimeline status={order.status} />
          </div>

          <h2 className="mt-6 font-semibold text-slate-900">Products</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <li
                key={`${item.productId || item.id}-${idx}`}
                className="flex items-center gap-4 py-3"
              >
                <img
                  src={getProductImage(
                    item,
                    "https://placehold.co/88x88?text=Item",
                  )}
                  alt={item.name}
                  className="h-14 w-14 rounded-lg border border-slate-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-slate-800">
                    {item.name}
                  </p>
                  {(item.selectedColor || item.selectedSize) && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {[item.selectedColor, item.selectedSize]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
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
            <h2 className="font-semibold text-slate-900">Manage Order</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Select
                label="Order status"
                value={order.status}
                disabled={updating}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {Object.values(ORDER_STATUS).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
              <Select
                label="Payment status"
                value={order.paymentStatus}
                disabled={updating}
                onChange={(e) => handlePaymentChange(e.target.value)}
              >
                {Object.values(PAYMENT_STATUS).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </div>
          </div>
          {order.status === ORDER_STATUS.CANCELLED && (
            <div className="card border-red-200 p-6">
              <h2 className="font-semibold text-red-700">Cancellation</h2>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Cancelled by</dt>
                  <dd className="text-slate-800">
                    {order.cancelledBy === "CUSTOMER"
                      ? "Customer"
                      : order.cancelledBy === "ADMIN"
                        ? "Admin"
                        : "Not recorded"}
                  </dd>
                </div>
                {order.cancelledAt && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Date</dt>
                    <dd className="text-slate-800">
                      {formatDate(order.cancelledAt)}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-slate-500">Reason</dt>
                  <dd className="mt-0.5 break-words text-slate-800">
                    {order.cancelReason || "No reason given"}
                  </dd>
                </div>
              </dl>
              {order.needsManualRefund && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  Payment was collected. Refund the customer manually, then set
                  payment status to Refunded.
                </p>
              )}
            </div>
          )}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900">Customer</h2>
            <div className="mt-3 flex items-start gap-3 text-sm text-slate-600">
              <Avatar name={order.customer?.name} size="md" />
              <div>
                <p className="font-medium text-slate-800">
                  {order.customer?.name}
                </p>
                <p>{order.customer?.email}</p>
                {order.isGuest && (
                  <p className="mt-1">
                    Guest checkout · {order.shipping?.phone}
                  </p>
                )}
                {order.customer?.id && (
                  <Link
                    to={`/admin/users/${order.customer.id}`}
                    className="text-primary-600 hover:text-primary-700 mt-2 inline-block text-sm font-medium"
                  >
                    View customer →
                  </Link>
                )}
              </div>
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
                {order.shipping.city}
                {order.shipping.postalCode
                  ? `, ${order.shipping.postalCode}`
                  : ""}
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

      <ConfirmDialog
        open={Boolean(pendingCancelStatus)}
        onClose={() => setPendingCancelStatus(null)}
        title="Cancel this order?"
        message="Cancelling restores product stock for this order. This cannot be undone from the UI."
        confirmText="Cancel order"
        cancelText="Keep order"
        loading={updating}
        onConfirm={async () => {
          const next = pendingCancelStatus;
          setPendingCancelStatus(null);
          await applyStatusUpdate({
            status: next,
            paymentStatus: order.paymentStatus,
          });
        }}
      />
    </div>
  );
}
