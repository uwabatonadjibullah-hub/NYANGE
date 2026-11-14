# Nyange Radjabu Family Heritage

The family website of the descendants of **NYANGE RADJABU**: history, the family tree, and private channels for family notices. It has two parts:

| Part | Address | Who uses it |
|---|---|---|
| Public website | `/`, `/family-tree`, `/person/:id`, `/history`, `/gallery`, `/contact`, `/support`, `/privacy` | Everyone (English, Kiswahili, Kinyarwanda) |
| Administration | `/admin` | Family administrators only (Google sign-in) |

Built with React 19, TypeScript (strict), Vite, Tailwind CSS 4 and Firebase (Firestore + Authentication).

---

## 1. Run it on your computer

Requires Node.js 22+.

```bash
npm ci
```

```bash
npm run dev
```

Open http://localhost:3000. Without further setup the site talks to the real Firebase project (read-only for visitors).

### Work safely with local emulators (recommended for development)

Requires Java 11+ for the Firestore emulator.

```bash
npx firebase-tools emulators:start --only firestore,auth --project nyangefamilie
```

In a second terminal:

```bash
VITE_FIREBASE_EMULATOR=true npm run dev
```

Nothing you do then touches the real family data.

### Checks

```bash
npm run check
```

Runs the type checker, the unit tests (genealogy, tree layout, form sanitising) and a production build.

```bash
npx firebase-tools emulators:exec --only firestore --project demo-nyange "npx vitest run --config vitest.rules.config.ts"
```

Runs the security-rules tests (who may read and write what) against the Firestore emulator.

---

## 2. First-time setup of the administration (do this once)

Administrators are listed in the Firestore collection `admins`. Nobody is an administrator until the first one is added **by hand in the Firebase console** — this is intentional, so no one can make themselves an administrator through the website.

1. Deploy the security rules (section 3).
2. Open `https://<your-site>/admin` and sign in with the Google account of the first administrator.
3. You will see **“Access not granted”** with your **User ID**. Copy it.
4. In the [Firebase console](https://console.firebase.google.com/) → Firestore Database → select the database **`ai-studio-nyangeradjabufam-3444fc95-46f8-4ad5-9250-9dc5e6f0f86f`** → start collection **`admins`** → document ID = your User ID, with the fields:
   - `email` (string): your Google e-mail
   - `role` (string): `superadmin`
   - `active` (boolean): `true`
5. Reload `/admin`. You are in.
6. Open **Family registry → Import now** once. This copies the 91 records from the preliminary census report into the database. From then on the database is the single source of truth.
7. Add other administrators under **Administrators**. They sign in once, send you the User ID shown on their screen, and you add it with a role:
   - **superadmin**: everything, including managing administrators
   - **editor**: edit the family tree and website content, and review submissions
   - **reviewer**: read and decide on claims, Record Me notices and messages

Also in the Firebase console → Authentication:
- Sign-in method → enable **Google**.
- Settings → Authorised domains → add your website domain(s) (for example the Vercel or `web.app` address).

We strongly recommend that every administrator turns on **2-Step Verification** for their Google account.

---

## 3. Deploy

### Security rules (always deploy these first)

```bash
npx firebase-tools deploy --only firestore:rules --project nyangefamilie
```

`firebase.json` points the rules at the named database the app uses.

### Website — Firebase Hosting

```bash
npm run build
```

```bash
npx firebase-tools deploy --only hosting --project nyangefamilie
```

### Website — Vercel (alternative)

Import the GitHub repository in Vercel. `vercel.json` sets the build command, the single-page-app rewrites and the security headers. Use one hosting provider as the official address to avoid confusion.

### Optional: App Check (recommended against spam)

1. Firebase console → App Check → register the web app with **reCAPTCHA Enterprise** and copy the site key.
2. Set `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` in the hosting environment (Vercel → Environment Variables, or a local `.env` before `npm run build`).
3. Deploy, confirm in the App Check dashboard that requests are verified, then click **Enforce** for Cloud Firestore.

---

## 4. How the security works

- **Public visitors** can read the family registry (`persons`) and website content (`content/site`). They can *send* Record Me notices, children claims and contact messages, but can never read them back — not even with a reference number. Every submission is validated by the rules (allowed fields, lengths, consent, server time, reference format).
- **Administrators** must sign in with Google, have a verified e-mail, and be listed and active in `admins`. Each role is enforced by the rules on the server, not only in the interface.
- Every administrator change is written together with an **append-only activity log** entry in one atomic batch. Log entries cannot be edited or deleted.
- Admin sessions end when the browser is closed and after **30 minutes without activity**.
- A superadmin cannot demote, deactivate or delete themselves (prevents lock-out).
- Security headers (Content-Security-Policy, X-Frame-Options, Referrer-Policy, HSTS, …) are set in `firebase.json` and `vercel.json`.
- The Firebase web configuration in `firebase-applet-config.json` is public by design. Restrict the API key to your website domains in Google Cloud console → APIs & Services → Credentials.

The rules are in `firestore.rules`; their tests are in `tests/firestore.rules.test.ts`.

---

## 5. Family data rules

The family tree starts from the preliminary census report *“RIPOTI YA IDADI YA FAMILIA ZA BABU NYANGE RAJABU — TOLEO LA UKAGUZI — Miaka 15+”* (`src/data/seed.ts`):

- Names are kept exactly as written in the report.
- The 8 report sections are stored as **family sections**, linked to Nyange Radjabu as **unconfirmed** until the family confirms which son or daughter each refers to (shown with dashed lines in the tree).
- No gender, birth order, place or “verified” status is invented. Report row order is used for sorting only.
- Unknown counts stay unknown (never zero). Missing children are shown as “not yet recorded”, never as “no children”; only an administrator can mark “family confirmed: no descendants”.
- The figure **398+** is the members aged 15+ *reported so far*; 7 families of Nyange Radjabu’s children had not yet reported.
- Living people never show birth year or place on the public site.
- **Data checks** (Admin → Family registry) list figures that need family confirmation, for example: the Mselem section reports 116 members, but its listed households add up to 126; Mariam reports 79, but its households add up to 78.

## 6. Translations

All public text is in `src/i18n/en.ts`, `sw.ts` and `rw.ts`. TypeScript refuses to build if a Kiswahili or Kinyarwanda text is missing. The Kiswahili and Kinyarwanda texts should be reviewed by native speakers in the family. The administration screens are in English.

## 7. Project structure

```
src/
  App.tsx              routes (public site + lazy-loaded /admin)
  components/          layout, family tree explorer, dialogs, form helpers
  pages/               public pages
  admin/               administration app (auth, data API, pages)
  lib/                 genealogy, tree layout, Firebase, submissions, content
  data/seed.ts         census-report data used for the first import
  i18n/                translations
firestore.rules        database security rules
tests/                 security-rules tests (Firestore emulator)
```
