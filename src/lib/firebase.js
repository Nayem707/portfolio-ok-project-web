import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const GOOGLE_AUTH_RETURN_KEY = "googleAuthReturnTo";
const GOOGLE_AUTH_MODE_KEY = "googleAuthMode";

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured");
  }
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function prefersRedirectSignIn() {
  // Popups break when Cross-Origin-Opener-Policy is `same-origin` (common on Coolify/nginx).
  // Redirect works reliably in production; keep popup for local/dev.
  return import.meta.env.PROD || window.location.hostname !== "localhost";
}

export function stashGoogleAuthContext({ returnTo = "", mode = "login" } = {}) {
  sessionStorage.setItem(GOOGLE_AUTH_RETURN_KEY, returnTo || "");
  sessionStorage.setItem(GOOGLE_AUTH_MODE_KEY, mode || "login");
}

export function takeGoogleAuthContext() {
  const returnTo = sessionStorage.getItem(GOOGLE_AUTH_RETURN_KEY) || "";
  const mode = sessionStorage.getItem(GOOGLE_AUTH_MODE_KEY) || "login";
  sessionStorage.removeItem(GOOGLE_AUTH_RETURN_KEY);
  sessionStorage.removeItem(GOOGLE_AUTH_MODE_KEY);
  return { returnTo, mode };
}

/**
 * Starts Google sign-in and returns a Firebase ID token when the flow
 * completes in-page (popup). Redirect flows return null and resume later
 * via `completeGoogleRedirectSignIn()`.
 */
export async function signInWithGoogleIdToken() {
  const auth = getFirebaseAuth();

  if (prefersRedirectSignIn()) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user.getIdToken();
  } catch (error) {
    // If a proxy/browser blocks the popup (COOP), fall back to redirect.
    const code = error?.code || "";
    if (
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      String(error?.message || "").includes("Cross-Origin-Opener-Policy")
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

/**
 * Completes Google redirect sign-in after returning to the app.
 * Returns an ID token, or null when there is no pending redirect result.
 */
export async function completeGoogleRedirectSignIn() {
  if (!isFirebaseConfigured()) return null;
  const auth = getFirebaseAuth();
  const result = await getRedirectResult(auth);
  if (!result?.user) return null;
  return result.user.getIdToken();
}

/** Clears the Firebase client session (safe if not signed in / not configured). */
export async function signOutFirebase() {
  if (!isFirebaseConfigured()) return;
  try {
    await firebaseSignOut(getFirebaseAuth());
  } catch {
    // Ignore Firebase logout errors; app session is cleared separately.
  }
}
