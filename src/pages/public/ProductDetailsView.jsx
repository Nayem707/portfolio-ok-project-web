import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  HeartIcon,
  ShoppingBagIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilSquareIcon,
  PhoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import WhatsAppIcon from "@/components/common/WhatsAppIcon";
import { SHOP_CONTACT, SHOP_PHONE_HREF, SHOP_WHATSAPP_URL } from "@/constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/solid";
import Breadcrumb from "@/components/common/Breadcrumb";
import Rating from "@/components/common/Rating";
import PriceDisplay from "@/components/common/PriceDisplay";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import QuantitySelector from "@/components/common/QuantitySelector";
import {
  SECTION_BANNER_ACTION_CLASS,
  SectionBanner,
} from "@/pages/public/home/section/ProductShowcaseSection";
import ProductGrid from "@/components/product/ProductGrid";
import ErrorState from "@/components/common/ErrorState";
import Skeleton from "@/components/common/Skeleton";
import Avatar from "@/components/common/Avatar";
import RichTextContent from "@/components/common/RichTextContent";
import useAuth from "@/hooks/useAuth";
import {
  clearCurrentProduct,
  fetchProductByIdOrSlug,
  selectCurrentProduct,
  selectProductDetailsError,
  selectProductDetailsLoading,
} from "@/features/products";
import { fetchColors, selectColors } from "@/features/colors";
import {
  fetchPublicHomepage,
  selectHomePageHydrated,
  selectHomePageSections,
} from "@/features/homepage";
import PerksSection from "@/pages/public/home/section/PerksSection";
import { addToCart, getMissingVariantLabels } from "@/features/cart";
import { toggleWishlist, selectWishlistItems } from "@/features/wishlist";
import {
  classNames,
  getProductImage,
  isRichTextEmpty,
  range,
  resolveMediaUrl,
  toRichTextHtml,
} from "@/utils";
import { api } from "@/services/api";

const MAX_VISIBLE_THUMBS = 5;

function ProductDetailsSkeleton() {
  return (
    <div className="container-app py-8" aria-busy="true" aria-live="polite">
      <div className="mx-auto w-full max-w-7xl">
        <Skeleton className="h-4 w-48" />
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <Skeleton className="aspect-square w-full" rounded="rounded-2xl" />
            <div className="mt-4 flex gap-3">
              {range(4).map((i) => (
                <Skeleton key={i} className="h-20 w-20" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-6 w-28" />
            <div className="flex gap-3 pt-2">
              {range(4).map((i) => (
                <Skeleton key={i} className="h-9 w-9" rounded="rounded-full" />
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              {range(4).map((i) => (
                <Skeleton key={i} className="h-10 w-14" />
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 w-28" />
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  const product = useSelector(selectCurrentProduct);
  const productLoading = useSelector(selectProductDetailsLoading);
  const productError = useSelector(selectProductDetailsError);
  const colors = useSelector(selectColors);
  const wishlist = useSelector(selectWishlistItems);
  const homeSections = useSelector(selectHomePageSections);
  const homeHydrated = useSelector(selectHomePageHydrated);
  const [related, setRelated] = useState([]);
  const [primaryImageReady, setPrimaryImageReady] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [variantError, setVariantError] = useState("");
  const [visibleReviews, setVisibleReviews] = useState(6);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [editingReviewId, setEditingReviewId] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showWhatsappAttention, setShowWhatsappAttention] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imageCount = Math.max(product?.images?.length || 0, 1);
  const thumbsRef = useRef(null);
  const [thumbScroll, setThumbScroll] = useState({ prev: false, next: false });

  const updateThumbScroll = useCallback(() => {
    const el = thumbsRef.current;
    if (!el) return;
    setThumbScroll({
      prev: el.scrollLeft > 1,
      next: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  const scrollThumbs = (direction) => {
    const el = thumbsRef.current;
    if (el)
      el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    updateThumbScroll();
    window.addEventListener("resize", updateThumbScroll);
    return () => window.removeEventListener("resize", updateThumbScroll);
  }, [updateThumbScroll, primaryImageReady, imageCount]);

  useEffect(() => {
    const el = thumbsRef.current;
    const thumb = el?.children[activeImage];
    if (!thumb) return;
    if (thumb.offsetLeft < el.scrollLeft) {
      el.scrollTo({ left: thumb.offsetLeft, behavior: "smooth" });
    } else if (
      thumb.offsetLeft + thumb.offsetWidth >
      el.scrollLeft + el.clientWidth
    ) {
      const firstVisible = Math.max(0, activeImage - (MAX_VISIBLE_THUMBS - 1));
      el.scrollTo({
        left: el.children[firstVisible].offsetLeft,
        behavior: "smooth",
      });
    }
  }, [activeImage]);

  const matchesRoute =
    !!product && !!id && (product.id === id || product.slug === id);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!homeHydrated) dispatch(fetchPublicHomepage());
  }, [dispatch, homeHydrated]);

  useEffect(() => {
    if (!id) return;
    setPrimaryImageReady(false);
    setActiveImage(0);
    setLightboxOpen(false);
    setRelated([]);
    setReviews([]);
    dispatch(fetchProductByIdOrSlug(id));
    dispatch(fetchColors());
  }, [dispatch, id]);

  useEffect(() => {
    if (!matchesRoute) {
      setPrimaryImageReady(false);
      return;
    }

    const primarySrc =
      product.images?.[0] ||
      product.image ||
      "https://placehold.co/800x800?text=Product";

    let cancelled = false;
    const img = new Image();
    const markReady = () => {
      if (!cancelled) setPrimaryImageReady(true);
    };

    img.onload = markReady;
    img.onerror = markReady;
    img.src = primarySrc;
    if (img.complete) markReady();

    return () => {
      cancelled = true;
    };
  }, [matchesRoute, product]);

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
    const names = product?.colors?.length ? product.colors : [];
    return names.map((color) => ({
      name: color,
      value:
        colorSwatches[color] ||
        colors.find((item) => item.name === color)?.hex ||
        color,
    }));
  }, [product, colors]);
  const productSizes = useMemo(
    () => (product?.sizes?.length ? product.sizes : []),
    [product],
  );

  useEffect(() => {
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
    setVariantError("");
  }, [product?.id]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowLeft")
        setActiveImage((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
      else if (e.key === "ArrowRight")
        setActiveImage((prev) => (prev + 1) % imageCount);
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen, imageCount]);

  useEffect(() => {
    setShowWhatsappAttention(false);
    const timer = setTimeout(() => {
      setShowWhatsappAttention(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (!product?.id || !product?.categoryId) {
      setRelated([]);
      return;
    }

    let mounted = true;
    const loadRelated = async () => {
      try {
        const response = await api.getProducts({
          page: 1,
          limit: 8,
          category: product.categoryId,
        });
        if (!mounted) return;
        const items = response?.data || [];
        setRelated(items.filter((item) => item.id !== product.id).slice(0, 4));
      } catch {
        if (mounted) setRelated([]);
      }
    };

    loadRelated();

    return () => {
      mounted = false;
    };
  }, [product?.id, product?.categoryId]);

  useEffect(() => {
    if (!product?.id) return;
    setVisibleReviews(6);
    setIsReviewModalOpen(false);
    setReviewForm({ rating: 5, comment: "" });
    setEditingReviewId("");
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) return;
    let mounted = true;

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError("");
      try {
        const response = await api.getPublicProductReviews(product.id);
        if (!mounted) return;
        setReviews(
          (response || []).map((review) => ({
            id: review.id,
            author: review.user?.name || "Anonymous",
            avatarUrl: review.user?.avatarUrl || null,
            rating: review.rating,
            comment: review.comment || "",
            date: review.createdAt,
            userId: review.userId,
          })),
        );
      } catch (error) {
        if (!mounted) return;
        setReviewsError(
          error?.response?.data?.error?.message || "Failed to load reviews",
        );
      } finally {
        if (mounted) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      mounted = false;
    };
  }, [product?.id]);

  if (productError && !matchesRoute && !productLoading) {
    return (
      <div className="container-app py-8">
        <div className="mx-auto w-full max-w-7xl">
          <ErrorState
            title="Could not load product"
            description={productError}
            onRetry={() => id && dispatch(fetchProductByIdOrSlug(id))}
          />
        </div>
      </div>
    );
  }

  // Show card skeleton whenever the route product is not fully ready —
  // including while Product B loads after Product A was shown.
  if (!matchesRoute || productLoading || !primaryImageReady) {
    return <ProductDetailsSkeleton />;
  }

  const isWishlisted = wishlist.some((i) => i.id === product.id);
  const outOfStock = product.stock === 0;
  const highlights = (
    Array.isArray(product.shortDescription) ? product.shortDescription : []
  )
    .map((point) => (typeof point === "string" ? point.trim() : ""))
    .filter(Boolean)
    .slice(0, 5);
  const hasDescription = !isRichTextEmpty(toRichTextHtml(product.description));
  const productReviews = reviews;
  const visibleReviewItems = productReviews.slice(0, visibleReviews);

  const handleAddToCart = () => {
    const missing = getMissingVariantLabels(
      product,
      selectedColor,
      selectedSize,
    );
    if (missing.length) {
      setVariantError(`Please select ${missing.join(" and ")}`);
      toast.error(`Please select ${missing.join(" and ")}`, {
        position: "bottom-right",
      });
      return;
    }

    dispatch(
      addToCart({
        ...product,
        quantity,
        selectedColor,
        selectedSize,
      }),
    );
    setVariantError("");
    const variantLabel = [selectedColor, selectedSize]
      .filter(Boolean)
      .join(", ");
    toast.success(
      variantLabel
        ? `${product.name} (${variantLabel}) added to cart`
        : `${product.name} added to cart`,
      {
        position: "bottom-right",
      },
    );
  };

  const handleBuyNow = () => {
    const missing = getMissingVariantLabels(
      product,
      selectedColor,
      selectedSize,
    );
    if (missing.length) {
      setVariantError(`Please select ${missing.join(" and ")}`);
      toast.error(`Please select ${missing.join(" and ")}`, {
        position: "bottom-right",
      });
      return;
    }

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

  const imageList = (
    product.images?.length
      ? product.images
      : [product.image || "https://placehold.co/800x800?text=Product"]
  ).map((img) => resolveMediaUrl(img) || img);
  const showGalleryControls = imageList.length > 1;

  const goToPrevImage = () => {
    setActiveImage((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setActiveImage((prev) => (prev + 1) % imageList.length);
  };

  const submitReview = async () => {
    const comment = reviewForm.comment.trim();
    if (!comment) {
      toast.error("Please write your review before submitting", {
        position: "bottom-right",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      if (editingReviewId) {
        await api.updateMyReview(editingReviewId, {
          rating: reviewForm.rating,
          comment,
        });
        toast.success("Review updated", { position: "bottom-right" });
      } else {
        await api.createProductReview(product.id, {
          rating: reviewForm.rating,
          comment,
        });
        toast.success("Review submitted", { position: "bottom-right" });
      }

      const refreshed = await api.getPublicProductReviews(product.id);
      setReviews(
        (refreshed || []).map((review) => ({
          id: review.id,
          author: review.user?.name || "Anonymous",
          avatarUrl: review.user?.avatarUrl || null,
          rating: review.rating,
          comment: review.comment || "",
          date: review.createdAt,
          userId: review.userId,
        })),
      );

      setReviewForm({ rating: 5, comment: "" });
      setIsReviewModalOpen(false);
      setEditingReviewId("");
      setVisibleReviews((prev) => Math.max(prev, 6));
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message || "Failed to submit review",
        {
          position: "bottom-right",
        },
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.deleteMyReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      toast.success("Review deleted", { position: "bottom-right" });
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message || "Failed to delete review",
        {
          position: "bottom-right",
        },
      );
    }
  };

  const currentProductUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}${location.search}${location.hash}`
      : "";
  const whatsappHref = `${SHOP_WHATSAPP_URL}?text=${encodeURIComponent(
    `Hi! I am interested in this product: ${currentProductUrl}`,
  )}`;

  return (
    <div
      key={product.id}
      className="container-app py-8 transition-opacity duration-300 ease-out"
    >
      <div className="mx-auto w-full max-w-7xl">
        <Breadcrumb
          items={[
            { label: "Products", to: "/products" },
            {
              label: product.categoryTitle || product.category,
              to: `/products?category=${encodeURIComponent(product.categorySlug || product.categoryId)}`,
            },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Gallery */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group block w-full cursor-zoom-in focus:outline-none"
                aria-label="View full size image"
              >
                <img
                  src={imageList[activeImage]}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition duration-200 group-hover:bg-slate-900/25 group-hover:opacity-100 group-focus-visible:bg-slate-900/25 group-focus-visible:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur">
                    <EyeIcon className="h-6 w-6" />
                  </span>
                </span>
              </button>
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
              <div className="relative mt-4">
                <div
                  ref={thumbsRef}
                  onScroll={updateThumbScroll}
                  className="no-scrollbar relative flex snap-x snap-mandatory gap-3 overflow-x-auto"
                >
                  {imageList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      aria-label={`Show image ${idx + 1}`}
                      className={classNames(
                        "aspect-square w-[calc((100%-3rem)/5)] shrink-0 snap-start overflow-hidden rounded-lg border-2 transition",
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
                {imageList.length > MAX_VISIBLE_THUMBS && (
                  <>
                    <button
                      type="button"
                      onClick={() => scrollThumbs(-1)}
                      disabled={!thumbScroll.prev}
                      className="absolute top-1/2 left-1 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0"
                      aria-label="Previous thumbnails"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollThumbs(1)}
                      disabled={!thumbScroll.next}
                      className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0"
                      aria-label="Next thumbnails"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-primary-600 text-sm font-medium">
                  {product.categoryTitle || product.category}
                </span>
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
              <button
                type="button"
                onClick={async () => {
                  try {
                    await dispatch(toggleWishlist(product)).unwrap();
                    toast.success(
                      isWishlisted
                        ? "Removed from wishlist"
                        : "Added to wishlist",
                      {
                        position: "bottom-right",
                      },
                    );
                  } catch (error) {
                    toast.error(error || "Failed to update wishlist", {
                      position: "bottom-right",
                    });
                  }
                }}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                aria-pressed={isWishlisted}
                className={classNames(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition hover:shadow",
                  isWishlisted
                    ? "border-red-200 text-red-500 hover:bg-red-50"
                    : "border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500",
                )}
              >
                {isWishlisted ? (
                  <HeartSolid className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
              </button>
            </div>
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
                baseCurrency={product.baseCurrency || "BDT"}
                size="xl"
                amountClassName="text-primary-600"
              />
            </div>

            {highlights.length > 0 && (
              <div className="mt-5">
                <ul
                  aria-label="Highlights"
                  className="space-y-2.5 text-sm text-slate-600"
                >
                  {highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                        onClick={() => {
                          setSelectedColor(colorOption.name);
                          setVariantError("");
                        }}
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
                      onClick={() => {
                        setSelectedSize(size);
                        setVariantError("");
                      }}
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

            {variantError && (
              <p className="mt-4 text-sm text-red-600">{variantError}</p>
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

            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
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
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                href={SHOP_PHONE_HREF}
                className="border-primary-200 bg-primary-50 hover:bg-primary-100 flex items-center gap-3 rounded-xl border px-4 py-3 transition"
              >
                <span className="bg-primary-600 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white">
                  <PhoneIcon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-slate-500">
                    Call to order
                  </span>
                  <span className="text-primary-700 block text-sm font-bold">
                    {SHOP_CONTACT.phone}
                  </span>
                </span>
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-3 transition hover:bg-[#25D366]/20"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-slate-500">
                    Order on WhatsApp
                  </span>
                  <span className="block text-sm font-bold text-[#128C7E]">
                    {SHOP_CONTACT.whatsapp}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>

        {homeSections.perks?.active !== false && (
          <PerksSection
            perks={homeSections.perks?.items || []}
            className="mt-12 overflow-hidden rounded-xl"
          />
        )}

        {hasDescription && (
          <div className="card mt-8 p-6 md:p-10 lg:p-12">
            <h3 className="text-lg font-semibold text-slate-900">
              Description
            </h3>
            <RichTextContent
              value={product.description}
              className="mt-4 text-sm leading-relaxed text-slate-600"
            />
          </div>
        )}

        {/* Related products */}
        <section className="mt-12">
          <SectionBanner
            title="Customer Reviews"
            subtitle={`Real feedback for ${product.name}`}
            icon={ChatBubbleLeftRightIcon}
            action={
              isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingReviewId("");
                    setReviewForm({ rating: 5, comment: "" });
                    setIsReviewModalOpen(true);
                  }}
                  className={SECTION_BANNER_ACTION_CLASS}
                >
                  Write a Review
                  <span className="text-primary-700 flex h-6 w-6 items-center justify-center rounded-full bg-white">
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                  </span>
                </button>
              )
            }
          />

          {reviewsLoading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading reviews...
            </div>
          ) : reviewsError ? (
            <div className="py-10 text-center text-sm text-red-600">
              {reviewsError}
            </div>
          ) : productReviews.length === 0 ? (
            <div className="border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
              No reviews yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visibleReviewItems.map((review) => {
                const isMine = isAuthenticated && review.userId === user?.id;
                return (
                  <article key={review.id} className="card p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={resolveMediaUrl(review.avatarUrl)}
                          name={review.author}
                          size="md"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {review.author}
                          </p>
                          <p className="text-xs text-slate-400">
                            {review.date}
                          </p>
                        </div>
                      </div>
                      <Rating value={review.rating} showValue={false} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {review.comment}
                    </p>
                    {isMine && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReviewId(review.id);
                            setReviewForm({
                              rating: review.rating,
                              comment: review.comment,
                            });
                            setIsReviewModalOpen(true);
                          }}
                          className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

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
            <SectionBanner
              key={getProductImage(related[0])}
              title="Related Products"
              subtitle={`More from ${product.categoryTitle || product.category}`}
              image={getProductImage(related[0])}
              to={`/products?category=${encodeURIComponent(product.categorySlug || product.categoryId)}`}
            />
            <ProductGrid products={related} />
          </section>
        )}
      </div>

      {lightboxOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} image viewer`}
            className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 sm:p-10"
            onClick={() => setLightboxOpen(false)}
          >
            <img
              src={imageList[activeImage]}
              alt={product.name}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Close image viewer"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            {showGalleryControls && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                  className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:left-6"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:right-6"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                  {activeImage + 1} / {imageList.length}
                </span>
              </>
            )}
          </div>,
          document.body,
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
            <Button onClick={submitReview} loading={submittingReview}>
              {editingReviewId ? "Update Review" : "Submit Review"}
            </Button>
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
        aria-label="Ask about this product on WhatsApp"
        className={classNames(
          "fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 sm:right-6 sm:h-14 sm:w-14",
          showWhatsappAttention && "animate-whatsapp-attention",
        )}
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
      >
        <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" />
      </a>
    </div>
  );
}
