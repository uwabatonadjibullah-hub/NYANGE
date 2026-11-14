import {
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  setPersistence,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
import { app, db, USE_EMULATOR } from '../lib/firebase';

export type AdminRole = 'superadmin' | 'editor' | 'reviewer';

export interface AdminSession {
  user: User;
  role: AdminRole;
  email: string;
}

export const auth = getAuth(app);
if (USE_EMULATOR) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  // Automated tests only (emulator builds): sign in with a fake Google ID token.
  (window as unknown as { __e2eSignIn: (t: string) => Promise<unknown> }).__e2eSignIn = (idToken: string) =>
    signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
}
// Admin sessions end when the browser tab/window is closed (important on shared phones).
const persistenceReady = setPersistence(auth, browserSessionPersistence).catch(() => undefined);

export async function signIn(): Promise<void> {
  // The popup must open in the same tick as the click, so nothing is awaited first
  // (Safari and other browsers block popups opened after an await).
  void persistenceReady;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw e;
  }
}

export const signOutAdmin = () => signOut(auth);

type State =
  | { status: 'loading' }
  | { status: 'signed_out' }
  | { status: 'denied'; user: User; reason: 'not_listed' | 'inactive' | 'unverified' | 'provider' }
  | { status: 'ok'; session: AdminSession };

/** Resolves the signed-in user's admin record. The UI check mirrors firestore.rules, which are the real gate. */
export function useAdminSession(): State {
  const [state, setState] = useState<State>({ status: 'loading' });
  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!user) return setState({ status: 'signed_out' });
        if (!user.emailVerified) return setState({ status: 'denied', user, reason: 'unverified' });
        if (!user.providerData.some((p) => p.providerId === 'google.com')) return setState({ status: 'denied', user, reason: 'provider' });
        try {
          const snap = await getDoc(doc(db, 'admins', user.uid));
          if (!snap.exists()) return setState({ status: 'denied', user, reason: 'not_listed' });
          const data = snap.data() as { role?: string; active?: boolean; email?: string };
          if (data.active === false) return setState({ status: 'denied', user, reason: 'inactive' });
          const role: AdminRole = data.role === 'superadmin' || data.role === 'editor' ? data.role : 'reviewer';
          setState({ status: 'ok', session: { user, role, email: user.email ?? data.email ?? '' } });
        } catch {
          setState({ status: 'denied', user, reason: 'not_listed' });
        }
      }),
    [],
  );
  return state;
}

const IDLE_MS = 30 * 60 * 1000;

/** Signs the administrator out after 30 minutes without interaction. */
export function useIdleSignOut(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let timer = window.setTimeout(signOutAdmin, IDLE_MS);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(signOutAdmin, IDLE_MS);
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'visibilitychange'];
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [active]);
}

export const can = {
  review: (r: AdminRole) => Boolean(r),
  edit: (r: AdminRole) => r === 'superadmin' || r === 'editor',
  manageAdmins: (r: AdminRole) => r === 'superadmin',
};
