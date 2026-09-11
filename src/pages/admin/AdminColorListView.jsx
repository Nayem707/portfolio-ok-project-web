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
  createColor,
  deleteColor,
  fetchColors,
  selectColors,
  selectColorsLoading,
  updateColor,
} from "@/features/colors";

const emptyForm = { name: "", hex: "#111827" };

export default function AdminColorListView() {
  const dispatch = useDispatch();
  const colors = useSelector(selectColors);
  const loading = useSelector(selectColorsLoading);
  const mutationLoading = useSelector((state) => state.color.mutationLoading);
  const error = useSelector((state) => state.color.error);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchColors());
  }, [dispatch]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (color) => {
    setEditing(color.id);
    setForm({ name: color.name, hex: color.hex || "#111827" });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Color name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      hex: form.hex || undefined,
    };

    try {
      if (editing) {
        await dispatch(updateColor({ id: editing, payload })).unwrap();
        toast.success("Color updated");
      } else {
        await dispatch(createColor(payload)).unwrap();
        toast.success("Color created");
      }
      setModalOpen(false);
    } catch (saveError) {
      toast.error(saveError || "Failed to save color");
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await dispatch(deleteColor(toDelete.id)).unwrap();
      toast.success("Color deleted");
      setToDelete(null);
    } catch (deleteError) {
      toast.error(deleteError || "Failed to delete color");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Colors"
        subtitle={`${colors.length} colors`}
        actions={
          <Button leftIcon={PlusIcon} onClick={openAdd}>
            Add Color
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card p-6 text-sm text-slate-500">Loading colors...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {colors.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex items-center justify-between gap-3">
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
        title={editing ? "Edit color" : "Add color"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={mutationLoading}>
              Save color
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Color name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Color swatch
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.hex}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hex: e.target.value }))
                }
                className="h-11 w-16 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-1"
              />
              <span className="text-sm text-slate-600">{form.hex}</span>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        title="Delete color?"
        message={`"${toDelete?.name}" will be permanently removed.`}
        confirmText="Delete"
      />
    </div>
  );
}
