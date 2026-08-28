import { useState } from "react";
import toast from "react-hot-toast";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        enabled ? "bg-primary-600" : "bg-slate-300"
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function AccountSettings() {
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    security: true,
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) =>
    setPasswords({ ...passwords, [key]: e.target.value });

  const changePassword = (e) => {
    e.preventDefault();
    if (passwords.next.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPasswords({ current: "", next: "", confirm: "" });
      toast.success("Password changed successfully");
    }, 600);
  };

  const toggleNotif = (key) => (val) => {
    setNotifications((prev) => ({ ...prev, [key]: val }));
    toast.success("Preferences updated");
  };

  const notifLabels = {
    orderUpdates: {
      title: "Order updates",
      desc: "Get notified about your order status",
    },
    promotions: {
      title: "Promotions & deals",
      desc: "Receive special offers and discounts",
    },
    newsletter: { title: "Newsletter", desc: "Weekly digest of new arrivals" },
    security: {
      title: "Security alerts",
      desc: "Important account security notifications",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your password and notification preferences.
        </p>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900">Change Password</h2>
        <form
          onSubmit={changePassword}
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2 sm:w-1/2 sm:pr-2">
            <Input
              label="Current password"
              type="password"
              leftIcon={LockClosedIcon}
              value={passwords.current}
              onChange={set("current")}
            />
          </div>
          <Input
            label="New password"
            type="password"
            leftIcon={LockClosedIcon}
            value={passwords.next}
            onChange={set("next")}
          />
          <Input
            label="Confirm new password"
            type="password"
            leftIcon={LockClosedIcon}
            value={passwords.confirm}
            onChange={set("confirm")}
          />
          <div className="sm:col-span-2">
            <Button type="submit" loading={loading}>
              Update password
            </Button>
          </div>
        </form>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900">
          Notification Preferences
        </h2>
        <div className="mt-4 divide-y divide-slate-100">
          {Object.entries(notifLabels).map(([key, { title, desc }]) => (
            <div key={key} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-800">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <Toggle
                enabled={notifications[key]}
                onChange={toggleNotif(key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card border-red-100 p-6">
        <h2 className="font-semibold text-red-700">Danger Zone</h2>
        <p className="mt-1 text-sm text-slate-500">
          Permanently delete your account and all associated data.
        </p>
        <Button
          variant="danger"
          className="mt-4"
          onClick={() =>
            toast.error("Account deletion is disabled in this demo")
          }
        >
          Delete account
        </Button>
      </div>
    </div>
  );
}
