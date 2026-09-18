import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowUpTrayIcon,
  StarIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import {
  fetchCategories,
  selectCategories,
} from "@/features/categories";
import { fetchColors, selectColors } from "@/features/colors";
import { fetchSizes, selectSizes } from "@/features/sizes";
import { api } from "@/services/api";
import { PRODUCT_STATUS, toProductStatusKey } from "@/constants";

const empty = {
  name: "",
  description: "",
  category: "",
  price: "",
  discount: 0,
  stock: "",
  sku: "",
  images: [],
  availableColors: [],
  availableSizes: [],
  status: "ACTIVE",
};

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_SIZE_MB = 5;
const MAX_UPLOAD_BATCH = 8;

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeImages = (images) =>
  toArray(images)
    .map((img) => (typeof img === "string" ? img.trim() : ""))
    .filter(Boolean);

const fromInitial = (initial) => ({
  ...empty,
  ...initial,
  category: initial?.category || "",
  status: toProductStatusKey(initial?.status) || "ACTIVE",
  images: normalizeImages(initial?.images),
  availableColors: toArray(initial?.colors || initial?.availableColors),
  availableSizes: toArray(initial?.sizes || initial?.availableSizes),
});

export default function ProductForm({
  initial,
  onSubmit,
  submitLabel = "Save product",
  loading,
}) {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const colors = useSelector(selectColors);
  const sizes = useSelector(selectSizes);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(() => fromInitial(initial));
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories({ all: true }));
    dispatch(fetchColors());
    dispatch(fetchSizes());
  }, [dispatch]);

  useEffect(() => {
    setForm(fromInitial(initial));
    setImageUrl("");
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [initial]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const toggleSelection = (key, value) => {
    setForm((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const updateImages = (nextImages) => {
    setForm((prev) => ({ ...prev, images: normalizeImages(nextImages) }));
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      toast.error("Enter a valid image URL or upload path");
      return;
    }
    if (form.images.includes(url)) {
      toast.error("This image is already added");
      return;
    }
    updateImages([...form.images, url]);
    setImageUrl("");
  };

  const removeImage = (idx) => {
    updateImages(form.images.filter((_, i) => i !== idx));
  };

  const setPrimaryImage = (idx) => {
    if (idx <= 0 || idx >= form.images.length) return;
    const next = [...form.images];
    const [selected] = next.splice(idx, 1);
    next.unshift(selected);
    updateImages(next);
  };

  const moveImage = (idx, direction) => {
    const target = idx + direction;
    if (target < 0 || target >= form.images.length) return;
    const next = [...form.images];
    [next[idx], next[target]] = [next[target], next[idx]];
    updateImages(next);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    if (files.length > MAX_UPLOAD_BATCH) {
      toast.error(`You can upload up to ${MAX_UPLOAD_BATCH} images at once`);
      return;
    }

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error("Please select JPG, PNG, WebP, GIF, or AVIF images only");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`Each image must be under ${MAX_SIZE_MB}MB`);
        return;
      }
    }

    setUploading(true);
    try {
      const uploaded = await api.uploadImages(files);
      const list = Array.isArray(uploaded) ? uploaded : [uploaded];
      const urls = list
        .map((item) => item?.url)
        .filter((url) => typeof url === "string" && url.trim());

      if (!urls.length) {
        throw new Error("Upload did not return image URLs");
      }

      const merged = [...form.images];
      urls.forEach((url) => {
        if (!merged.includes(url)) merged.push(url);
      });
      updateImages(merged);
      toast.success(
        urls.length === 1
          ? "Image uploaded"
          : `${urls.length} images uploaded`,
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to upload images",
      );
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.category) next.category = "Required";
    if (form.price === "" || Number(form.price) <= 0)
      next.price = "Enter a valid price";
    if (form.stock === "" || Number(form.stock) < 0)
      next.stock = "Enter valid stock";
    if (!form.sku.trim()) next.sku = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (uploading) {
      toast.error("Please wait for image uploads to finish");
      return;
    }
    if (!validate()) return;

    const selectedCategory = categories.find(
      (c) => c.id === form.category || c.name === form.category,
    );
    if (!selectedCategory?.id && !initial?.categoryId) {
      setErrors({ ...errors, category: "Required" });
      return;
    }

    const selectedColorNames = Array.isArray(form.availableColors)
      ? form.availableColors
      : toArray(form.availableColors);
    const selectedSizeNames = Array.isArray(form.availableSizes)
      ? form.availableSizes
      : toArray(form.availableSizes);

    onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim(),
      categoryId: selectedCategory?.id || initial?.categoryId,
      description: form.description?.trim() || undefined,
      price: Number(form.price),
      discount: Number(form.discount) || 0,
      stock: Number(form.stock),
      status: toProductStatusKey(form.status) || "ACTIVE",
      images: form.images,
      colorIds:
        colors.length > 0
          ? colors
              .filter((color) => selectedColorNames.includes(color.name))
              .map((color) => color.id)
          : initial?.colorIds || [],
      sizeIds:
        sizes.length > 0
          ? sizes
              .filter((size) => selectedSizeNames.includes(size.name))
              .map((size) => size.id)
          : initial?.sizeIds || [],
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900">Basic Information</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Product name"
              value={form.name}
              onChange={set("name")}
              error={errors.name}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={5}
                className="input-base resize-none"
                placeholder="Describe the product…"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-900">Images</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add image URLs and/or upload multiple files. The first image is the
            primary/featured image.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Paste image URL…"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addImageUrl}
              className="shrink-0"
              disabled={uploading}
            >
              Add URL
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={ArrowUpTrayIcon}
              loading={uploading}
              onClick={handleUploadClick}
            >
              {uploading ? "Uploading…" : "Upload images"}
            </Button>
            <p className="text-xs text-slate-400">
              JPG, PNG, WebP, GIF, or AVIF · max {MAX_SIZE_MB}MB each · up to{" "}
              {MAX_UPLOAD_BATCH} at once
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {form.images.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {form.images.map((img, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={`${img}-${idx}`}
                    className={[
                      "group relative aspect-square overflow-hidden rounded-xl border bg-slate-50",
                      isPrimary
                        ? "border-primary-500 ring-primary-200 ring-2"
                        : "border-slate-200",
                    ].join(" ")}
                  >
                    <img
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {isPrimary ? (
                      <span className="bg-primary-600 absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                        <StarSolidIcon className="h-3 w-3" />
                        Primary
                      </span>
                    ) : null}

                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-6 pb-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveImage(idx, -1)}
                          disabled={idx === 0 || uploading}
                          className="rounded-md bg-white/90 p-1 text-slate-700 disabled:opacity-40"
                          aria-label="Move image left"
                          title="Move left"
                        >
                          <ChevronLeftIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 1)}
                          disabled={idx === form.images.length - 1 || uploading}
                          className="rounded-md bg-white/90 p-1 text-slate-700 disabled:opacity-40"
                          aria-label="Move image right"
                          title="Move right"
                        >
                          <ChevronRightIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {!isPrimary ? (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            disabled={uploading}
                            className="rounded-md bg-white/90 p-1 text-amber-600"
                            aria-label="Set as primary image"
                            title="Set as primary"
                          >
                            <StarIcon className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          disabled={uploading}
                          className="rounded-md bg-white/90 p-1 text-red-600"
                          aria-label="Remove image"
                          title="Remove"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
              No images yet — paste a URL or upload files.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900">Pricing & Inventory</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={form.price}
              onChange={set("price")}
              error={errors.price}
            />
            <Input
              label="Discount (%)"
              type="number"
              value={form.discount}
              onChange={set("discount")}
            />
            <Input
              label="Stock"
              type="number"
              value={form.stock}
              onChange={set("stock")}
              error={errors.stock}
            />
            <Input
              label="SKU"
              value={form.sku}
              onChange={set("sku")}
              error={errors.sku}
            />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-900">Organization</h2>
          <div className="mt-4 space-y-4">
            <Select
              label="Category"
              value={form.category}
              onChange={set("category")}
              error={errors.category}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select label="Status" value={form.status} onChange={set("status")}>
              {Object.entries(PRODUCT_STATUS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Available colors
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.length === 0 && (
                  <span className="text-sm text-slate-400">
                    No colors available
                  </span>
                )}
                {colors.map((color) => {
                  const selected = form.availableColors.includes(color.name);
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() =>
                        toggleSelection("availableColors", color.name)
                      }
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                        selected
                          ? "border-primary-600 bg-primary-50 text-primary-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                      ].join(" ")}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-200"
                        style={{ backgroundColor: color.hex || "#111827" }}
                      />
                      {color.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Available sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.length === 0 && (
                  <span className="text-sm text-slate-400">
                    No sizes available
                  </span>
                )}
                {sizes.map((size) => {
                  const selected = form.availableSizes.includes(size.name);
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() =>
                        toggleSelection("availableSizes", size.name)
                      }
                      className={[
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                        selected
                          ? "border-primary-600 bg-primary-50 text-primary-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                      ].join(" ")}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          disabled={uploading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
