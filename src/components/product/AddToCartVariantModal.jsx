import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import PriceDisplay from "@/components/common/PriceDisplay";
import {
  getMissingVariantLabels,
  getProductColorOptions,
  getProductSizeOptions,
} from "@/features/cart";
import { classNames } from "@/utils";

const COLOR_SWATCHES = {
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

export default function AddToCartVariantModal({
  open,
  product,
  onClose,
  onConfirm,
}) {
  const colorOptions = useMemo(
    () => getProductColorOptions(product),
    [product],
  );
  const sizeOptions = useMemo(() => getProductSizeOptions(product), [product]);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedColor(null);
    setSelectedSize(null);
    setError("");
  }, [open, product?.id]);

  if (!product) return null;

  const handleConfirm = () => {
    const missing = getMissingVariantLabels(
      product,
      selectedColor,
      selectedSize,
    );
    if (missing.length) {
      setError(`Please select ${missing.join(" and ")}`);
      return;
    }
    onConfirm?.({
      selectedColor: selectedColor || null,
      selectedSize: selectedSize || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select options"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Add to cart</Button>
        </>
      }
    >
      <div className="flex gap-4">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          className="h-20 w-20 shrink-0 rounded-lg border border-slate-100 object-cover"
        />
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-slate-800">
            {product.name}
          </p>
          <div className="mt-1">
            <PriceDisplay
              price={product.price}
              discount={product.discount}
              size="sm"
            />
          </div>
        </div>
      </div>

      {colorOptions.length > 0 && (
        <div className="mt-5">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Color
          </span>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((colorName) => {
              const isSelected = selectedColor === colorName;
              return (
                <button
                  key={colorName}
                  type="button"
                  onClick={() => {
                    setSelectedColor(colorName);
                    setError("");
                  }}
                  aria-label={colorName}
                  title={colorName}
                  className={classNames(
                    "relative h-9 w-9 rounded-full border-2 transition-all duration-200",
                    isSelected
                      ? "ring-primary-200 scale-105 ring-2"
                      : "border-slate-200 hover:border-slate-400",
                  )}
                  style={{
                    backgroundColor: COLOR_SWATCHES[colorName] || colorName,
                  }}
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

      {sizeOptions.length > 0 && (
        <div className="mt-5">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Size
          </span>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSelectedSize(size);
                  setError("");
                }}
                className={classNames(
                  "min-w-10 rounded-lg border px-3 py-2 text-sm font-medium transition",
                  selectedSize === size
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </Modal>
  );
}
