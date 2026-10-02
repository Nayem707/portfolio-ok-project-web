import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsRightLeftIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  selectCategories,
  selectCategoriesLoading,
  toggleCategoryStatus,
  updateCategory,
} from "@/features/categories";
import { api } from "@/services/api";
import {
  ENGLISH_CATEGORY_NAME,
  formatDate,
  getCategoryLabel,
  resolveMediaUrl,
} from "@/utils";

const emptyForm = {
  title: "",
  name: "",
  description: "",
  image: "",
  status: "ACTIVE",
};

const toCategorySlug = (name = "") =>
  name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-");

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_SIZE_MB = 5;

const statusLabel = (status) => (status === "INACTIVE" ? "Inactive" : "Active");
const badgeColor = (status) => (status === "INACTIVE" ? "gray" : "green");

export default function AdminCategoryListView() {
  const categories = useSelector(selectCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector((state) => state.category.error);
  const mutationLoading = useSelector(
    (state) => state.category.mutationLoading,
  );
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "image") setPreviewFailed(false);
  };

  useEffect(() => {
    dispatch(fetchCategories({ all: true }));
  }, [dispatch]);

  const resetModalState = () => {
    setEditing(null);
    setForm(emptyForm);
    setUploading(false);
    setPreviewFailed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAdd = () => {
    resetModalState();
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat.id);
    setForm({
      title: cat.title || "",
      name: cat.name || "",
      description: cat.description || "",
      image: cat.image || "",
      status: cat.status || "ACTIVE",
    });
    setUploading(false);
    setPreviewFailed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  };

  const closeModal = () => {
    if (uploading || mutationLoading) return;
    setModalOpen(false);
    resetModalState();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WebP, GIF, or AVIF image");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await api.uploadImages(file);
      const first = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      const url = first?.url;
      if (!url) throw new Error("Upload did not return an image URL");
      setForm((prev) => ({ ...prev, image: url }));
      setPreviewFailed(false);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to upload image",
      );
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    setPreviewFailed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const save = async () => {
    const name = (form.name || "").trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    if (!ENGLISH_CATEGORY_NAME.test(name)) {
      toast.error("Category name must be in English");
      return;
    }
    if (uploading) {
      toast.error("Please wait for the image upload to finish");
      return;
    }

    const payload = {
      name,
      title: (form.title || "").trim() || null,
      description: form.description?.trim() || undefined,
      image: form.image?.trim() || null,
      status: form.status,
    };

    try {
      if (editing) {
        await dispatch(updateCategory({ id: editing, payload })).unwrap();
        toast.success("Category updated");
      } else {
        await dispatch(createCategory(payload)).unwrap();
        toast.success("Category created");
      }
      setModalOpen(false);
      resetModalState();
    } catch (error) {
      toast.error(error || "Failed to save category");
    }
  };

  const onToggleStatus = async (cat) => {
    try {
      await dispatch(toggleCategoryStatus(cat)).unwrap();
      toast.success(
        `Category is now ${statusLabel(cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}`,
      );
    } catch (error) {
      toast.error(error || "Failed to toggle category status");
    }
  };

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await dispatch(deleteCategory(toDelete.id)).unwrap();
      toast.success("Category deleted");
      setToDelete(null);
    } catch (error) {
      toast.error(error || "Failed to delete category");
    }
  };

  const previewSrc = form.image?.trim() || "";
  const trimmedName = (form.name || "").trim();
  const nameError =
    trimmedName && !ENGLISH_CATEGORY_NAME.test(trimmedName)
      ? "Use English letters, numbers, spaces and & ' ( ) , . / - only"
      : undefined;
  const categorySlug = nameError ? "" : toCategorySlug(trimmedName);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
        actions={
          <Button leftIcon={PlusIcon} onClick={openAdd}>
            Add Category
          </Button>
        }
      />

      {categoriesError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {categoriesError}
        </div>
      )}

      {categoriesLoading ? (
        <div className="card p-6 text-sm text-slate-500">
          Loading categories...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="card overflow-hidden">
              <div className="relative h-32 bg-slate-100">
                {cat.image ? (
                  <img
                    src={resolveMediaUrl(cat.image)}
                    alt={getCategoryLabel(cat)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    No image
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge color={badgeColor(cat.status)}>
                    {statusLabel(cat.status)}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate font-semibold text-slate-800">
                    {getCategoryLabel(cat)}
                  </h3>
                  <span className="shrink-0 text-xs text-slate-400">
                    {cat._count?.products ?? 0} products
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {cat.name} · /{cat.slug}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {cat.description || "No description"}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Created {formatDate(cat.createdAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => openEdit(cat)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    <PencilSquareIcon className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => onToggleStatus(cat)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                  >
                    <ArrowsRightLeftIcon className="h-4 w-4" />
                    {cat.status === "ACTIVE" ? "Set Inactive" : "Set Active"}
                  </button>
                  <button
                    onClick={() => setToDelete(cat)}
                    className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit category" : "Add category"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={uploading || mutationLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              loading={mutationLoading}
              disabled={uploading}
            >
              Save category
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Category name (English)"
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Waterproof Bedsheet"
            maxLength={100}
            error={nameError}
            hint={
              categorySlug
                ? `URL: /products?category=${categorySlug}`
                : "English only. Used to build the category URL."
            }
          />
          <Input
            label="Category title"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. ওয়াটারপ্রুফ বেডশিট"
            maxLength={150}
            hint="Shown to customers. Any language. Leave empty to use the category name."
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              className="input-base resize-none"
            />
          </div>

          <div className="space-y-3">
            <Input
              label="Image URL"
              value={form.image}
              onChange={set("image")}
              placeholder="https://…"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={ArrowUpTrayIcon}
                loading={uploading}
                onClick={handleUploadClick}
              >
                {uploading ? "Uploading…" : "Upload image"}
              </Button>
              {previewSrc ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearImage}
                  disabled={uploading}
                >
                  Clear image
                </Button>
              ) : null}
              <p className="text-xs text-slate-400">
                JPG, PNG, WebP, GIF, or AVIF · max {MAX_SIZE_MB}MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {previewSrc && !previewFailed ? (
                <img
                  src={resolveMediaUrl(previewSrc)}
                  alt={form.name || "Category preview"}
                  className="h-40 w-full object-cover"
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400">
                  <PhotoIcon className="h-8 w-8" />
                  <p className="text-xs">
                    {previewFailed
                      ? "Preview unavailable — check the image URL"
                      : "Image preview"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Select label="Status" value={form.status} onChange={set("status")}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={onDelete}
        title="Delete category?"
        message={`"${toDelete?.name}" will be permanently removed.`}
        confirmText="Delete"
      />
    </div>
  );
}
