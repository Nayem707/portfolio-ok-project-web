import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { loginSuccess } from "@/store/slices/authSlice";
import { demoAccounts } from "@/data/accounts";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const validate = () => {
    const next = {};
    if (!form.email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // Frontend-only mock sign-in against demo accounts.
    // Replace with an API/JWT call once the backend is available.
    setTimeout(() => {
      const account = demoAccounts.find(
        (a) => a.email === form.email && a.password === form.password,
      );
      setLoading(false);
      if (!account) {
        setErrors({ password: "Invalid email or password" });
        toast.error("Invalid credentials");
        return;
      }
      const { password, ...user } = account;
      dispatch(loginSuccess(user));
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(from || (user.role === "ADMIN" ? "/admin" : "/account"), {
        replace: true,
      });
    }, 600);
  };

  const quickFill = (role) => {
    const account = demoAccounts.find((a) => a.role === role);
    setForm({ email: account.email, password: account.password });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Sign in to your account to continue shopping.
      </p>

      <div className="border-primary-100 bg-primary-50/60 text-primary-700 mt-4 rounded-lg border p-3 text-xs">
        <p className="font-medium">Demo accounts — click to autofill:</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => quickFill("USER")}
            className="ring-primary-100 hover:bg-primary-50 rounded-md bg-white px-2.5 py-1 font-medium shadow-sm ring-1"
          >
            User
          </button>
          <button
            type="button"
            onClick={() => quickFill("ADMIN")}
            className="ring-primary-100 hover:bg-primary-50 rounded-md bg-white px-2.5 py-1 font-medium shadow-sm ring-1"
          >
            Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          leftIcon={EnvelopeIcon}
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              leftIcon={LockClosedIcon}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute top-9 right-3 text-slate-400 hover:text-slate-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
