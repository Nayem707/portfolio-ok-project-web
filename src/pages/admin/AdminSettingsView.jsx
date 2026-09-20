import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  fetchSettings,
  saveShippingSettings,
  saveStoreSettings,
  selectSettings,
  selectSettingsLoading,
  selectSettingsSaving,
} from "@/features/settings";
import { convertAmount, formatCurrency } from "@/utils/currency";
import { DEFAULT_BDT_PER_USD } from "@/utils/currencyRuntime";

export default function AdminSettingsView() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const loading = useSelector(selectSettingsLoading);
  const saving = useSelector(selectSettingsSaving);

  const [store, setStore] = useState({
    storeName: "Shoply",
    supportEmail: "support@shoply.com",
    phone: "+1 (800) 555-0199",
    currency: "USD",
    bdtPerUsd: DEFAULT_BDT_PER_USD,
    address: "123 Market St, San Francisco, CA",
  });
  const [shipping, setShipping] = useState({
    shippingFlatRate: 12,
    freeShippingMin: 150,
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!settings) return;
    setStore({
      storeName: settings.storeName || "",
      supportEmail: settings.supportEmail || "",
      phone: settings.phone || "",
      currency: settings.currency || "USD",
      bdtPerUsd: settings.bdtPerUsd ?? DEFAULT_BDT_PER_USD,
      address: settings.address || "",
    });
    setShipping({
      shippingFlatRate: settings.shippingFlatRate ?? 12,
      freeShippingMin: settings.freeShippingMin ?? 150,
    });
  }, [settings]);

  const setStoreField = (key) => (e) =>
    setStore((prev) => ({ ...prev, [key]: e.target.value }));
  const setShippingField = (key) => (e) =>
    setShipping((prev) => ({ ...prev, [key]: e.target.value }));

  const rate = Number(store.bdtPerUsd) || DEFAULT_BDT_PER_USD;
  const sampleBdt = 10000;
  const sampleUsd = convertAmount(sampleBdt, "BDT", "USD", rate);

  const saveStore = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        saveStoreSettings({
          storeName: store.storeName.trim(),
          supportEmail: store.supportEmail.trim(),
          phone: store.phone.trim(),
          currency: store.currency,
          bdtPerUsd: Number(store.bdtPerUsd),
          address: store.address.trim(),
        }),
      ).unwrap();
      toast.success("Store details saved");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save store details");
    }
  };

  const saveShipping = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        saveShippingSettings({
          shippingFlatRate: Number(shipping.shippingFlatRate),
          freeShippingMin: Number(shipping.freeShippingMin),
        }),
      ).unwrap();
      toast.success("Shipping settings saved");
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : "Failed to save shipping settings",
      );
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        subtitle="Manage your store configuration."
      />

      <form onSubmit={saveStore} className="card p-6">
        <h2 className="font-semibold text-slate-900">Store Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Store name"
            value={store.storeName}
            onChange={setStoreField("storeName")}
            disabled={loading || saving}
            required
          />
          <Input
            label="Support email"
            type="email"
            value={store.supportEmail}
            onChange={setStoreField("supportEmail")}
            disabled={loading || saving}
            required
          />
          <Input
            label="Phone"
            value={store.phone}
            onChange={setStoreField("phone")}
            disabled={loading || saving}
          />
          <Select
            label="Display currency"
            value={store.currency}
            onChange={setStoreField("currency")}
            disabled={loading || saving}
          >
            <option value="USD">USD</option>
            <option value="BDT">BDT</option>
          </Select>
          <Input
            label="Exchange rate (BDT per 1 USD)"
            type="number"
            min="1"
            step="0.01"
            value={store.bdtPerUsd}
            onChange={setStoreField("bdtPerUsd")}
            disabled={loading || saving}
            required
          />
          <div className="sm:col-span-2">
            <Input
              label="Business address"
              value={store.address}
              onChange={setStoreField("address")}
              disabled={loading || saving}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Product prices are stored in BDT and are never overwritten when you
          switch currency. Example:{" "}
          {formatCurrency(sampleBdt, {
            from: "BDT",
            currency: "BDT",
            convert: false,
          })}{" "}
          →{" "}
          {formatCurrency(sampleUsd, {
            from: "USD",
            currency: "USD",
            convert: false,
          })}{" "}
          at the current rate.
        </p>
        <div className="mt-5">
          <Button type="submit" disabled={loading || saving}>
            {saving ? "Saving…" : "Save store details"}
          </Button>
        </div>
      </form>

      <form onSubmit={saveShipping} className="card p-6">
        <h2 className="font-semibold text-slate-900">Shipping (BDT)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Flat shipping rate (BDT)"
            type="number"
            min="0"
            step="0.01"
            value={shipping.shippingFlatRate}
            onChange={setShippingField("shippingFlatRate")}
            disabled={loading || saving}
          />
          <Input
            label="Free shipping threshold (BDT)"
            type="number"
            min="0"
            step="0.01"
            value={shipping.freeShippingMin}
            onChange={setShippingField("freeShippingMin")}
            disabled={loading || saving}
          />
        </div>
        <div className="mt-5">
          <Button type="submit" disabled={loading || saving}>
            {saving ? "Saving…" : "Save shipping settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
