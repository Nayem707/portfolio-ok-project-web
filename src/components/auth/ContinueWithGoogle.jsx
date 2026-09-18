import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "@/components/common/Button";
import { loginSuccess } from "@/features/auth";
import { api } from "@/services/api";
import {
  completeGoogleRedirectSignIn,
  isFirebaseConfigured,
  signInWithGoogleIdToken,
  stashGoogleAuthContext,
  takeGoogleAuthContext,
} from "@/lib/firebase";

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3l-.9.7-2.5 1.9C4.8 19.7 8.1 21.6 12 21.6c2.7 0 5-0.9 6.7-2.4l-3.1-2.4c-.9.6-2 .9-3.6.9-2.8 0-5.1-1.9-6-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M3.2 7.1C2.4 8.6 2 10.2 2 12s.4 3.4 1.2 4.9l3.4-2.6C6.2 13.4 6 12.7 6 12s.2-1.4.6-2.3L3.2 7.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 8.1 2 4.8 3.9 3.2 7.1l3.4 2.6C7 7.8 9.2 5.9 12 5.9z"
      />
    </svg>
  );
}

/**
 * Continues with Google via Firebase, then exchanges the ID token
 * for the app's existing JWT session (loginSuccess).
 * Uses redirect on live hosts to avoid Cross-Origin-Opener-Policy popup blocks.
 */
export default function ContinueWithGoogle({ mode = "login" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const finishWithIdToken = async (idToken, authMode = mode, returnTo = from) => {
    const response = await api.loginWithGoogle({ idToken });
    const user = response?.user ?? response;

    dispatch(
      loginSuccess({
        user,
        accessToken: response?.accessToken,
        refreshToken: response?.refreshToken,
      }),
    );

    toast.success(
      authMode === "register"
        ? "Account ready — welcome!"
        : `Welcome back, ${(user.name || user.email || "there").split(" ")[0]}!`,
    );

    navigate(returnTo || (user.role === "ADMIN" ? "/admin" : "/account"), {
      replace: true,
    });
  };

  useEffect(() => {
    if (!isFirebaseConfigured()) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const idToken = await completeGoogleRedirectSignIn();
        if (!idToken || cancelled) return;
        setLoading(true);
        const { returnTo, mode: authMode } = takeGoogleAuthContext();
        await finishWithIdToken(idToken, authMode, returnTo || undefined);
      } catch (error) {
        if (cancelled) return;
        const message =
          error?.response?.data?.error?.message ||
          error?.message ||
          "Google sign-in failed";
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Run once on mount to complete redirect return.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = async () => {
    if (!isFirebaseConfigured()) {
      toast.error("Google sign-in is not configured");
      return;
    }

    setLoading(true);
    try {
      stashGoogleAuthContext({ returnTo: from || "", mode });
      const idToken = await signInWithGoogleIdToken();
      // Redirect flow navigates away; popup flow returns a token here.
      if (!idToken) return;
      await finishWithIdToken(idToken);
    } catch (error) {
      if (error?.code === "auth/popup-closed-by-user") {
        return;
      }
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Google sign-in failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-50 px-2 text-slate-400">or</span>
        </div>
      </div>
      <Button
        type="button"
        fullWidth
        size="lg"
        variant="secondary"
        loading={loading}
        onClick={handleClick}
        leftIcon={GoogleIcon}
      >
        Continue with Google
      </Button>
    </div>
  );
}
