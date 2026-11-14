import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore/lite';
import firebaseConfig from '../../firebase-applet-config.json';

// The Firebase web configuration identifies the project; it is not a secret.
// Access is controlled by firestore.rules (and App Check when enabled).
export const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const DATABASE_ID = firebaseConfig.firestoreDatabaseId;

// Firestore Lite: a small REST client (no realtime listeners or offline queue). Writes
// resolve only after the server has accepted them, which is exactly what the
// public forms need, and the download stays small for visitors on mobile data.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true }, DATABASE_ID);

/** Local development only: `VITE_FIREBASE_EMULATOR=true npm run dev` talks to the Firebase emulators. */
export const USE_EMULATOR = import.meta.env.VITE_FIREBASE_EMULATOR === 'true';
if (USE_EMULATOR) connectFirestoreEmulator(db, '127.0.0.1', 8080);

// Optional App Check. Set VITE_RECAPTCHA_ENTERPRISE_SITE_KEY to enable, then enforce in the console.
const appCheckKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY as string | undefined;
if (appCheckKey) {
  import('firebase/app-check')
    .then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) => {
      initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(appCheckKey), isTokenAutoRefreshEnabled: true });
    })
    .catch(() => {
      /* App Check is optional; requests continue without it. */
    });
}
