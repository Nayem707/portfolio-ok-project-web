import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  TrashIcon,
  HeartIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  TruckIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import QuantitySelector from "@/components/common/QuantitySelector";
import EmptyState from "@/components/common/EmptyState";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  selectCartItems,
  selectCartTotals,
  selectDeliveryRates,
  removeFromCart,
  setQuantity,
  updateCartItemOptions,
} from "@/features/cart";
import { toggleWishlist, selectWishlistItems } from "@/features/wishlist";
import { formatCurrency, getDiscountedPrice, resolveMediaUrl } from "@/utils";

const colorSwatches = {
  Black: "#111827",
  White: "#f8fafc",
  Navy: "#1d4ed8",
  Sand: "#d6b38c",
  Olive: "#6b7280",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Red: "#ef4444",
  Gray: "#9ca3af",
  Rose: "#f9a8d4",
  Blush: "#f5b4c5",
  Ivory: "#f5f5f4",
  Mocha: "#a16207",
  Cream: "#f5f5dc",
  Oak: "#a16207",
  Charcoal: "#374151",
  Natural: "#d6d3d1",
  Silver: "#cbd5e1",
  "Rose Gold": "#d97706",
};

export default function CartView() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const wishlist = useSelector(selectWishlistItems);
  const { subtotal } = useSelector(selectCartTotals);
  const deliveryRates = useSelector(selectDeliveryRates);

  const savings = items.reduce(
    (sum, i) =>
      sum + (i.price - getDiscountedPrice(i.price, i.discount)) * i.quantity,
    0,
  );
  if (items.length === 0) {
    return (
      <div className="container-app py-8">
        <div className="mx-auto w-full max-w-7xl">
          <Breadcrumb items={[{ label: "Cart" }]} />
          <div className="mt-8">
            <EmptyState
              icon={ShoppingBagIcon}
              title="Your cart is empty"
              description="Looks like you haven’t added anything yet. Let’s change that!"
              action={
                <Button as={Link} to="/products">
                  Start shopping
                </Button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mx-auto w-full max-w-7xl">
        <Breadcrumb items={[{ label: "Cart" }]} />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Shopping Cart <span className="text-slate-400">({items.length})</span>
        </h1>

        <div className="border-primary-100 bg-primary-50 text-primary-700 mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-4 py-3 text-sm">
          <TruckIcon className="h-5 w-5" />
          Delivery charge: Inside Dhaka{" "}
          <strong>{formatCurrency(deliveryRates.INSIDE_DHAKA)}</strong> ·
          Outside Dhaka{" "}
          <strong>{formatCurrency(deliveryRates.OUTSIDE_DHAKA)}</strong>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.itemKey || item.cartItemId || item.id}
                className="card flex flex-col gap-4 p-4 sm:flex-row"
              >
                <Link to={`/products/${item.id}`} className="shrink-0">
                  <img
                    src={resolveMediaUrl(item.image)}
                    alt={item.name}
                    className="h-28 w-full rounded-lg border border-slate-100 object-cover sm:w-28"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <span className="text-primary-600 text-xs font-medium">
                        {item.category}
                      </span>
                      <Link
                        to={`/products/${item.id}`}
                        className="hover:text-primary-700 mt-0.5 block font-semibold text-slate-800"
                      >
                        {item.name}
                      </Link>

                      <div className="mt-2 space-y-2">
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="flex flex-wrap items-center gap-2">
                            {item.selectedColor && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
                                <span
                                  className="h-2.5 w-2.5 rounded-full border border-slate-300"
                                  style={{
                                    backgroundColor:
                                      colorSwatches[item.selectedColor] ||
                                      item.selectedColor,
                                  }}
                                />
                                {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
                                Size: {item.selectedSize}
                              </span>
                            )}
                          </div>
                        )}

                        {Array.isArray(item.packageOptions) &&
                          item.packageOptions.length > 0 && (
                            <div className="border-primary-100 bg-primary-50/40 max-w-xs rounded-lg border p-2.5">
                              <span className="text-primary-700 flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase">
                                <CubeIcon className="h-3.5 w-3.5" /> Package
                                <span className="font-normal text-slate-400 normal-case">
                                  (optional)
                                </span>
                              </span>
                              <select
                                aria-label="Change package"
                                value={item.selectedPackageId || ""}
                                onChange={(e) =>
                                  dispatch(
                                    updateCartItemOptions({
                                      id: item.id,
                                      itemKey: item.itemKey,
                                      cartItemId: item.cartItemId,
                                      selectedColor: item.selectedColor,
                                      selectedSize: item.selectedSize,
                                      selectedPackageId: e.target.value,
                                    }),
                                  )
                                }
                                className="focus:border-primary-500 focus:ring-primary-100 mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:outline-none"
                              >
                                <option value="">
                                  No package —{" "}
                                  {formatCurrency(
                                    Number(item.productPrice ?? item.price),
                                  )}
                                </option>
                                {item.packageOptions.map((pkg) => (
                                  <option key={pkg.id} value={pkg.id}>
                                    {pkg.name} —{" "}
                                    {formatCurrency(
                                      Number(item.productPrice ?? 0) +
                                        Number(pkg.price),
                                    )}
                                  </option>
                                ))}
                              </select>
                              {Array.isArray(item.packageComponents) &&
                                item.packageComponents.length > 0 && (
                                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                                    <span className="font-medium text-slate-600">
                                      Includes:{" "}
                                    </span>
                                    {item.packageComponents
                                      .map((c) =>
                                        Number(c.quantity) > 1
                                          ? `${c.name} × ${c.quantity}`
                                          : c.name,
                                      )
                                      .join(", ")}
                                  </p>
                                )}
                            </div>
                          )}
                      </div>
                    </div>
                    <p className="font-bold text-slate-900">
                      {formatCurrency(
                        getDiscountedPrice(item.price, item.discount) *
                          item.quantity,
                      )}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <QuantitySelector
                      size="sm"
                      value={item.quantity}
                      onChange={(q) =>
                        dispatch(
                          setQuantity({
                            id: item.id,
                            color: item.selectedColor,
                            size: item.selectedSize,
                            itemKey: item.itemKey,
                            quantity: q,
                          }),
                        )
                      }
                      max={item.stock}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={async () => {
                          const wasWishlisted = wishlist.some(
                            (entry) => entry.id === item.id,
                          );
                          try {
                            await dispatch(toggleWishlist(item)).unwrap();
                            toast.success(
                              wasWishlisted
                                ? "Removed from wishlist"
                                : "Added to wishlist",
                              { position: "bottom-right" },
                            );
                          } catch (err) {
                            toast.error(err || "Failed to update wishlist", {
                              position: "bottom-right",
                            });
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                      >
                        <HeartIcon className="h-4 w-4" /> Save
                      </button>
                      <button
                        onClick={() => {
                          dispatch(
                            removeFromCart({
                              id: item.id,
                              color: item.selectedColor,
                              size: item.selectedSize,
                              itemKey: item.itemKey,
                              cartItemId: item.cartItemId,
                            }),
                          );
                          toast.success("Removed from cart");
                        }}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              as={Link}
              to="/products"
              variant="ghost"
              leftIcon={ArrowLeftIcon}
            >
              Continue shopping
            </Button>
          </div>

          {/* Summary */}
          <aside className="h-fit lg:sticky lg:top-32">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Order Summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-medium text-slate-800">
                    {formatCurrency(subtotal)}
                  </dd>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <dt>Discount savings</dt>
                    <dd className="font-medium">−{formatCurrency(savings)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500">Delivery charge</dt>
                  <dd className="font-medium text-slate-800">
                    Added at checkout
                  </dd>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <dt className="text-base font-semibold text-slate-900">
                      Total
                    </dt>
                    <dd className="text-xl font-bold text-slate-900">
                      {formatCurrency(subtotal)}
                    </dd>
                  </div>
                  <p className="mt-1 text-right text-xs text-slate-400">
                    Excluding delivery charge
                  </p>
                </div>
              </dl>
              <Button
                as={Link}
                to="/checkout"
                fullWidth
                size="lg"
                className="mt-5"
              >
                Proceed to Checkout
              </Button>
              <p className="mt-3 text-center text-xs text-slate-400">
                Secure checkout · Easy returns
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
