import { useState } from "react";
import toast from "react-hot-toast";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function AdminSettingsView() {
  const [store, setStore] = useState({
    name: "Shoply",
    email: "support@shoply.com",
    phone: "+1 (800) 555-0199",
    currency: "USD",
    address: "123 Market St, San Francisco, CA",
  });
  const [shipping, setShipping] = useState({
    flatRate: 12,
    freeThreshold: 150,
  });

  const setStoreField = (key) => (e) =>
    setStore({ ...store, [key]: e.target.value });
  const setShippingField = (key) => (e) =>
    setShipping({ ...shipping, [key]: e.target.value });

  const save = (label) => (e) => {
    e.preventDefault();
    toast.success(`${label} saved`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        subtitle="Manage your store configuration."
      />

      <form onSubmit={save("Store details")} className="card p-6">
        <h2 className="font-semibold text-slate-900">Store Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Store name"
            value={store.name}
            onChange={setStoreField("name")}
          />
          <Input
            label="Support email"
            type="email"
            value={store.email}
            onChange={setStoreField("email")}
          />
          <Input
            label="Phone"
            value={store.phone}
            onChange={setStoreField("phone")}
          />
          <Select
            label="Currency"
            value={store.currency}
            onChange={setStoreField("currency")}
          >
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </Select>
          <div className="sm:col-span-2">
            <Input
              label="Business address"
              value={store.address}
              onChange={setStoreField("address")}
            />
          </div>
        </div>
        <div className="mt-5">
          <Button type="submit">Save store details</Button>
        </div>
      </form>

      <form onSubmit={save("Shipping settings")} className="card p-6">
        <h2 className="font-semibold text-slate-900">Shipping</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Flat shipping rate ($)"
            type="number"
            value={shipping.flatRate}
            onChange={setShippingField("flatRate")}
          />
          <Input
            label="Free shipping threshold ($)"
            type="number"
            value={shipping.freeThreshold}
            onChange={setShippingField("freeThreshold")}
          />
        </div>
        <div className="mt-5">
          <Button type="submit">Save shipping settings</Button>
        </div>
      </form>
    </div>
  );
}
