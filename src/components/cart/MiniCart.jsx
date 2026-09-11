import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import {
  selectCartItems,
  selectCartTotals,
  removeFromCart,
} from "@/features/cart";
import { toggleMiniCart } from "@/features/ui";
import { formatCurrency, getDiscountedPrice } from "@/utils";

export default function MiniCart({ open }) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const { subtotal } = useSelector(selectCartTotals);
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

  const close = () => dispatch(toggleMiniCart(false));

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/40"
        onClick={close}
        aria-hidden="true"
      />
      <aside className="animate-slide-in-right fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <ShoppingBagIcon className="h-5 w-5" /> Your Cart ({items.length})
          </h3>
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close cart"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={ShoppingBagIcon}
              title="Your cart is empty"
              description="Start adding products you love."
              action={
                <Button as={Link} to="/products" onClick={close}>
                  Browse products
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div
                  key={item.itemKey || item.cartItemId || item.id}
                  className="flex gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-slate-800">
                      {item.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                      <span>Qty {item.quantity}</span>
                      {(item.selectedColor || item.selectedSize) && (
                        <>
                          <span className="text-slate-300">•</span>
                          {item.selectedColor && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500">
                              <span
                                className="h-2 w-2 rounded-full border border-slate-300"
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
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500">
                              {item.selectedSize}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        getDiscountedPrice(item.price, item.discount) *
                          item.quantity,
                      )}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await dispatch(
                          removeFromCart({
                            id: item.id,
                            color: item.selectedColor,
                            size: item.selectedSize,
                            itemKey: item.itemKey,
                            cartItemId: item.cartItemId,
                          }),
                        ).unwrap();
                      } catch (error) {
                        toast.error(error || "Failed to remove item");
                      }
                    }}
                    className="self-start rounded p-1 text-slate-300 hover:text-red-500"
                    aria-label="Remove"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 p-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="space-y-2">
                <Button
                  as={Link}
                  to="/cart"
                  fullWidth
                  variant="outline"
                  onClick={close}
                >
                  View Cart
                </Button>
                <Button as={Link} to="/checkout" fullWidth onClick={close}>
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
