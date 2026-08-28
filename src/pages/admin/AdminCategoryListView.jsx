import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  selectCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/store/categories";
import { selectProducts } from "@/store/products";
import { formatDate } from "@/utils";

const emptyForm = { name: "", description: "", image: "", status: "Active" };

export default function AdminCategoryListView() {
  const categories = useSelector(selectCategories);
  const products = useSelector(selectProducts);
  const dispatch = useDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const count = (name) => products.filter((p) => p.category === name).length;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat.id);
    setForm(cat);
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (editing) {
      dispatch(updateCategory({ id: editing, ...form }));
      toast.success("Category updated");
    } else {
      dispatch(addCategory(form));
      toast.success("Category created");
    }
    setModalOpen(false);
  };

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.id} className="card overflow-hidden">
            <div className="relative h-32 bg-slate-100">
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  No image
                </div>
              )}
              <div className="absolute top-3 right-3">
                <Badge color={cat.status === "Active" ? "green" : "gray"}>
                  {cat.status}
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">{cat.name}</h3>
                <span className="text-xs text-slate-400">
                  {count(cat.name)} products
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {cat.description}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Created {formatDate(cat.createdAt)}
              </p>
              <div className="mt-3 flex gap-1 border-t border-slate-100 pt-3">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  <PencilSquareIcon className="h-4 w-4" /> Edit
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit category" : "Add category"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save category</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Category name"
            value={form.name}
            onChange={set("name")}
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
          <Input
            label="Image URL"
            value={form.image}
            onChange={set("image")}
            placeholder="https://…"
          />
          <Select label="Status" value={form.status} onChange={set("status")}>
            <option>Active</option>
            <option>Inactive</option>
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          dispatch(deleteCategory(toDelete.id));
          toast.success("Category deleted");
          setToDelete(null);
        }}
        title="Delete category?"
        message={`"${toDelete?.name}" will be permanently removed.`}
        confirmText="Delete"
      />
    </div>
  );
}
