import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  HeartIcon,
  ShoppingBagIcon,
  BoltIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/solid";
import Breadcrumb from "@/components/common/Breadcrumb";
import Rating from "@/components/common/Rating";
import PriceDisplay from "@/components/common/PriceDisplay";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import QuantitySelector from "@/components/common/QuantitySelector";
import SectionHeader from "@/components/common/SectionHeader";
import ProductGrid from "@/components/product/ProductGrid";
import EmptyState from "@/components/common/EmptyState";
import useAuth from "@/hooks/useAuth";
import { selectProducts } from "@/features/products";
import { addToCart } from "@/features/cart";
import { toggleWishlist, selectWishlistItems } from "@/features/wishlist";
import { classNames } from "@/utils";

export default function ProductDetailsView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  const products = useSelector(selectProducts);
  const wishlist = useSelector(selectWishlistItems);

  const product = products.find((p) => p.id === id);
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
  const productColors = useMemo(() => {
    const colors = product?.availableColors?.length
      ? product.availableColors
      : product?.category === "Fashion" ||
          product?.category === "Sports & Outdoors"
        ? ["Black", "White", "Navy", "Sand", "Olive"]
        : ["Black", "White", "Silver", "Rose Gold"];

    return colors.map((color) => ({
      name: color,
      value: colorSwatches[color] || color,
    }));
  }, [product]);
  const productSizes = useMemo(() => {
    if (product?.availableSizes?.length) return product.availableSizes;
    if (
      product?.category === "Fashion" ||
      product?.category === "Sports & Outdoors"
    ) {
      return ["XS", "S", "M", "L", "XL"];
    }
    return ["Standard"];
  }, [product]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    productColors[0] || "Black",
  );
  const [selectedSize, setSelectedSize] = useState(
    productSizes[0] || "Standard",
  );
  const [visibleReviews, setVisibleReviews] = useState(6);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [customReviews, setCustomReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [showWhatsappAttention, setShowWhatsappAttention] = useState(false);

  useEffect(() => {
    setSelectedColor(productColors[0] || "Black");
    setSelectedSize(productSizes[0] || "Standard");
    setQuantity(1);
  }, [product?.id, productColors, productSizes]);

  useEffect(() => {
    setShowWhatsappAttention(false);
    const timer = setTimeout(() => {
      setShowWhatsappAttention(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id]);

  if (!product) {
    return (
      <div className="container-app py-16">
        <EmptyState
          title="Product not found"
          description="The product you’re looking for doesn’t exist or has been removed."
          action={
            <Button as={Link} to="/products">
              Back to products
            </Button>
          }
        />
      </div>
    );
  }

  const isWishlisted = wishlist.some((i) => i.id === product.id);
  const outOfStock = product.stock === 0;
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const seededReviews = useMemo(() => {
    const reviewers = [
      { name: "Alex Morgan", avatar: "https://i.pravatar.cc/80?img=12" },
      { name: "Jordan Lee", avatar: "https://i.pravatar.cc/80?img=32" },
      { name: "Casey Nguyen", avatar: "https://i.pravatar.cc/80?img=47" },
      { name: "Riley Patel", avatar: "https://i.pravatar.cc/80?img=8" },
      { name: "Taylor Brooks", avatar: "https://i.pravatar.cc/80?img=5" },
      { name: "Maya Chen", avatar: "https://i.pravatar.cc/80?img=24" },
      { name: "Noah Kim", avatar: "https://i.pravatar.cc/80?img=33" },
      { name: "Liam Scott", avatar: "https://i.pravatar.cc/80?img=41" },
    ];
    const comments = [
      `Great quality and exactly as described. Highly recommend this ${product.category.toLowerCase()} product.`,
      "Build quality feels premium and delivery was fast.",
      "Worth the price. I have been using it daily with no issues.",
      "Looks even better in person and performs well.",
      "Packaging was neat and product condition was perfect.",
      "Really happy with this purchase. Will buy again.",
      "Good value for money and reliable so far.",
      "Comfortable to use and the finish is excellent.",
    ];

    return reviewers.map((reviewer, idx) => ({
      id: `${product.id}-seed-${idx + 1}`,
      productId: product.id,
      author: reviewer.name,
      avatar: reviewer.avatar,
      rating: Math.max(4, Math.min(5, Math.round(product.rating))),
      comment: comments[idx],
      date: new Date(Date.now() - (idx + 2) * 86400000)
        .toISOString()
        .slice(0, 10),
    }));
  }, [product.id, product.category, product.rating]);

  const productReviews = [...customReviews, ...seededReviews];
  const visibleReviewItems = productReviews.slice(0, visibleReviews);

  useEffect(() => {
    setVisibleReviews(6);
    setCustomReviews([]);
    setIsReviewModalOpen(false);
    setReviewForm({ rating: 5, comment: "" });
  }, [product.id]);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        ...product,
        quantity,
        selectedColor,
        selectedSize,
      }),
    );
    toast.success(
      `${product.name} (${selectedColor}, ${selectedSize}) added to cart`,
      {
        position: "bottom-right",
      },
    );
  };

  const handleBuyNow = () => {
    dispatch(
      addToCart({
        ...product,
        quantity,
        selectedColor,
        selectedSize,
      }),
    );
    navigate("/checkout");
  };

  const showGalleryControls = product.images.length > 1;

  const goToPrevImage = () => {
    setActiveImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const goToNextImage = () => {
    setActiveImage((prev) => (prev + 1) % product.images.length);
  };

  const submitReview = () => {
    const comment = reviewForm.comment.trim();
    if (!comment) {
      toast.error("Please write your review before submitting", {
        position: "bottom-right",
      });
      return;
    }

    const newReview = {
      id: `${product.id}-custom-${Date.now()}`,
      productId: product.id,
      author: user?.name || "Guest User",
      avatar: user?.avatar || "https://i.pravatar.cc/80?img=15",
      rating: reviewForm.rating,
      comment,
      date: new Date().toISOString().slice(0, 10),
    };

    setCustomReviews((prev) => [newReview, ...prev]);
    setReviewForm({ rating: 5, comment: "" });
    setIsReviewModalOpen(false);
    setVisibleReviews((prev) => Math.max(prev, 6));
    toast.success("Review submitted", { position: "bottom-right" });
  };

  const currentProductUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}${location.search}${location.hash}`
      : "";
  const whatsappNumber = "8801962801817";
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi! I am interested in this product: ${currentProductUrl}`,
  )}`;

  return (
    <div className="container-app py-8">
      <Breadcrumb
        items={[
          { label: "Products", to: "/products" },
          {
            label: product.category,
            to: `/products?category=${product.category}`,
          },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
            {showGalleryControls && (
              <>
                <button
                  type="button"
                  onClick={goToPrevImage}
                  className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNextImage}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </>
            )}
            {product.discount > 0 && (
              <Badge color="red" className="absolute top-4 left-4">
                -{Math.round(product.discount)}% OFF
              </Badge>
            )}
          </div>
          {showGalleryControls && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={classNames(
                    "h-20 w-20 overflow-hidden rounded-lg border-2 transition",
                    activeImage === idx
                      ? "border-primary-600"
                      : "border-slate-200",
                  )}
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-primary-600 text-sm font-medium">
            {product.category}
          </span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4">
            <Rating
              value={product.rating}
              reviews={product.reviews}
              size="md"
            />
            <span className="text-sm text-slate-400">SKU: {product.sku}</span>
          </div>

          <div className="mt-5">
            <PriceDisplay
              price={product.price}
              discount={product.discount}
              size="xl"
            />
          </div>

          <p className="mt-5 leading-relaxed text-slate-600">
            {product.description}
          </p>

          <div className="mt-5 flex items-center gap-2">
            {outOfStock ? (
              <Badge color="red" dot>
                Out of stock
              </Badge>
            ) : product.stock < 15 ? (
              <Badge color="yellow" dot>
                Only {product.stock} left in stock
              </Badge>
            ) : (
              <Badge color="green" dot>
                In stock
              </Badge>
            )}
          </div>

          {productColors.length > 0 && (
            <div className="mt-6">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Color
              </span>
              <div className="flex flex-wrap gap-3">
                {productColors.map((colorOption) => {
                  const isSelected = selectedColor === colorOption.name;
                  return (
                    <button
                      key={colorOption.name}
                      type="button"
                      onClick={() => setSelectedColor(colorOption.name)}
                      aria-label={colorOption.name}
                      title={colorOption.name}
                      className={classNames(
                        "relative h-9 w-9 rounded-full border-2 transition-all duration-200",
                        isSelected
                          ? "ring-primary-200 scale-105 ring-2"
                          : "border-slate-200 hover:border-slate-400",
                      )}
                      style={{ backgroundColor: colorOption.value }}
                    >
                      {isSelected && (
                        <span className="absolute inset-1 rounded-full border-2 border-white/90" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {productSizes.length > 0 && (
            <div className="mt-6">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Size
              </span>
              <div className="flex flex-wrap gap-2">
                {productSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={classNames(
                      "rounded-full border px-3 py-1.5 text-sm transition",
                      selectedSize === size
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">
                Quantity
              </span>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={product.stock}
              />
            </div>
          )}

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 sm:flex sm:flex-wrap">
            <Button
              size="lg"
              leftIcon={ShoppingBagIcon}
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="min-w-0 justify-center px-4 py-2.5 text-sm whitespace-nowrap sm:flex-1 sm:px-5 sm:py-3 sm:text-base"
            >
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="accent"
              leftIcon={BoltIcon}
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="min-w-0 justify-center px-4 py-2.5 text-sm whitespace-nowrap sm:flex-1 sm:px-5 sm:py-3 sm:text-base"
            >
              Buy Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                dispatch(toggleWishlist(product));
                toast.success(
                  isWishlisted ? "Removed from wishlist" : "Added to wishlist",
                  {
                    position: "bottom-right",
                  },
                );
              }}
              className={classNames(
                "shrink-0 px-3 py-2.5 sm:px-5 sm:py-3",
                isWishlisted && "border-red-200 text-red-500",
              )}
            >
              {isWishlisted ? (
                <HeartSolid className="h-5 w-5" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Perks */}
          <div className="mt-8 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
            {[
              { icon: TruckIcon, label: "Free shipping over $150" },
              { icon: ArrowPathIcon, label: "30-day easy returns" },
              { icon: ShieldCheckIcon, label: "Secure checkout" },
            ].map((perk) => (
              <div
                key={perk.label}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <perk.icon className="text-primary-600 h-5 w-5" />
                {perk.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product information */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Product Information
          </h3>
          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            {[
              ["Category", product.category],
              ["SKU", product.sku],
              [
                "Availability",
                outOfStock ? "Out of stock" : `${product.stock} in stock`,
              ],
              ["Rating", `${product.rating} / 5`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">Highlights</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            {[
              "Premium quality materials and craftsmanship",
              "Backed by our satisfaction guarantee",
              "Ships within 1–2 business days",
              "Trusted by thousands of happy customers",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related products */}
      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between gap-3">
          <SectionHeader
            title="Customer Reviews"
            subtitle={`Real feedback for ${product.name}`}
          />
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReviewModalOpen(true)}
            >
              Write a Review
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {visibleReviewItems.map((review) => (
            <article key={review.id} className="card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {review.author}
                    </p>
                    <p className="text-xs text-slate-400">{review.date}</p>
                  </div>
                </div>
                <Rating value={review.rating} showValue={false} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {review.comment}
              </p>
            </article>
          ))}
        </div>

        {visibleReviews < productReviews.length && (
          <div className="mt-5 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setVisibleReviews((prev) => prev + 3)}
            >
              Show More
            </Button>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeader title="Related Products" />
          <ProductGrid products={related} />
        </section>
      )}

      <Modal
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Write a Review"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitReview}>Submit Review</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Product</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {product.name}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Rating</p>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setReviewForm((prev) => ({ ...prev, rating: star }))
                  }
                  className="rounded p-1"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <StarIcon
                    className={classNames(
                      "h-6 w-6 transition",
                      star <= reviewForm.rating
                        ? "text-amber-400"
                        : "text-slate-200",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Review
            </label>
            <textarea
              id="review-comment"
              rows={4}
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="Share your experience with this product"
              className="input-base resize-none"
            />
          </div>
        </div>
      </Modal>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share this product on WhatsApp"
        className={classNames(
          "fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 sm:right-6 sm:h-14 sm:w-14",
          showWhatsappAttention && "animate-whatsapp-attention",
        )}
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19.05 4.91A9.82 9.82 0 0012.03 2a9.93 9.93 0 00-8.6 14.92L2 22l5.27-1.38a9.94 9.94 0 004.75 1.21h.01a9.97 9.97 0 007.02-16.92zm-7.03 15.24h-.01a8.3 8.3 0 01-4.22-1.15l-.3-.18-3.13.82.84-3.05-.2-.31A8.26 8.26 0 0112.02 3.7a8.3 8.3 0 010 16.45zm4.55-6.19c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.16.25-.64.81-.78.98-.15.16-.3.19-.55.06-.25-.12-1.07-.39-2.03-1.24-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.38.11-.5.12-.11.25-.3.37-.45.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.07-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03 0 1.2.87 2.35.99 2.52.12.16 1.72 2.63 4.18 3.69.58.25 1.03.4 1.39.52.58.18 1.1.15 1.51.09.46-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z" />
        </svg>
      </a>
    </div>
  );
}
