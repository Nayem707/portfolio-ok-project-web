import { useState } from "react";
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

const initialAddresses = [
  {
    id: "a-1",
    label: "Home",
    fullName: "Alex Morgan",
    phone: "+1 202 555 0112",
    address: "742 Evergreen Terrace",
    city: "Springfield",
    postalCode: "62704",
    country: "United States",
    default: true,
  },
  {
    id: "a-2",
    label: "Work",
    fullName: "Alex Morgan",
    phone: "+1 202 555 0187",
    address: "500 Business Park Dr, Suite 210",
    city: "Springfield",
    postalCode: "62701",
    country: "United States",
    default: false,
  },
];

const emptyForm = {
  label: "Home",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "United States",
};

export default function Addresses() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (addr) => {
    setEditing(addr.id);
    setForm(addr);
    setModalOpen(true);
  };

  const save = () => {
    if (!form.fullName || !form.address) {
      toast.error("Please fill in required fields");
      return;
    }
    if (editing) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editing ? { ...a, ...form } : a)),
      );
      toast.success("Address updated");
    } else {
      setAddresses((prev) => [
        ...prev,
        { ...form, id: `a-${Date.now()}`, default: false },
      ]);
      toast.success("Address added");
    }
    setModalOpen(false);
  };

  const remove = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  };

  const makeDefault = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, default: a.id === id })));
    toast.success("Default address updated");
  };

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

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold text-slate-800">
                {addr.label === "Work" ? (
                  <BriefcaseIcon className="h-5 w-5 text-primary-600" />
                ) : (
                  <HomeIcon className="h-5 w-5 text-primary-600" />
                )}
                {addr.label}
              </span>
              {addr.default && <Badge color="green">Default</Badge>}
            </div>
            <div className="mt-3 space-y-0.5 text-sm text-slate-600">
              <p className="font-medium text-slate-800">{addr.fullName}</p>
              <p>{addr.phone}</p>
              <p>{addr.address}</p>
              <p>
                {addr.city}, {addr.postalCode}
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
              {!addr.default && (
                <button
                  onClick={() => makeDefault(addr.id)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50"
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit address" : "Add address"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save address</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Label"
            value={form.label}
            onChange={set("label")}
            placeholder="Home / Work"
          />
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
              label="Address"
              value={form.address}
              onChange={set("address")}
            />
          </div>
          <Input label="City" value={form.city} onChange={set("city")} />
          <Input
            label="Postal code"
            value={form.postalCode}
            onChange={set("postalCode")}
          />
        </div>
      </Modal>
    </div>
  );
}
