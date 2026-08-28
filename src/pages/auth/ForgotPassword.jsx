import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function ForgotPassword() {
  const [step, setStep] = useState("email"); // email | verify | reset | done
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const run = (fn) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      fn();
    }, 600);
  };

  const submitEmail = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Enter a valid email" });
      return;
    }
    setErrors({});
    run(() => {
      toast.success("Reset code sent to your email");
      setStep("verify");
    });
  };

  const submitCode = (e) => {
    e.preventDefault();
    if (code.length < 4) {
      setErrors({ code: "Enter the 6-digit code" });
      return;
    }
    setErrors({});
    run(() => setStep("reset"));
  };

  const submitReset = (e) => {
    e.preventDefault();
    const next = {};
    if (passwords.password.length < 6) next.password = "At least 6 characters";
    if (passwords.confirm !== passwords.password)
      next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;
    run(() => {
      toast.success("Password reset successfully");
      setStep("done");
    });
  };

  return (
    <div>
      {step !== "done" && (
        <>
          <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {step === "email" && "Enter your email to receive a reset code."}
            {step === "verify" && `We sent a code to ${email}.`}
            {step === "reset" && "Choose a new password for your account."}
          </p>
        </>
      )}

      {step === "email" && (
        <form onSubmit={submitEmail} className="mt-6 space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            leftIcon={EnvelopeIcon}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Send reset code
          </Button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={submitCode} className="mt-6 space-y-4">
          <Input
            label="Verification code"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            error={errors.code}
            hint="For this demo, enter any 6 digits."
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Verify code
          </Button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
          >
            Use a different email
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={submitReset} className="mt-6 space-y-4" noValidate>
          <Input
            label="New password"
            type="password"
            leftIcon={LockClosedIcon}
            placeholder="At least 6 characters"
            value={passwords.password}
            onChange={(e) =>
              setPasswords({ ...passwords, password: e.target.value })
            }
            error={errors.password}
          />
          <Input
            label="Confirm new password"
            type="password"
            leftIcon={LockClosedIcon}
            placeholder="Re-enter your password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
            error={errors.confirm}
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Reset password
          </Button>
        </form>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircleIcon className="h-16 w-16 text-emerald-500" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Password reset!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your password has been updated. You can now sign in with your new
            password.
          </p>
          <Button as={Link} to="/login" className="mt-6" size="lg">
            Back to sign in
          </Button>
        </div>
      )}

      {step !== "done" && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
