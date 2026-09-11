import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  createSize,
  deleteSize,
  fetchSizes,
  selectSizes,
  selectSizesLoading,
  updateSize,
} from "@/features/sizes";

const emptyForm = { name: "", sortOrder: 0 };

export default function AdminSizeListView() {
  const dispatch = useDispatch();
  const sizes = useSelector(selectSizes);
  const loading = useSelector(selectSizesLoading);
  const mutationLoading = useSelector((state) => state.size.mutationLoading);
  const error = useSelector((state) => state.size.error);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchSizes());
  }, [dispatch]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (size) => {
    setEditing(size.id);
    setForm({ name: size.name, sortOrder: size.sortOrder ?? 0 });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Size name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (editing) {
        await dispatch(updateSize({ id: editing, payload })).unwrap();
        toast.success("Size updated");
      } else {
        await dispatch(createSize(payload)).unwrap();
        toast.success("Size created");
      }
      setModalOpen(false);
    } catch (saveError) {
      toast.error(saveError || "Failed to save size");
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await dispatch(deleteSize(toDelete.id)).unwrap();
      toast.success("Size deleted");
      setToDelete(null);
    } catch (deleteError) {
      toast.error(deleteError || "Failed to delete size");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sizes"
        subtitle={`${sizes.length} sizes`}
        actions={
          <Button leftIcon={PlusIcon} onClick={openAdd}>
            Add Size
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card p-6 text-sm text-slate-500">Loading sizes...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sizes.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-semibold text-slate-700">
                    {item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      Sort: {item.sortOrder ?? 0}
                    </p>
                  </div>
                </div>
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
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit size" : "Add size"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={mutationLoading}>
              Save size
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Size name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            label="Sort order"
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
            }
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        title="Delete size?"
        message={`"${toDelete?.name}" will be permanently removed.`}
        confirmText="Delete"
      />
    </div>
  );
}
