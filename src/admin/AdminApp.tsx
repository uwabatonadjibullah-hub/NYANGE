import { ClipboardList, FileText, GitFork, History, Inbox, LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { Emblem } from '../components/Logo';
import { Alert, Button } from '../components/ui';
import { useMeta } from '../lib/useMeta';
import { can, signIn, signOutAdmin, useAdminSession, useIdleSignOut, type AdminSession } from './auth';
import { AdminSessionContext } from './context';

const Overview = lazy(() => import('./pages/Overview'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const RegistryPage = lazy(() => import('./pages/RegistryPage'));
const ContentPage = lazy(() => import('./pages/ContentPage'));
const AdminsPage = lazy(() => import('./pages/AdminsPage'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));

function SignInScreen() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <div className="rounded-lg border border-line bg-white p-8 text-center">
        <Emblem className="mx-auto h-16 w-16" />
        <h1 className="mt-4 font-serif text-3xl">Family administration</h1>
        <p className="mt-2 text-muted">For authorised family administrators only. Sign in with the Google account the family registered for you.</p>
        <Button
          className="mt-6 w-full"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await signIn();
            } catch (e) {
              const code = (e as { code?: string }).code ?? '';
              setError(code === 'auth/popup-closed-by-user' ? 'Sign-in was cancelled.' : code === 'auth/unauthorized-domain' ? 'This website address is not authorised for sign-in yet. Add it under Firebase Authentication → Settings → Authorised domains.' : 'Sign-in failed. Please try again.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Opening Google…' : 'Sign in with Google'}
        </Button>
        {error && <div className="mt-4 text-left"><Alert tone="error">{error}</Alert></div>}
        <Link to="/" className="mt-6 inline-block text-primary underline">Back to the family website</Link>
      </div>
    </div>
  );
}

function DeniedScreen({ email, uid, reason }: { email: string; uid: string; reason: string }) {
  const messages: Record<string, string> = {
    not_listed: 'This Google account is not on the list of family administrators.',
    inactive: 'This administrator account has been deactivated.',
    unverified: 'This account’s e-mail address is not verified.',
    provider: 'Administrators must sign in with Google.',
  };
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4">
      <div className="rounded-lg border border-line bg-white p-8">
        <h1 className="font-serif text-2xl">Access not granted</h1>
        <p className="mt-3">{messages[reason] ?? messages.not_listed}</p>
        <p className="mt-4 text-muted">If you should have access, send the following details to a family superadministrator so they can add you:</p>
        <dl className="mt-3 space-y-2 rounded-md bg-mint-soft p-4">
          <div><dt className="text-sm text-muted">E-mail</dt><dd className="break-all font-mono">{email}</dd></div>
          <div><dt className="text-sm text-muted">User ID</dt><dd className="break-all font-mono">{uid}</dd></div>
        </dl>
        <Button variant="secondary" className="mt-6" onClick={signOutAdmin}>Sign out</Button>
      </div>
    </div>
  );
}

function Shell({ session }: { session: AdminSession }) {
  useIdleSignOut(true);
  const items = [
    { to: '/admin', label: 'Overview', Icon: LayoutDashboard, end: true, show: true },
    { to: '/admin/claims', label: 'Children claims', Icon: ClipboardList, show: true },
    { to: '/admin/notices', label: 'Record Me', Icon: Inbox, show: true },
    { to: '/admin/messages', label: 'Messages', Icon: FileText, show: true },
    { to: '/admin/registry', label: 'Family registry', Icon: GitFork, show: can.edit(session.role) },
    { to: '/admin/content', label: 'Website content', Icon: FileText, show: can.edit(session.role) },
    { to: '/admin/admins', label: 'Administrators', Icon: Users, show: can.manageAdmins(session.role) },
    { to: '/admin/activity', label: 'Activity log', Icon: History, show: true },
  ].filter((i) => i.show);

  return (
    <AdminSessionContext.Provider value={session}>
      <div className="min-h-dvh bg-paper">
        <header className="sticky top-0 z-30 border-b border-line bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
            <Link to="/admin" className="flex items-center gap-2">
              <Emblem className="h-9 w-9" />
              <span className="font-serif text-lg text-primary">Family administration</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="hidden text-right text-sm sm:block">
                <span className="block font-medium">{session.email}</span>
                <span className="inline-flex items-center gap-1 text-muted"><ShieldCheck className="h-4 w-4" aria-hidden />{session.role}</span>
              </span>
              <Link to="/" className="hidden min-h-11 items-center rounded-md px-3 text-primary underline md:inline-flex">View website</Link>
              <Button variant="secondary" onClick={signOutAdmin}>
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </Button>
            </div>
          </div>
          <nav aria-label="Administration" className="mx-auto max-w-7xl overflow-x-auto px-2">
            <ul className="flex gap-1 whitespace-nowrap">
              {items.map(({ to, label, Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) => `inline-flex min-h-11 items-center gap-2 border-b-2 px-3 font-medium ${isActive ? 'border-primary text-primary' : 'border-transparent text-ink hover:text-primary'}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden /> {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Suspense fallback={<p role="status" className="py-10 text-center text-muted">Loading…</p>}>
            <Routes>
              <Route index element={<Overview />} />
              <Route path="claims" element={<ReviewPage kind="submissions" />} />
              <Route path="notices" element={<ReviewPage kind="notifications" />} />
              <Route path="messages" element={<ReviewPage kind="messages" />} />
              {can.edit(session.role) && <Route path="registry" element={<RegistryPage />} />}
              {can.edit(session.role) && <Route path="content" element={<ContentPage />} />}
              {can.manageAdmins(session.role) && <Route path="admins" element={<AdminsPage />} />}
              <Route path="activity" element={<ActivityPage />} />
              <Route path="*" element={<p className="py-10">Page not found or not available for your role.</p>} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </AdminSessionContext.Provider>
  );
}

export default function AdminApp() {
  useMeta('Administration', { noindex: true });
  const state = useAdminSession();
  if (state.status === 'loading') return <p role="status" className="py-20 text-center text-muted">Checking your access…</p>;
  if (state.status === 'signed_out') return <SignInScreen />;
  if (state.status === 'denied') return <DeniedScreen email={state.user.email ?? ''} uid={state.user.uid} reason={state.reason} />;
  return <Shell session={state.session} />;
}
