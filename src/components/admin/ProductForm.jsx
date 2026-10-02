import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowUpTrayIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import RichTextEditor from "@/components/common/RichTextEditor";
import { fetchCategories, selectCategories } from "@/features/categories";
import { fetchColors, selectColors } from "@/features/colors";
import { fetchSizes, selectSizes } from "@/features/sizes";
import { api } from "@/services/api";
import { PRODUCT_STATUS, toProductStatusKey } from "@/constants";
import { isRichTextEmpty, resolveMediaUrl } from "@/utils";

const MAX_HIGHLIGHTS = 5;

const toHighlightSlots = (points) => {
  const list = Array.isArray(points)
    ? points
        .filter((point) => typeof point === "string" && point.trim())
        .slice(0, MAX_HIGHLIGHTS)
    : [];
  return list.length ? list : [""];
};

const empty = {
  name: "",
  shortDescription: toHighlightSlots(),
  description: "",
  category: "",
  price: "",
  baseCurrency: "BDT",
  discount: 0,
  stock: "",
  sku: "",
  images: [],
  availableColors: [],
  availableSizes: [],
  status: "ACTIVE",
  featured: false,
  popular: false,
  newArrival: false,
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
  shortDescription: toHighlightSlots(initial?.shortDescription),
  description: initial?.description || "",
  baseCurrency: initial?.baseCurrency || "BDT",
  featured: Boolean(initial?.featured),
  popular: Boolean(initial?.popular),
  newArrival: Boolean(initial?.newArrival),
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
  const highlightInputsRef = useRef([]);
  const focusHighlightRef = useRef(null);
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
  const setDescription = useCallback(
    (description) => setForm((prev) => ({ ...prev, description })),
    [],
  );
  const setHighlight = (idx) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      shortDescription: prev.shortDescription.map((point, i) =>
        i === idx ? value : point,
      ),
    }));
  };
  const addHighlight = () => {
    if (form.shortDescription.length >= MAX_HIGHLIGHTS) return;
    focusHighlightRef.current = form.shortDescription.length;
    setForm((prev) => ({
      ...prev,
      shortDescription: [...prev.shortDescription, ""],
    }));
  };
  const removeHighlight = (idx) => {
    setForm((prev) => {
      const next = prev.shortDescription.filter((_, i) => i !== idx);
      return { ...prev, shortDescription: next.length ? next : [""] };
    });
  };

  useEffect(() => {
    if (focusHighlightRef.current === null) return;
    highlightInputsRef.current[focusHighlightRef.current]?.focus();
    focusHighlightRef.current = null;
  }, [form.shortDescription.length]);

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
        urls.length === 1 ? "Image uploaded" : `${urls.length} images uploaded`,
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
      shortDescription: form.shortDescription
        .map((point) => point.trim())
        .filter(Boolean),
      description: isRichTextEmpty(form.description)
        ? initial
          ? ""
          : undefined
        : form.description.trim(),
      price: Number(form.price),
      baseCurrency: form.baseCurrency || initial?.baseCurrency || "BDT",
      discount: Number(form.discount) || 0,
      stock: Number(form.stock),
      status: toProductStatusKey(form.status) || "ACTIVE",
      featured: Boolean(form.featured),
      popular: Boolean(form.popular),
      newArrival: Boolean(form.newArrival),
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
                Highlights
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Up to {MAX_HIGHLIGHTS} short points shown as a bullet list above
                the description. Click + to add another point. Leave empty to
                hide the section.
              </p>
              <div className="space-y-2">
                {form.shortDescription.map((point, idx) => {
                  const isLast = idx === form.shortDescription.length - 1;
                  const canAdd =
                    isLast && form.shortDescription.length < MAX_HIGHLIGHTS;
                  const canRemove =
                    form.shortDescription.length > 1 || point.trim();
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        ref={(el) => {
                          highlightInputsRef.current[idx] = el;
                        }}
                        value={point}
                        onChange={setHighlight(idx)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (canAdd && point.trim()) addHighlight();
                          }
                        }}
                        maxLength={200}
                        placeholder={`Highlight ${idx + 1}`}
                        aria-label={`Highlight ${idx + 1}`}
                      />
                      {canRemove && (
                        <button
                          type="button"
                          onClick={() => removeHighlight(idx)}
                          aria-label={`Remove highlight ${idx + 1}`}
                          title="Remove"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        >
                          <TrashIcon className="h-4.5 w-4.5" />
                        </button>
                      )}
                      {canAdd && (
                        <button
                          type="button"
                          onClick={addHighlight}
                          aria-label="Add highlight"
                          title="Add highlight"
                          className="bg-primary-600 hover:bg-primary-700 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {form.shortDescription.length}/{MAX_HIGHLIGHTS} highlights
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <RichTextEditor
                value={form.description}
                onChange={setDescription}
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
                      src={resolveMediaUrl(img)}
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
              label="Price (BDT)"
              type="number"
              step="0.01"
              value={form.price}
              onChange={set("price")}
              error={errors.price}
            />
            <p className="text-xs text-slate-500">
              Enter the base price in BDT. Storefront conversion is applied from
              Admin Settings and does not change this value.
            </p>
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
              <p className="text-sm font-medium text-slate-700">
                Homepage collections
              </p>
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                {[
                  { key: "featured", label: "Featured Products" },
                  { key: "popular", label: "Popular Right Now" },
                  { key: "newArrival", label: "New Arrivals" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-slate-300"
                      checked={Boolean(form[key])}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Products marked here appear in the matching homepage sections.
              </p>
            </div>
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
