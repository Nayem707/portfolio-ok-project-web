import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
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
import { api } from "@/services/api";
import { SOCIAL_LINK_KEYS } from "@/constants";
import { resolveMediaUrl } from "@/utils";

const SOCIAL_LINK_LABELS = {
  facebook: "Facebook page URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  youtube: "YouTube channel URL",
  messenger: "Messenger URL (m.me/…)",
};
const LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const LOGO_MAX_SIZE_MB = 5;
const isHttpUrl = (value) => /^https?:\/\//i.test(value);

const toFooterForm = (settings) => ({
  whatsapp: settings?.whatsapp || "",
  logoUrl: settings?.logoUrl || "",
  footerDescription: settings?.footerDescription || "",
  supportHours: settings?.supportHours || "",
  copyrightName: settings?.copyrightName || "",
  socialLinks: Object.fromEntries(
    SOCIAL_LINK_KEYS.map((key) => [key, settings?.socialLinks?.[key] || ""]),
  ),
});

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
    deliveryInsideDhaka: 70,
    deliveryOutsideDhaka: 150,
  });
  const [footer, setFooter] = useState(() => toFooterForm(settings));
  const [footerErrors, setFooterErrors] = useState({});
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreviewFailed, setLogoPreviewFailed] = useState(false);
  const logoInputRef = useRef(null);

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
      deliveryInsideDhaka: settings.deliveryInsideDhaka ?? 70,
      deliveryOutsideDhaka: settings.deliveryOutsideDhaka ?? 150,
    });
    setFooter(toFooterForm(settings));
    setFooterErrors({});
    setLogoPreviewFailed(false);
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
      toast.error(
        typeof err === "string" ? err : "Failed to save store details",
      );
    }
  };

  const setFooterField = (key) => (e) =>
    setFooter((prev) => ({ ...prev, [key]: e.target.value }));
  const setSocialLink = (key) => (e) =>
    setFooter((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: e.target.value },
    }));

  const handleLogoFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WebP, GIF, or AVIF image");
      return;
    }
    if (file.size > LOGO_MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${LOGO_MAX_SIZE_MB}MB`);
      return;
    }

    setLogoUploading(true);
    try {
      const uploaded = await api.uploadImages(file);
      const first = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      if (!first?.url) throw new Error("Upload did not return an image URL");
      setFooter((prev) => ({ ...prev, logoUrl: first.url }));
      setLogoPreviewFailed(false);
      toast.success("Logo uploaded — save footer settings to apply it");
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to upload logo",
      );
    } finally {
      setLogoUploading(false);
    }
  };

  const saveFooter = async (e) => {
    e.preventDefault();
    const logoUrl = footer.logoUrl.trim();
    const socialLinks = Object.fromEntries(
      SOCIAL_LINK_KEYS.map((key) => [key, footer.socialLinks[key].trim()]),
    );

    const nextErrors = {};
    if (logoUrl && !isHttpUrl(logoUrl) && !logoUrl.startsWith("/")) {
      nextErrors.logoUrl = "Enter a full image URL or upload a logo";
    }
    SOCIAL_LINK_KEYS.forEach((key) => {
      if (socialLinks[key] && !isHttpUrl(socialLinks[key])) {
        nextErrors[key] = "Must start with http:// or https://";
      }
    });
    setFooterErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await dispatch(
        saveStoreSettings({
          whatsapp: footer.whatsapp.trim(),
          logoUrl,
          footerDescription: footer.footerDescription.trim(),
          supportHours: footer.supportHours.trim(),
          copyrightName: footer.copyrightName.trim(),
          socialLinks,
        }),
      ).unwrap();
      toast.success("Footer settings saved");
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : "Failed to save footer settings",
      );
    }
  };

  const saveShipping = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        saveShippingSettings({
          deliveryInsideDhaka: Number(shipping.deliveryInsideDhaka),
          deliveryOutsideDhaka: Number(shipping.deliveryOutsideDhaka),
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

      <form onSubmit={saveFooter} className="card p-6">
        <h2 className="font-semibold text-slate-900">Footer</h2>
        <p className="mt-1 text-xs text-slate-500">
          The footer also uses the store name, phone, support email and address
          above. Empty fields are hidden from the storefront.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="WhatsApp number"
            value={footer.whatsapp}
            onChange={setFooterField("whatsapp")}
            placeholder="e.g. 01713881993"
            maxLength={40}
            hint="Used for the footer and product page WhatsApp buttons."
            disabled={loading || saving}
          />
          <Input
            label="Helpline hours"
            value={footer.supportHours}
            onChange={setFooterField("supportHours")}
            placeholder="e.g. Every day, 10 AM — 10 PM"
            maxLength={100}
            disabled={loading || saving}
          />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Footer description
            </label>
            <textarea
              value={footer.footerDescription}
              onChange={setFooterField("footerDescription")}
              rows={3}
              maxLength={500}
              className="input-base resize-none"
              disabled={loading || saving}
            />
          </div>
          <Input
            label="Copyright name"
            value={footer.copyrightName}
            onChange={setFooterField("copyrightName")}
            placeholder={store.storeName || "Store name"}
            maxLength={200}
            hint={`Shown as: Copyright © ${new Date().getFullYear()} ${
              footer.copyrightName.trim() || store.storeName || "…"
            }. All rights reserved.`}
            disabled={loading || saving}
          />
          <div className="space-y-2">
            <Input
              label="Logo URL"
              value={footer.logoUrl}
              onChange={(e) => {
                setFooterField("logoUrl")(e);
                setLogoPreviewFailed(false);
              }}
              placeholder="https://… (leave empty to show the store name)"
              error={footerErrors.logoUrl}
              disabled={loading || saving}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={ArrowUpTrayIcon}
                loading={logoUploading}
                disabled={loading || saving}
                onClick={() => logoInputRef.current?.click()}
              >
                {logoUploading ? "Uploading…" : "Upload logo"}
              </Button>
              {footer.logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={logoUploading || saving}
                  onClick={() => {
                    setFooter((prev) => ({ ...prev, logoUrl: "" }));
                    setLogoPreviewFailed(false);
                  }}
                >
                  Remove logo
                </Button>
              )}
              {footer.logoUrl.trim() && !logoPreviewFailed && (
                <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1">
                  <img
                    src={resolveMediaUrl(footer.logoUrl.trim())}
                    alt="Logo preview"
                    className="h-6 w-auto max-w-30 object-contain"
                    onError={() => setLogoPreviewFailed(true)}
                  />
                </span>
              )}
            </div>
            {logoPreviewFailed && (
              <p className="text-xs text-amber-600">
                Logo preview unavailable. Check the URL.
              </p>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept={LOGO_TYPES.join(",")}
              className="hidden"
              onChange={handleLogoFile}
            />
          </div>
        </div>

        <h3 className="mt-6 text-sm font-semibold text-slate-900">
          Social links
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Leave a link empty to hide its icon. WhatsApp and Call icons use the
          numbers above.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {SOCIAL_LINK_KEYS.map((key) => (
            <Input
              key={key}
              label={SOCIAL_LINK_LABELS[key]}
              value={footer.socialLinks[key]}
              onChange={setSocialLink(key)}
              placeholder="https://…"
              error={footerErrors[key]}
              disabled={loading || saving}
            />
          ))}
        </div>

        <div className="mt-5">
          <Button type="submit" disabled={loading || saving || logoUploading}>
            {saving ? "Saving…" : "Save footer settings"}
          </Button>
        </div>
      </form>

      <form onSubmit={saveShipping} className="card p-6">
        <h2 className="font-semibold text-slate-900">Shipping (BDT)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Inside Dhaka delivery charge (BDT)"
            type="number"
            min="0"
            step="0.01"
            value={shipping.deliveryInsideDhaka}
            onChange={setShippingField("deliveryInsideDhaka")}
            disabled={loading || saving}
            required
          />
          <Input
            label="Outside Dhaka delivery charge (BDT)"
            type="number"
            min="0"
            step="0.01"
            value={shipping.deliveryOutsideDhaka}
            onChange={setShippingField("deliveryOutsideDhaka")}
            disabled={loading || saving}
            required
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Customers choose their delivery area at checkout; the matching charge
          is added to the order total.
        </p>
        <div className="mt-5">
          <Button type="submit" disabled={loading || saving}>
            {saving ? "Saving…" : "Save shipping settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
