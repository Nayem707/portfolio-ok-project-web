import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  TrashIcon,
  HeartIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import QuantitySelector from "@/components/common/QuantitySelector";
import EmptyState from "@/components/common/EmptyState";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  selectCartItems,
  selectCartTotals,
  removeFromCart,
  setQuantity,
} from "@/features/cart";
import { toggleWishlist } from "@/features/wishlist";
import { formatCurrency, getDiscountedPrice } from "@/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/constants";

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
  const { subtotal, shipping, total } = useSelector(selectCartTotals);

  const savings = items.reduce(
    (sum, i) =>
      sum + (i.price - getDiscountedPrice(i.price, i.discount)) * i.quantity,
    0,
  );
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="container-app py-8">
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
    );
  }

  return (
    <div className="container-app py-8">
      <Breadcrumb items={[{ label: "Cart" }]} />
      <h1 className="mt-6 text-2xl font-bold text-slate-900">
        Shopping Cart <span className="text-slate-400">({items.length})</span>
      </h1>

      {remaining > 0 && (
        <div className="border-primary-100 bg-primary-50 text-primary-700 mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <TruckIcon className="h-5 w-5" />
          Add <strong>{formatCurrency(remaining)}</strong> more to qualify for
          free shipping!
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="card flex flex-col gap-4 p-4 sm:flex-row"
            >
              <Link to={`/products/${item.id}`} className="shrink-0">
                <img
                  src={item.image}
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
                    {(item.selectedColor || item.selectedSize) && (
                      <div className="mt-2 flex flex-wrap gap-2">
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
                      onClick={() => {
                        dispatch(toggleWishlist(item));
                        dispatch(
                          removeFromCart({
                            id: item.id,
                            color: item.selectedColor,
                            size: item.selectedSize,
                            itemKey: item.itemKey,
                          }),
                        );
                        toast.success("Moved to wishlist");
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
                <dt className="text-slate-500">Shipping</dt>
                <dd className="font-medium text-slate-800">
                  {shipping === 0 ? "Free" : formatCurrency(shipping)}
                </dd>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <dt className="text-base font-semibold text-slate-900">
                    Total
                  </dt>
                  <dd className="text-xl font-bold text-slate-900">
                    {formatCurrency(total)}
                  </dd>
                </div>
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
  );
}
