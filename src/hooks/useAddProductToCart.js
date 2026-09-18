import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { addToCart, requiresVariantSelection } from "@/features/cart";

/**
 * Shared add-to-cart flow for Products, Wishlist, and similar surfaces.
 * Opens the variant modal when color/size options exist but are not selected.
 */
export default function useAddProductToCart() {
  const dispatch = useDispatch();
  const [pendingProduct, setPendingProduct] = useState(null);

  const commitAdd = useCallback(
    (product, options = {}) => {
      const selectedColor = options.selectedColor ?? product.selectedColor ?? null;
      const selectedSize = options.selectedSize ?? product.selectedSize ?? null;
      const quantity = options.quantity ?? product.quantity ?? 1;

      dispatch(
        addToCart({
          ...product,
          quantity,
          selectedColor,
          selectedSize,
        }),
      );

      const variantLabel = [selectedColor, selectedSize]
        .filter(Boolean)
        .join(", ");
      toast.success(
        variantLabel
          ? `${product.name} (${variantLabel}) added to cart`
          : `${product.name} added to cart`,
        { position: "bottom-right" },
      );
      setPendingProduct(null);
    },
    [dispatch],
  );

  const requestAddToCart = useCallback(
    (product, options = {}) => {
      if (!product?.id) return;
      if (product.stock === 0) return;

      const selectedColor =
        options.selectedColor ?? product.selectedColor ?? null;
      const selectedSize = options.selectedSize ?? product.selectedSize ?? null;

      if (requiresVariantSelection(product, selectedColor, selectedSize)) {
        setPendingProduct(product);
        return;
      }

      commitAdd(product, { ...options, selectedColor, selectedSize });
    },
    [commitAdd],
  );

  const confirmVariantSelection = useCallback(
    ({ selectedColor, selectedSize }) => {
      if (!pendingProduct) return;
      commitAdd(pendingProduct, { selectedColor, selectedSize });
    },
    [commitAdd, pendingProduct],
  );

  const cancelVariantSelection = useCallback(() => {
    setPendingProduct(null);
  }, []);

  return {
    pendingProduct,
    variantModalOpen: Boolean(pendingProduct),
    requestAddToCart,
    confirmVariantSelection,
    cancelVariantSelection,
  };
}
