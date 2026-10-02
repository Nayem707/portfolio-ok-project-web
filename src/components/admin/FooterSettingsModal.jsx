import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import {
  saveStoreSettings,
  selectSettings,
  selectSettingsSaving,
} from "@/features/settings";
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
  phone: settings?.phone || "",
  whatsapp: settings?.whatsapp || "",
  supportEmail: settings?.supportEmail || "",
  address: settings?.address || "",
  logoUrl: settings?.logoUrl || "",
  footerDescription: settings?.footerDescription || "",
  supportHours: settings?.supportHours || "",
  copyrightName: settings?.copyrightName || "",
  socialLinks: Object.fromEntries(
    SOCIAL_LINK_KEYS.map((key) => [key, settings?.socialLinks?.[key] || ""]),
  ),
});

export default function FooterSettingsModal({ open, onClose }) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const saving = useSelector(selectSettingsSaving);
  const [footer, setFooter] = useState(() => toFooterForm(settings));
  const [errors, setErrors] = useState({});
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreviewFailed, setLogoPreviewFailed] = useState(false);
  const logoInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setFooter(toFooterForm(settings));
    setErrors({});
    setLogoPreviewFailed(false);
    // Reset only when the editor opens so in-progress edits are kept.
  }, [open]);

  const busy = saving || logoUploading;
  const storeName = settings?.storeName || "";

  const setField = (key) => (e) =>
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
      toast.success("Logo uploaded — save to apply it");
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

  const save = async () => {
    const supportEmail = footer.supportEmail.trim();
    const logoUrl = footer.logoUrl.trim();
    const socialLinks = Object.fromEntries(
      SOCIAL_LINK_KEYS.map((key) => [key, footer.socialLinks[key].trim()]),
    );

    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      nextErrors.supportEmail = "Enter a valid email address";
    }
    if (logoUrl && !isHttpUrl(logoUrl) && !logoUrl.startsWith("/")) {
      nextErrors.logoUrl = "Enter a full image URL or upload a logo";
    }
    SOCIAL_LINK_KEYS.forEach((key) => {
      if (socialLinks[key] && !isHttpUrl(socialLinks[key])) {
        nextErrors[key] = "Must start with http:// or https://";
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await dispatch(
        saveStoreSettings({
          phone: footer.phone.trim(),
          whatsapp: footer.whatsapp.trim(),
          supportEmail,
          address: footer.address.trim(),
          logoUrl,
          footerDescription: footer.footerDescription.trim(),
          supportHours: footer.supportHours.trim(),
          copyrightName: footer.copyrightName.trim(),
          socialLinks,
        }),
      ).unwrap();
      toast.success("Footer saved");
      onClose();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save footer");
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title="Footer Content"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={logoUploading}>
            Save / Update
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <p className="text-xs text-slate-500">
          Empty fields are hidden from the storefront footer. Phone and WhatsApp
          are also used on product pages.
        </p>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">Brand</h4>
          <div className="mt-3 space-y-4">
            <div className="space-y-2">
              <Input
                label="Logo URL"
                value={footer.logoUrl}
                onChange={(e) => {
                  setField("logoUrl")(e);
                  setLogoPreviewFailed(false);
                }}
                placeholder={`https://… (leave empty to show "${storeName || "store name"}")`}
                error={errors.logoUrl}
                disabled={saving}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={ArrowUpTrayIcon}
                  loading={logoUploading}
                  disabled={saving}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoUploading ? "Uploading…" : "Upload logo"}
                </Button>
                {footer.logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Footer description
              </label>
              <textarea
                value={footer.footerDescription}
                onChange={setField("footerDescription")}
                rows={3}
                maxLength={500}
                className="input-base resize-none"
                disabled={saving}
              />
            </div>
            <Input
              label="Copyright name"
              value={footer.copyrightName}
              onChange={setField("copyrightName")}
              placeholder={storeName || "Store name"}
              maxLength={200}
              hint={`Shown as: Copyright © ${new Date().getFullYear()} ${
                footer.copyrightName.trim() || storeName || "…"
              }. All rights reserved.`}
              disabled={saving}
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Contact details
          </h4>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone"
              value={footer.phone}
              onChange={setField("phone")}
              placeholder="e.g. 01713881993"
              maxLength={40}
              disabled={saving}
            />
            <Input
              label="WhatsApp number"
              value={footer.whatsapp}
              onChange={setField("whatsapp")}
              placeholder="e.g. 01713881993"
              maxLength={40}
              disabled={saving}
            />
            <Input
              label="Email"
              type="email"
              value={footer.supportEmail}
              onChange={setField("supportEmail")}
              error={errors.supportEmail}
              disabled={saving}
            />
            <Input
              label="Helpline hours"
              value={footer.supportHours}
              onChange={setField("supportHours")}
              placeholder="e.g. Every day, 10 AM — 10 PM"
              maxLength={100}
              disabled={saving}
            />
            <div className="sm:col-span-2">
              <Input
                label="Address"
                value={footer.address}
                onChange={setField("address")}
                maxLength={300}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">Social links</h4>
          <p className="mt-1 text-xs text-slate-500">
            Leave a link empty to hide its icon. The WhatsApp and Call icons use
            the numbers above.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {SOCIAL_LINK_KEYS.map((key) => (
              <Input
                key={key}
                label={SOCIAL_LINK_LABELS[key]}
                value={footer.socialLinks[key]}
                onChange={setSocialLink(key)}
                placeholder="https://…"
                error={errors[key]}
                disabled={saving}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
