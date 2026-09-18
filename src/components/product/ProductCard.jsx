import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  CheckIcon,
  HeartIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import Rating from "@/components/common/Rating";
import PriceDisplay from "@/components/common/PriceDisplay";
import Badge from "@/components/common/Badge";
import AddToCartVariantModal from "@/components/product/AddToCartVariantModal";
import {
  selectIsProductAddPending,
  selectIsProductInCart,
} from "@/features/cart";
import { toggleWishlist, selectWishlistItems } from "@/features/wishlist";
import useAddProductToCart from "@/hooks/useAddProductToCart";
import { classNames } from "@/utils";

export default function ProductCard({ product, lockWhenInCart = false }) {
  const dispatch = useDispatch();
  const wishlist = useSelector(selectWishlistItems);
  const inCart = useSelector(selectIsProductInCart(product.id));
  const addPending = useSelector(selectIsProductAddPending(product.id));
  const isWishlisted = wishlist.some((i) => i.id === product.id);
  const outOfStock = product.stock === 0;
  const cartLocked = lockWhenInCart && (inCart || addPending);
  const {
    pendingProduct,
    variantModalOpen,
    requestAddToCart,
    confirmVariantSelection,
    cancelVariantSelection,
  } = useAddProductToCart();

  const handleAddToCart = () => {
    if (outOfStock || cartLocked) return;
    requestAddToCart(product);
  };

  const handleWishlist = async () => {
    try {
      await dispatch(toggleWishlist(product)).unwrap();
      toast.success(
        isWishlisted ? "Removed from wishlist" : "Added to wishlist",
        {
          position: "bottom-right",
        },
      );
    } catch (error) {
      toast.error(error || "Failed to update wishlist", {
        position: "bottom-right",
      });
    }
  };

  return (
    <>
      <div className="group shadow-card hover:shadow-card-hover relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5">
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <Link to={`/products/${product.id}`}>
            <img
              src={product.images?.[0] || product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.discount > 0 && (
              <Badge color="red">-{Math.round(product.discount)}%</Badge>
            )}
            {product.newArrival && <Badge color="green">New</Badge>}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className={classNames(
              "absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105",
              isWishlisted ? "text-red-500" : "text-slate-500",
            )}
            aria-label="Toggle wishlist"
          >
            {isWishlisted ? (
              <HeartSolid className="h-5 w-5" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </button>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
                Out of stock
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <span className="text-primary-600 text-xs font-medium">
            {product.category}
          </span>
          <Link to={`/products/${product.id}`} className="mt-1">
            <h3 className="hover:text-primary-700 line-clamp-2 text-sm font-semibold text-slate-800 transition">
              {product.name}
            </h3>
          </Link>
          <div className="mt-2">
            <Rating value={product.rating} reviews={product.reviews} />
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <PriceDisplay
              price={product.price}
              discount={product.discount}
              hideDecimals
            />
            {lockWhenInCart && cartLocked && !outOfStock ? (
              <button
                type="button"
                disabled
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/80"
                aria-label="Added to cart"
                title="Added to cart"
              >
                <CheckIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Added</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock || cartLocked}
                className="bg-primary-600 hover:bg-primary-700 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Add to cart"
              >
                <ShoppingBagIcon className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <AddToCartVariantModal
        open={variantModalOpen}
        product={pendingProduct}
        onClose={cancelVariantSelection}
        onConfirm={confirmVariantSelection}
      />
    </>
  );
}
