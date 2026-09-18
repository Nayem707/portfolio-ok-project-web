import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Avatar from "@/components/common/Avatar";
import { selectCurrentUser, updateProfile } from "@/features/auth";
import { api } from "@/services/api";

export default function ProfileView() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatarUrl || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      avatarUrl: user?.avatarUrl || "",
    });
  }, [user]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateMyProfile({
        name: form.name,
        phone: form.phone || "",
        avatarUrl: form.avatarUrl.trim() || null,
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
        <div className="flex items-center gap-5">
          <Avatar
            src={form.avatarUrl}
            name={form.name}
            size="xl"
            className="border-2 border-white shadow"
          />
          <div>
            <p className="text-lg font-semibold text-slate-800">{form.name}</p>
            <p className="text-sm text-slate-400">{form.email}</p>
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
          <Input
            label="Profile image URL"
            value={form.avatarUrl}
            onChange={set("avatarUrl")}
            placeholder="https://…"
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
