import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  HeartIcon,
  ShoppingBagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Breadcrumb from "@/components/common/Breadcrumb";
import Badge from "@/components/common/Badge";
import PriceDisplay from "@/components/common/PriceDisplay";
import AddToCartVariantModal from "@/components/product/AddToCartVariantModal";
import { resolveMediaUrl } from "@/utils";
import {
  selectWishlistItems,
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from "@/features/wishlist";
import useAddProductToCart from "@/hooks/useAddProductToCart";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";

export default function WishlistView() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);
  const loading = useSelector((state) => state.wishlist.loading);
  const mutating = useSelector((state) => state.wishlist.mutating);
  const error = useSelector((state) => state.wishlist.error);
  const {
    pendingProduct,
    variantModalOpen,
    requestAddToCart,
    confirmVariantSelection,
    cancelVariantSelection,
  } = useAddProductToCart();

  if (loading) {
    return (
      <LoadingSpinner className="py-16" label="Loading your wishlist..." />
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="container-app py-8">
        <ErrorState
          title="Could not load wishlist"
          description={error}
          onRetry={() => dispatch(fetchWishlist())}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-8">
        <Breadcrumb items={[{ label: "Wishlist" }]} />
        <div className="mt-8">
          <EmptyState
            icon={HeartIcon}
            title="Your wishlist is empty"
            description="Save items you love and find them all here later."
            action={
              <Button as={Link} to="/products">
                Discover products
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <Breadcrumb items={[{ label: "Wishlist" }]} />
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          My Wishlist <span className="text-slate-400">({items.length})</span>
        </h1>
        <Button
          variant="ghost"
          className="text-red-500"
          onClick={async () => {
            try {
              await dispatch(clearWishlist()).unwrap();
              toast.success("Wishlist cleared");
            } catch (err) {
              toast.error(err || "Failed to clear wishlist");
            }
          }}
          disabled={mutating}
        >
          Clear all
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const outOfStock = item.stock === 0;
          return (
            <div key={item.id} className="card flex gap-4 p-4">
              <Link to={`/products/${item.id}`} className="shrink-0">
                <img
                  src={resolveMediaUrl(item.image)}
                  alt={item.name}
                  className="h-24 w-24 rounded-lg border border-slate-100 object-cover"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  to={`/products/${item.id}`}
                  className="hover:text-primary-700 line-clamp-2 text-sm font-semibold text-slate-800"
                >
                  {item.name}
                </Link>
                <div className="mt-1">
                  {outOfStock ? (
                    <Badge color="red">Out of stock</Badge>
                  ) : (
                    <Badge color="green">In stock</Badge>
                  )}
                </div>
                <div className="mt-2">
                  <PriceDisplay
                    price={item.price}
                    discount={item.discount}
                    size="sm"
                  />
                </div>
                <div className="mt-auto flex items-center gap-2 pt-3">
                  <Button
                    size="sm"
                    leftIcon={ShoppingBagIcon}
                    disabled={outOfStock}
                    onClick={() => requestAddToCart(item)}
                  >
                    Add to cart
                  </Button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await dispatch(removeFromWishlist(item.id)).unwrap();
                        toast.success("Removed from wishlist", {
                          position: "bottom-right",
                        });
                      } catch (err) {
                        toast.error(err || "Failed to remove from wishlist", {
                          position: "bottom-right",
                        });
                      }
                    }}
                    disabled={mutating}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove"
                  >
                    <TrashIcon className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddToCartVariantModal
        open={variantModalOpen}
        product={pendingProduct}
        onClose={cancelVariantSelection}
        onConfirm={confirmVariantSelection}
      />
    </div>
  );
}
