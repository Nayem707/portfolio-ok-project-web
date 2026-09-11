import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  SwatchIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Tabs from "@/components/common/Tabs";
import {
  addCategory,
  deleteCategory,
  selectCategories,
  updateCategory,
} from "@/features/categories";
import {
  addColor,
  deleteColor,
  selectColors,
  updateColor,
} from "@/features/colors";
import { addSize, deleteSize, selectSizes, updateSize } from "@/features/sizes";

const tabOptions = [
  { value: "category", label: "Category" },
  { value: "color", label: "Color" },
  { value: "size", label: "Size" },
];

const emptyCategory = {
  name: "",
  description: "",
  image: "",
  status: "Active",
};
const emptyColor = { name: "", hex: "#111827" };
const emptySize = { name: "" };

export default function ProductAttributesView() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const colors = useSelector(selectColors);
  const sizes = useSelector(selectSizes);

  const [activeTab, setActiveTab] = useState("category");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCategory);

  const counts = useMemo(
    () => ({
      category: categories.length,
      color: colors.length,
      size: sizes.length,
    }),
    [categories, colors, sizes],
  );

  const openAdd = () => {
    setEditingId(null);
    if (activeTab === "category") setForm(emptyCategory);
    if (activeTab === "color") setForm(emptyColor);
    if (activeTab === "size") setForm(emptySize);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    if (activeTab === "category") setForm(item);
    if (activeTab === "color")
      setForm({ name: item.name, hex: item.hex || "#111827" });
    if (activeTab === "size") setForm({ name: item.name });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(
      activeTab === "category"
        ? emptyCategory
        : activeTab === "color"
          ? emptyColor
          : emptySize,
    );
  };

  const [toDelete, setToDelete] = useState(null);

  const saveItem = () => {
    const trimmedName = form.name?.trim();
    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }

    if (activeTab === "category") {
      if (editingId) {
        dispatch(updateCategory({ id: editingId, ...form, name: trimmedName }));
        toast.success("Category updated");
      } else {
        dispatch(addCategory({ ...form, name: trimmedName }));
        toast.success("Category created");
      }
    }

    if (activeTab === "color") {
      if (editingId) {
        dispatch(
          updateColor({ id: editingId, name: trimmedName, hex: form.hex }),
        );
        toast.success("Color updated");
      } else {
        dispatch(addColor({ name: trimmedName, hex: form.hex }));
        toast.success("Color created");
      }
    }

    if (activeTab === "size") {
      if (editingId) {
        dispatch(updateSize({ id: editingId, name: trimmedName }));
        toast.success("Size updated");
      } else {
        dispatch(addSize({ name: trimmedName }));
        toast.success("Size created");
      }
    }

    closeModal();
  };

  const deleteItem = () => {
    if (!toDelete) return;
    if (activeTab === "category") dispatch(deleteCategory(toDelete.id));
    if (activeTab === "color") dispatch(deleteColor(toDelete.id));
    if (activeTab === "size") dispatch(deleteSize(toDelete.id));
    toast.success(`${activeTab[0].toUpperCase() + activeTab.slice(1)} deleted`);
    setToDelete(null);
  };

  const getCards = () => {
    if (activeTab === "category") {
      return categories.map((item) => (
        <div key={item.id} className="card overflow-hidden">
          <div className="relative h-28 bg-slate-100">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No image
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge color={item.status === "Active" ? "green" : "gray"}>
                {item.status}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-slate-800">{item.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {item.description || "No description"}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => openEdit(item)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                <PencilSquareIcon className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => setToDelete(item)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      ));
    }

    if (activeTab === "color") {
      return colors.map((item) => (
        <div key={item.id} className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="h-9 w-9 rounded-full border border-slate-200"
                style={{ backgroundColor: item.hex || "#111827" }}
              />
              <div>
                <p className="font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">
                  {item.hex || "#111827"}
                </p>
              </div>
            </div>
            <Badge color={item.status === "Active" ? "green" : "gray"}>
              {item.status || "Active"}
            </Badge>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => openEdit(item)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              <PencilSquareIcon className="h-4 w-4" /> Edit
            </button>
            <button
              onClick={() => setToDelete(item)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      ));
    }

    return sizes.map((item) => (
      <div key={item.id} className="card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-semibold text-slate-700">
              {item.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-slate-800">{item.name}</p>
              <p className="text-xs text-slate-500">{item.code || item.name}</p>
            </div>
          </div>
          <Badge color={item.status === "Active" ? "green" : "gray"}>
            {item.status || "Active"}
          </Badge>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => openEdit(item)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <PencilSquareIcon className="h-4 w-4" /> Edit
          </button>
          <button
            onClick={() => setToDelete(item)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    ));
  };

  const modalTitle = editingId ? `Edit ${activeTab}` : `Add ${activeTab}`;
  const modalFooter = (
    <>
      <Button variant="outline" onClick={closeModal}>
        Cancel
      </Button>
      <Button onClick={saveItem}>
        {editingId ? `Save ${activeTab}` : `Create ${activeTab}`}
      </Button>
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Product Attributes"
        subtitle="Manage categories, colors, and sizes for your catalog."
        actions={
          <Button leftIcon={PlusIcon} onClick={openAdd}>
            Add {activeTab}
          </Button>
        }
      />

      <Tabs
        tabs={tabOptions.map((tab) => ({ ...tab, count: counts[tab.value] }))}
        active={activeTab}
        onChange={(value) => {
          setActiveTab(value);
          setModalOpen(false);
          setEditingId(null);
          setForm(
            value === "category"
              ? emptyCategory
              : value === "color"
                ? emptyColor
                : emptySize,
          );
        }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {getCards()}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        footer={modalFooter}
      >
        {activeTab === "category" && (
          <div className="space-y-4">
            <Input
              label="Category name"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="input-base resize-none"
              />
            </div>
            <Input
              label="Image URL"
              value={form.image || ""}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://…"
            />
          </div>
        )}

        {activeTab === "color" && (
          <div className="space-y-4">
            <Input
              label="Color name"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Color swatch
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.hex || "#111827"}
                  onChange={(e) => setForm({ ...form, hex: e.target.value })}
                  className="h-11 w-16 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-1"
                />
                <span className="text-sm text-slate-600">
                  {form.hex || "#111827"}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "size" && (
          <div className="space-y-4">
            <Input
              label="Size name"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={deleteItem}
        title={`Delete ${activeTab}?`}
        message={`"${toDelete?.name}" will be permanently removed from your product attributes.`}
        confirmText="Delete"
      />
    </div>
  );
}
