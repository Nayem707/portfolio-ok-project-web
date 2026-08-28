import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { CameraIcon } from "@heroicons/react/24/outline";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { selectCurrentUser, updateProfile } from "@/store/slices/authSlice";

export default function Profile() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      dispatch(updateProfile(form));
      setLoading(false);
      toast.success("Profile updated");
    }, 500);
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
          <div className="relative">
            <img
              src={form.avatar || "https://i.pravatar.cc/150?img=12"}
              alt={form.name}
              className="h-20 w-20 rounded-full border-2 border-white object-cover shadow"
            />
            <button
              type="button"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition hover:bg-primary-700"
              aria-label="Change photo"
            >
              <CameraIcon className="h-4 w-4" />
            </button>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">{form.name}</p>
            <p className="text-sm text-slate-400">{form.email}</p>
          </div>
        </div>

        <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="Full name" value={form.name} onChange={set("name")} />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set("email")}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+1 202 555 0100"
          />
          <Input
            label="Profile image URL"
            value={form.avatar}
            onChange={set("avatar")}
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
