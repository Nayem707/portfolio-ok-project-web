import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ClipboardDocumentIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import Breadcrumb from "@/components/common/Breadcrumb";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import { normalizeOrder } from "@/features/orders";
import { api } from "@/services/api";
import { formatCurrency, formatDate, getProductImage } from "@/utils";

const ORDER_NUMBER_PATTERN = /^ORD-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{10}$/;
const EXAMPLE_ORDER_NUMBER = "ORD-7K3M9X2QPA";

const toOrderNumber = (value) => {
  const cleaned = value.trim().toUpperCase().replace(/\s+/g, "");
  return /^[A-Z0-9]{10}$/.test(cleaned) ? `ORD-${cleaned}` : cleaned;
};

const getErrorMessage = (error) =>
  error?.response?.data?.error?.details?.[0]?.message ||
  error?.response?.data?.error?.message ||
  "Could not load this order. Please try again.";

export default function TrackOrderView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryNumber = searchParams.get("order") || "";

  const [input, setInput] = useState(queryNumber);
  const [inputError, setInputError] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const requestRef = useRef(0);

  useEffect(() => {
    if (!queryNumber) {
      setOrder(null);
      setLookupError(null);
      return;
    }
    const orderNumber = toOrderNumber(queryNumber);
    setInput(orderNumber);
    if (!ORDER_NUMBER_PATTERN.test(orderNumber)) {
      setOrder(null);
      setInputError(
        `Please enter a valid order number, e.g. ${EXAMPLE_ORDER_NUMBER}`,
      );
      return;
    }

    const requestId = ++requestRef.current;
    setLoading(true);
    setLookupError(null);
    setOrder(null);
    api
      .trackOrder(orderNumber)
      .then((data) => {
        if (requestId === requestRef.current) setOrder(normalizeOrder(data));
      })
      .catch((error) => {
        if (requestId !== requestRef.current) return;
        setLookupError({
          notFound: error?.response?.status === 404,
          message: getErrorMessage(error),
          orderNumber,
        });
      })
      .finally(() => {
        if (requestId === requestRef.current) setLoading(false);
      });
  }, [queryNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderNumber = toOrderNumber(input);
    if (!orderNumber) {
      setInputError("Please enter your order number");
      return;
    }
    if (!ORDER_NUMBER_PATTERN.test(orderNumber)) {
      setInputError(
        `Please enter a valid order number, e.g. ${EXAMPLE_ORDER_NUMBER}`,
      );
      return;
    }
    setInputError("");
    setInput(orderNumber);
    setSearchParams({ order: orderNumber });
  };

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      toast.success("Order number copied");
    } catch {
      toast.error("Could not copy order number");
    }
  };

  return (
    <div className="container-app py-8">
      <div className="mx-auto w-full max-w-7xl">
        <Breadcrumb items={[{ label: "Track Order" }]} />

        <section className="from-primary-600 to-primary-800 relative mt-6 overflow-hidden rounded-2xl bg-linear-to-br px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-white/5" />

          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-yellow-400 uppercase sm:text-sm">
              Order tracking
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Track your order
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Enter the order number from your order confirmation to see its
              latest status. No login required.
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start"
            >
              <div className="flex-1">
                <label htmlFor="track-order-number" className="sr-only">
                  Order number
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="track-order-number"
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (inputError) setInputError("");
                    }}
                    placeholder={`Order number, e.g. ${EXAMPLE_ORDER_NUMBER}`}
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={!!inputError}
                    aria-describedby={
                      inputError ? "track-order-error" : undefined
                    }
                    className="focus:ring-primary-300 h-12 w-full rounded-xl border-0 bg-white pr-4 pl-12 text-sm font-medium tracking-wide text-slate-800 uppercase shadow-sm outline-none placeholder:tracking-normal placeholder:text-slate-400 placeholder:normal-case focus:ring-4"
                  />
                </div>
                {inputError && (
                  <p
                    id="track-order-error"
                    className="mt-2 text-sm font-medium text-yellow-200"
                  >
                    {inputError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="light"
                size="lg"
                loading={loading}
                leftIcon={TruckIcon}
                className="h-12 shrink-0"
              >
                Track Order
              </Button>
            </form>
          </div>
        </section>

        <div className="mt-8">
          {loading && (
            <LoadingSpinner className="py-16" label="Finding your order..." />
          )}

          {!loading && lookupError && (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title={
                lookupError.notFound
                  ? "Order not found"
                  : "Could not track this order"
              }
              description={
                lookupError.notFound ? (
                  <>
                    We couldn’t find an order with the number{" "}
                    <span className="font-semibold whitespace-nowrap text-slate-700">
                      {lookupError.orderNumber}
                    </span>
                    . Please check the number and try again.
                  </>
                ) : (
                  lookupError.message
                )
              }
              action={
                <Button as={Link} to="/products" variant="outline">
                  Continue shopping
                </Button>
              }
            />
          )}

          {!loading && order && (
            <div className="space-y-4 sm:space-y-6">
              <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                    Order number
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-wide text-slate-900 sm:text-2xl">
                      {order.orderNumber}
                    </h2>
                    <button
                      type="button"
                      onClick={copyOrderNumber}
                      className="hover:text-primary-600 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
                      aria-label="Copy order number"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Placed on {formatDate(order.date)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusBadge
                    status={order.paymentStatus}
                    type="payment"
                  />
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div className="card p-4 sm:p-6">
                <h2 className="mb-4 font-semibold text-slate-900 sm:mb-6">
                  Order Status
                </h2>
                <OrderStatusTimeline status={order.status} />
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="card p-4 sm:p-6 lg:col-span-2">
                  <h2 className="font-semibold text-slate-900">
                    Products ({order.items.length})
                  </h2>
                  <ul className="mt-4 divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <li
                        key={`${item.id}-${idx}`}
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
                          <p className="text-xs text-slate-400">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                            {item.selectedColor && ` · ${item.selectedColor}`}
                            {item.selectedSize &&
                              ` · Size ${item.selectedSize}`}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 sm:text-base">
                          {formatCurrency(
                            item.subtotal || item.price * item.quantity,
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
                      <dt className="text-slate-500">Delivery charge</dt>
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
                  <div className="card p-4 sm:p-6">
                    <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                      <MapPinIcon className="text-primary-600 h-5 w-5" />
                      Shipping Address
                    </h2>
                    <div className="mt-3 space-y-0.5 text-sm text-slate-600">
                      <p className="font-medium text-slate-800">
                        {order.shipping.fullName}
                      </p>
                      {order.shipping.phone && <p>{order.shipping.phone}</p>}
                      <p>{order.shipping.address}</p>
                      <p>
                        {[order.shipping.city, order.shipping.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p>{order.shipping.country}</p>
                    </div>
                  </div>
                  <div className="card p-4 sm:p-6">
                    <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                      <CreditCardIcon className="text-primary-600 h-5 w-5" />
                      Payment
                    </h2>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-600">
                        {order.paymentMethod}
                      </span>
                      <OrderStatusBadge
                        status={order.paymentStatus}
                        type="payment"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
