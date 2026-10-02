import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronDownIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import Breadcrumb from "@/components/common/Breadcrumb";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import { toOrderStatusLabel } from "@/constants";
import { normalizeOrder } from "@/features/orders";
import { api } from "@/services/api";
import {
  classNames,
  formatCurrency,
  formatDate,
  getProductImage,
} from "@/utils";

const MOBILE_MESSAGE = "Please enter a valid mobile number, e.g. 01712345678";

/** "+880 1712-345678", "8801712345678", "01712 345678", "1712345678" → "01712345678". */
const normalizeMobile = (value) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(2);
  else if (digits.length === 10 && digits.startsWith("1"))
    digits = `0${digits}`;
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
};

const getErrorMessage = (error) =>
  error?.response?.data?.error?.details?.[0]?.message ||
  error?.response?.data?.error?.message ||
  "Could not load your orders. Please try again.";

function TrackedOrderDetails({ order }) {
  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      toast.success("Order number copied");
    } catch {
      toast.error("Could not copy order number");
    }
  };

  return (
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
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
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
                    {item.selectedSize && ` · Size ${item.selectedSize}`}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900 sm:text-base">
                  {formatCurrency(item.subtotal || item.price * item.quantity)}
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
              Delivery
            </h2>
            <div className="mt-3 space-y-0.5 text-sm text-slate-600">
              <p className="font-medium text-slate-800">
                {order.shipping.fullName}
              </p>
              {order.shipping.phone && <p>{order.shipping.phone}</p>}
              <p>
                {[order.shipping.city, order.shipping.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
          <div className="card p-4 sm:p-6">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <CreditCardIcon className="text-primary-600 h-5 w-5" />
              Payment
            </h2>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">{order.paymentMethod}</span>
              <OrderStatusBadge status={order.paymentStatus} type="payment" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderView() {
  const [phone, setPhone] = useState("");
  const [inputError, setInputError] = useState("");
  const [searchedPhone, setSearchedPhone] = useState("");
  const [orderList, setOrderList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const requestRef = useRef(0);
  const detailRequestRef = useRef(0);
  const detailCacheRef = useRef(new Map());

  const selectOrder = (orderNumber, mobile = searchedPhone) => {
    setSelectedNumber(orderNumber);
    setDetailError("");
    const requestId = ++detailRequestRef.current;

    const cached = detailCacheRef.current.get(orderNumber);
    if (cached) {
      setOrder(cached);
      setDetailLoading(false);
      return;
    }

    setOrder(null);
    setDetailLoading(true);
    api
      .trackOrderDetails(mobile, orderNumber)
      .then((data) => {
        const details = normalizeOrder(data);
        detailCacheRef.current.set(orderNumber, details);
        if (requestId === detailRequestRef.current) setOrder(details);
      })
      .catch((error) => {
        if (requestId === detailRequestRef.current)
          setDetailError(getErrorMessage(error));
      })
      .finally(() => {
        if (requestId === detailRequestRef.current) setDetailLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setInputError("Please enter your mobile number");
      return;
    }
    const mobile = normalizeMobile(phone);
    if (!mobile) {
      setInputError(MOBILE_MESSAGE);
      return;
    }
    setInputError("");

    const requestId = ++requestRef.current;
    ++detailRequestRef.current;
    detailCacheRef.current.clear();
    setLoading(true);
    setLookupError("");
    setOrderList(null);
    setSelectedNumber("");
    setOrder(null);
    setDetailError("");
    setDetailLoading(false);
    api
      .trackOrders(mobile)
      .then((data) => {
        if (requestId !== requestRef.current) return;
        const found = data || [];
        setSearchedPhone(mobile);
        setOrderList(found);
        if (found.length === 1) selectOrder(found[0].orderNumber, mobile);
      })
      .catch((error) => {
        if (requestId === requestRef.current)
          setLookupError(getErrorMessage(error));
      })
      .finally(() => {
        if (requestId === requestRef.current) setLoading(false);
      });
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
              Enter the mobile number you used at checkout to see your orders
              and their latest status. No login required.
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start"
            >
              <div className="flex-1">
                <label htmlFor="track-order-phone" className="sr-only">
                  Mobile Number
                </label>
                <div className="relative">
                  <PhoneIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="track-order-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (inputError) setInputError("");
                    }}
                    placeholder="Mobile Number, e.g. 01712345678"
                    autoComplete="tel"
                    aria-invalid={!!inputError}
                    aria-describedby={
                      inputError ? "track-order-error" : undefined
                    }
                    className="focus:ring-primary-300 h-12 w-full rounded-xl border-0 bg-white pr-4 pl-12 text-sm font-medium tracking-wide text-slate-800 shadow-sm outline-none placeholder:tracking-normal placeholder:text-slate-400 focus:ring-4"
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

            {orderList?.length > 0 && (
              <div className="mt-4">
                <label
                  htmlFor="track-order-select"
                  className="text-sm font-medium text-white/90"
                >
                  Select order{" "}
                  <span className="text-white/60">
                    ({orderList.length}{" "}
                    {orderList.length === 1 ? "order" : "orders"} found)
                  </span>
                </label>
                <div className="relative mt-2">
                  <ClipboardDocumentListIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <select
                    id="track-order-select"
                    value={selectedNumber}
                    onChange={(e) => selectOrder(e.target.value)}
                    className={classNames(
                      "focus:ring-primary-300 h-12 w-full cursor-pointer appearance-none rounded-xl border-0 bg-white pr-10 pl-12 text-sm font-medium tracking-wide shadow-sm outline-none focus:ring-4",
                      selectedNumber ? "text-slate-800" : "text-slate-400",
                    )}
                  >
                    <option value="" disabled>
                      Select an order number
                    </option>
                    {orderList.map((o) => (
                      <option
                        key={o.orderNumber}
                        value={o.orderNumber}
                        className="text-slate-800"
                      >
                        {o.orderNumber} | {formatDate(o.createdAt)} |{" "}
                        {toOrderStatusLabel(o.status)}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mt-8">
          {loading && (
            <LoadingSpinner className="py-16" label="Finding your orders..." />
          )}

          {!loading && lookupError && (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="Could not track your orders"
              description={lookupError}
            />
          )}

          {!loading && orderList?.length === 0 && (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="No orders found"
              description="We couldn’t find any orders for this mobile number. Please check the number you used at checkout and try again."
              action={
                <Button as={Link} to="/products" variant="outline">
                  Continue shopping
                </Button>
              }
            />
          )}

          {!loading && orderList?.length > 0 && !selectedNumber && (
            <EmptyState
              icon={ClipboardDocumentListIcon}
              title="Select an order to see its details"
              description={`We found ${orderList.length} ${
                orderList.length === 1 ? "order" : "orders"
              } for this mobile number. Choose an order number above to see its status, items and delivery details.`}
            />
          )}

          {selectedNumber && detailLoading && (
            <LoadingSpinner
              className="py-16"
              label="Loading order details..."
            />
          )}

          {selectedNumber && !detailLoading && detailError && (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="Could not load this order"
              description={detailError}
              action={
                <Button
                  variant="outline"
                  onClick={() => selectOrder(selectedNumber)}
                >
                  Try again
                </Button>
              }
            />
          )}

          {selectedNumber && !detailLoading && order && (
            <TrackedOrderDetails order={order} />
          )}
        </div>
      </div>
    </div>
  );
}
