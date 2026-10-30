import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import { api } from "@/services/api";
import { ADMIN_PATHS } from "@/routes/admin/admin.paths";
import { ENGLISH_CATEGORY_NAME, formatDate } from "@/utils";

const emptyForm = {
  name: "",
  title: "",
  categoryId: "",
  description: "",
  status: "ACTIVE",
};

export default function AdminSubcategoryListView() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategoryId, setFilterCategoryId] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryList, subcategoryList] = await Promise.all([
        api.getCategories({ all: "true" }),
        api.getSubcategories({ all: "true" }),
      ]);
      setCategories(Array.isArray(categoryList) ? categoryList : []);
      setSubcategories(Array.isArray(subcategoryList) ? subcategoryList : []);
    } catch (loadError) {
      setError(
        loadError?.response?.data?.error?.message ||
          loadError?.message ||
          "Failed to load subcategories",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubcategories = useMemo(() => {
    if (!filterCategoryId) return subcategories;
    return subcategories.filter((item) => item.categoryId === filterCategoryId);
  }, [subcategories, filterCategoryId]);

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((item) => [item.id, item.title || item.name]));
  }, [categories]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (subcategory) => {
    setEditing(subcategory.id);
    setForm({
      name: subcategory.name || "",
      title: subcategory.title || "",
      categoryId: subcategory.categoryId || "",
      description: subcategory.description || "",
      status: subcategory.status || "ACTIVE",
    });
    setModalOpen(true);
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      toast.error("Subcategory name is required");
      return;
    }
    if (!ENGLISH_CATEGORY_NAME.test(name)) {
      toast.error("Subcategory name must be in English");
      return;
    }
    if (!form.categoryId) {
      toast.error("Parent category is required");
      return;
    }

    const payload = {
      name,
      title: form.title.trim() || null,
      categoryId: form.categoryId,
      description: form.description.trim() || undefined,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editing) {
        await api.updateSubcategory(editing, payload);
        toast.success("Subcategory updated");
      } else {
        await api.createSubcategory(payload);
        toast.success("Subcategory created");
      }
      setModalOpen(false);
      setForm(emptyForm);
      setEditing(null);
      await loadData();
    } catch (saveError) {
      toast.error(
        saveError?.response?.data?.error?.message ||
          saveError?.message ||
          "Failed to save subcategory",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteSubcategory(toDelete.id);
      toast.success("Subcategory deleted");
      setToDelete(null);
      await loadData();
    } catch (deleteError) {
      toast.error(
        deleteError?.response?.data?.error?.message ||
          deleteError?.message ||
          "Failed to delete subcategory",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subcategories"
        subtitle={`${subcategories.length} subcategories`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/${ADMIN_PATHS.ATTRIBUTES_CATEGORIES}`}
              className="btn border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            <Button leftIcon={PlusIcon} onClick={openAdd}>
              Add Subcategory
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card p-4">
        <Select
          label="Filter by main category"
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
        >
          <option value="">All main categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title || category.name}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="card p-6 text-sm text-slate-500">
          Loading subcategories...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSubcategories.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {item.title || item.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {item.name} · /{item.slug}
                  </p>
                </div>
                <Badge color={item.status === "INACTIVE" ? "gray" : "green"}>
                  {item.status === "INACTIVE" ? "Inactive" : "Active"}
                </Badge>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Parent:{" "}
                <span className="font-medium text-slate-700">
                  {categoryNameById.get(item.categoryId) || "Unknown"}
                </span>
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {item.description || "No description"}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {item._count?.products ?? 0} products · Created{" "}
                {formatDate(item.createdAt)}
              </p>

              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
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
          ))}
          {!filteredSubcategories.length && (
            <div className="card p-6 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              No subcategories found for the selected filter.
            </div>
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          if (saving) return;
          setModalOpen(false);
        }}
        title={editing ? "Edit subcategory" : "Add subcategory"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              Save subcategory
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Main category"
            value={form.categoryId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, categoryId: e.target.value }))
            }
          >
            <option value="">Select main category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title || category.name}
              </option>
            ))}
          </Select>

          <Input
            label="Subcategory name (English)"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            label="Subcategory title"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              className="input-base resize-none"
            />
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        title="Delete subcategory?"
        message={`"${toDelete?.name}" will be permanently removed.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
