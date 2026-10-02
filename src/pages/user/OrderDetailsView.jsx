import { useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import {
  fetchMyOrderById,
  selectCurrentOrder,
  selectOrderDetailsLoading,
  selectOrdersError,
} from "@/features/orders";
import {
  formatCurrency,
  formatDate,
  getDiscountedPrice,
  getProductImage,
} from "@/utils";

export default function OrderDetailsView() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrderDetailsLoading);
  const error = useSelector(selectOrdersError);
  const justPlaced = location.state?.justPlaced;

  useEffect(() => {
    if (id) {
      dispatch(fetchMyOrderById(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <LoadingSpinner className="py-16" label="Loading order details..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load order"
        description={error}
        onRetry={() => id && dispatch(fetchMyOrderById(id))}
      />
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="We couldn’t find this order in your account."
        action={
          <Button as={Link} to="/account/orders">
            Back to orders
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {justPlaced && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircleIcon className="h-8 w-8 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-800">
              Thank you for your order!
            </p>
            <p className="text-sm text-emerald-600">
              Your order has been placed and is being processed.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/account/orders"
            className="mb-1 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back to orders
          </Link>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Order {order.orderNumber || order.id}
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Placed on {formatDate(order.date)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-4 sm:p-6">
        <h2 className="mb-4 font-semibold text-slate-900 sm:mb-6">
          Order Tracking
        </h2>
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products */}
        <div className="card p-4 sm:p-6 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Products</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 py-3 sm:items-center sm:gap-4"
              >
                <img
                  src={getProductImage(
                    item,
                    "https://placehold.co/88x88?text=Item",
                  )}
                  alt={item.name}
                  className="h-14 w-14 rounded-lg border border-slate-100 object-cover sm:h-16 sm:w-16"
                />
                <div className="min-w-0 flex-1">
                  {item.productId ? (
                    <Link
                      to={`/products/${item.productId}`}
                      className="hover:text-primary-700 line-clamp-1 text-sm font-medium text-slate-800"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="line-clamp-1 text-sm font-medium text-slate-800">
                      {item.name}
                    </p>
                  )}
                  <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 sm:text-base">
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

        {/* Info */}
        <div className="space-y-6">
          <div className="card p-4 sm:p-6">
            <h2 className="font-semibold text-slate-900">Customer</h2>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p className="font-medium text-slate-800">
                {order.customer?.name || "N/A"}
              </p>
              <p>{order.customer?.email || "N/A"}</p>
            </div>
          </div>
          <div className="card p-4 sm:p-6">
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
          <div className="card p-4 sm:p-6">
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
