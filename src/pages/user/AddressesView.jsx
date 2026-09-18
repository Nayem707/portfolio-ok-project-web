import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PlusIcon,
  MapPinIcon,
  PencilSquareIcon,
  TrashIcon,
  HomeIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Badge from "@/components/common/Badge";
import Select from "@/components/common/Select";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { api } from "@/services/api";

const emptyForm = {
  type: "SHIPPING",
  fullName: "",
  phone: "",
  street: "",
  area: "",
  city: "",
  postalCode: "",
  country: "United States",
  isDefault: false,
};

export default function AddressesView() {
  const [addresses, setAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAddresses = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.listMyAddresses();
      setAddresses(response || []);
    } catch (err) {
      setError(
        err?.response?.data?.error?.message || "Failed to load addresses",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (addr) => {
    setEditingId(addr.id);
    setForm({
      type: addr.type || "SHIPPING",
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      street: addr.street || "",
      area: addr.area || "",
      city: addr.city || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "",
      isDefault: !!addr.isDefault,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.street.trim() ||
      !form.city.trim() ||
      !form.country.trim()
    ) {
      toast.error("Please fill in all required fields (name, phone, street, city, country)");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.updateMyAddress(editingId, {
          type: form.type,
          fullName: form.fullName,
          phone: form.phone,
          country: form.country,
          city: form.city,
          area: form.area || undefined,
          street: form.street,
          postalCode: form.postalCode || undefined,
          isDefault: form.isDefault,
        });
        toast.success("Address updated");
      } else {
        await api.createMyAddress({
          type: form.type,
          fullName: form.fullName,
          phone: form.phone,
          country: form.country,
          city: form.city,
          area: form.area || undefined,
          street: form.street,
          postalCode: form.postalCode || undefined,
          isDefault: form.isDefault,
        });
        toast.success("Address added");
      }
      await loadAddresses();
      setModalOpen(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message || "Failed to save address",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.deleteMyAddress(id);
      await loadAddresses();
      toast.success("Address removed");
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message || "Failed to delete address",
      );
    }
  };

  const makeDefault = async (id) => {
    try {
      await api.updateMyAddress(id, { isDefault: true });
      await loadAddresses();
      toast.success("Default address updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message || "Failed to set default address",
      );
    }
  };

  if (loading) {
    return <LoadingSpinner className="py-16" label="Loading addresses..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load addresses"
        description={error}
        onRetry={loadAddresses}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Addresses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your shipping addresses.
          </p>
        </div>
        <Button leftIcon={PlusIcon} onClick={openAdd}>
          Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPinIcon}
          title="No addresses yet"
          description="Add your shipping or billing address to speed up checkout."
          action={
            <Button leftIcon={PlusIcon} onClick={openAdd}>
              Add address
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-slate-800">
                  {addr.type === "BILLING" ? (
                    <BriefcaseIcon className="text-primary-600 h-5 w-5" />
                  ) : (
                    <HomeIcon className="text-primary-600 h-5 w-5" />
                  )}
                  {addr.type === "BILLING" ? "Billing" : "Shipping"}
                </span>
                {addr.isDefault && <Badge color="green">Default</Badge>}
              </div>
              <div className="mt-3 space-y-0.5 text-sm text-slate-600">
                <p className="font-medium text-slate-800">{addr.fullName}</p>
                <p>{addr.phone}</p>
                <p>{addr.street}</p>
                {addr.area ? <p>{addr.area}</p> : null}
                <p>
                  {addr.city}
                  {addr.postalCode ? `, ${addr.postalCode}` : ""}
                </p>
                <p>{addr.country}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => openEdit(addr)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  <PencilSquareIcon className="h-4 w-4" /> Edit
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => makeDefault(addr.id)}
                    className="text-primary-600 hover:bg-primary-50 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                  >
                    <MapPinIcon className="h-4 w-4" /> Set default
                  </button>
                )}
                <button
                  onClick={() => remove(addr.id)}
                  className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
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
        title={editingId ? "Edit address" : "Add address"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              Save address
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Type" value={form.type} onChange={set("type")}>
            <option value="SHIPPING">Shipping</option>
            <option value="BILLING">Billing</option>
          </Select>
          <Input
            label="Full name"
            value={form.fullName}
            onChange={set("fullName")}
          />
          <Input label="Phone" value={form.phone} onChange={set("phone")} />
          <Input
            label="Country"
            value={form.country}
            onChange={set("country")}
          />
          <div className="sm:col-span-2">
            <Input
              label="Street"
              value={form.street}
              onChange={set("street")}
            />
          </div>
          <Input label="Area" value={form.area} onChange={set("area")} />
          <Input label="City" value={form.city} onChange={set("city")} />
          <Input
            label="Postal code"
            value={form.postalCode}
            onChange={set("postalCode")}
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
            />
            Set as default address
          </label>
        </div>
      </Modal>
    </div>
  );
}
