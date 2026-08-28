import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import {
  selectCartItems,
  selectCartTotals,
  removeFromCart,
} from "@/store/slices/cartSlice";
import { toggleMiniCart } from "@/store/slices/uiSlice";
import { formatCurrency, getDiscountedPrice } from "@/utils";

export default function MiniCart({ open }) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const { subtotal } = useSelector(selectCartTotals);

  const close = () => dispatch(toggleMiniCart(false));

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/40"
        onClick={close}
        aria-hidden="true"
      />
      <aside className="animate-fade-in fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
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
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-slate-800">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Qty {item.quantity}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        getDiscountedPrice(item.price, item.discount) *
                          item.quantity,
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
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
