import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { CameraIcon, TrashIcon } from "@heroicons/react/24/outline";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Avatar from "@/components/common/Avatar";
import { selectCurrentUser, updateProfile } from "@/features/auth";
import { api } from "@/services/api";
import { resolveMediaUrl } from "@/utils";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_SIZE_MB = 5;

export default function ProfileView() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatarUrl || "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      avatarUrl: user?.avatarUrl || "",
    });
    setPendingFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const displayAvatarSrc =
    previewUrl || resolveMediaUrl(form.avatarUrl) || null;

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WebP, GIF, or AVIF image");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    setPendingFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const cancelPendingUpload = () => {
    setPendingFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const uploadAvatar = async () => {
    if (!pendingFile) {
      openFilePicker();
      return;
    }
    setUploading(true);
    try {
      const updated = await api.uploadMyAvatar(pendingFile);
      dispatch(updateProfile(updated));
      toast.success("Profile photo updated");
      cancelPendingUpload();
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message || "Failed to upload photo",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!form.avatarUrl && !pendingFile) return;
    if (pendingFile) {
      cancelPendingUpload();
      return;
    }
    setUploading(true);
    try {
      const updated = await api.removeMyAvatar();
      dispatch(updateProfile(updated));
      toast.success("Profile photo removed");
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message || "Failed to remove photo",
      );
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setLoading(true);
    try {
      const updated = await api.updateMyProfile({
        name: form.name.trim(),
        phone: form.phone || "",
      });
      dispatch(updateProfile(updated));
      toast.success("Profile updated");
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your personal information and photo.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar
              src={displayAvatarSrc}
              name={form.name}
              size="xl"
              className="border-2 border-white shadow"
            />
            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading}
              className="bg-primary-600 hover:bg-primary-700 absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition disabled:opacity-60"
              aria-label="Change photo"
            >
              <CameraIcon className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-800">{form.name}</p>
            <p className="text-sm text-slate-400">{form.email}</p>
            <p className="mt-1 text-xs text-slate-400">
              JPG, PNG, WebP, GIF, or AVIF · max {MAX_SIZE_MB}MB
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                loading={uploading}
                onClick={uploadAvatar}
              >
                {pendingFile ? "Upload photo" : "Choose photo"}
              </Button>
              {(pendingFile || form.avatarUrl) && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={uploading}
                  leftIcon={TrashIcon}
                  onClick={removeAvatar}
                >
                  {pendingFile ? "Cancel" : "Remove"}
                </Button>
              )}
            </div>
            {pendingFile && (
              <p className="mt-2 text-xs text-amber-600">
                Preview ready — click Upload photo to save.
              </p>
            )}
          </div>
        </div>

        <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="Full name" value={form.name} onChange={set("name")} />
          <Input label="Email" type="email" value={form.email} disabled />
          <Input
            label="Phone"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+1 202 555 0100"
          />
          <div className="sm:col-span-2">
            <Button type="submit" loading={loading}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
