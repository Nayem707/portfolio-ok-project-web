import { useState } from "react";
import { useSelector } from "react-redux";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import { selectCategories } from "@/features/categories";
import { selectColors } from "@/features/colors";
import { selectSizes } from "@/features/sizes";
import { PRODUCT_STATUS } from "@/constants";

const empty = {
  name: "",
  description: "",
  category: "",
  price: "",
  discount: 0,
  stock: "",
  sku: "",
  images: [],
  availableColors: "",
  availableSizes: "",
  status: PRODUCT_STATUS.ACTIVE,
};

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

export default function ProductForm({
  initial,
  onSubmit,
  submitLabel = "Save product",
  loading,
}) {
  const categories = useSelector(selectCategories);
  const colors = useSelector(selectColors);
  const sizes = useSelector(selectSizes);
  const [form, setForm] = useState(() => ({
    ...empty,
    ...initial,
    images: initial?.images || [],
    availableColors: toArray(initial?.availableColors),
    availableSizes: toArray(initial?.availableSizes),
  }));
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});

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

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setForm({ ...form, images: [...form.images, imageUrl.trim()] });
    setImageUrl("");
  };

  const removeImage = (idx) =>
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });

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
    if (!validate()) return;
    const cat = categories.find((c) => c.name === form.category);
    onSubmit({
      ...form,
      price: Number(form.price),
      discount: Number(form.discount) || 0,
      stock: Number(form.stock),
      categoryId: cat?.id,
      availableColors: Array.isArray(form.availableColors)
        ? form.availableColors
        : form.availableColors
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
      availableSizes: Array.isArray(form.availableSizes)
        ? form.availableSizes
        : form.availableSizes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
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
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Paste image URL…"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addImage}
              className="shrink-0"
            >
              Add
            </Button>
          </div>
          {form.images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {form.images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-medium text-red-600 opacity-0 transition group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
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
              {Object.values(PRODUCT_STATUS).map((s) => (
                <option key={s}>{s}</option>
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

        <Button type="submit" fullWidth size="lg" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
