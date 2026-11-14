import { Save, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Field, inputClass } from '../../components/ui';
import { listAdmins, removeAdmin, saveAdmin, type AdminRecord } from '../api';
import { describeError, useLoad, useSession } from '../context';

const ROLE_HELP: Record<AdminRecord['role'], string> = {
  superadmin: 'Everything, including managing administrators',
  editor: 'Edit the family tree and website content, and review submissions',
  reviewer: 'Read and decide on claims, Record Me notices and messages',
};

export default function AdminsPage() {
  const session = useSession();
  const { data, error, reload } = useLoad(() => listAdmins(), []);
  const [form, setForm] = useState<AdminRecord>({ uid: '', email: '', displayName: '', role: 'reviewer', active: true });
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ tone: 'success', text: ok });
      reload();
    } catch (e) {
      setMsg({ tone: 'error', text: describeError(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Administrators</h1>
        <p className="mt-1 max-w-3xl text-muted">
          To add someone: ask them to open this admin page and sign in with Google. They will see an “Access not granted” screen showing their User ID — enter it below with the role they need.
        </p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      <ul className="space-y-3">
        {(data ?? []).map((a) => (
          <li key={a.uid} className="flex flex-col gap-3 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{a.displayName || a.email} {a.uid === session.user.uid && <span className="text-muted">(you)</span>}</p>
              <p className="break-all text-sm text-muted">{a.email} · {a.uid}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor={`role-${a.uid}`}>Role</label>
              <select
                id={`role-${a.uid}`}
                className={`${inputClass} w-auto`}
                value={a.role}
                disabled={a.uid === session.user.uid || busy}
                onChange={(e) => run(() => saveAdmin(session, { ...a, role: e.target.value as AdminRecord['role'] }), 'Role updated.')}
              >
                <option value="superadmin">superadmin</option><option value="editor">editor</option><option value="reviewer">reviewer</option>
              </select>
              <Button variant="secondary" disabled={a.uid === session.user.uid || busy} onClick={() => run(() => saveAdmin(session, { ...a, active: !a.active }), a.active ? 'Deactivated.' : 'Activated.')}>
                {a.active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="ghost"
                className="text-danger"
                disabled={a.uid === session.user.uid || busy}
                onClick={() => window.confirm(`Remove ${a.email} as an administrator?`) && run(() => removeAdmin(session, a), 'Removed.')}
                aria-label={`Remove ${a.email}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <form
        className="space-y-4 rounded-lg border border-line bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^[A-Za-z0-9_-]{10,128}$/.test(form.uid.trim())) return setMsg({ tone: 'error', text: 'Enter the User ID exactly as shown on their screen.' });
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setMsg({ tone: 'error', text: 'Enter their Google e-mail address.' });
          run(async () => {
            await saveAdmin(session, { ...form, uid: form.uid.trim() });
            setForm({ uid: '', email: '', displayName: '', role: 'reviewer', active: true });
          }, 'Administrator added.');
        }}
      >
        <h2 className="flex items-center gap-2 font-serif text-2xl"><UserPlus className="h-5 w-5" aria-hidden /> Add an administrator</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="User ID" required>{(p) => <input {...p} className={inputClass} value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })} />}</Field>
          <Field label="Google e-mail" required>{(p) => <input {...p} type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}</Field>
          <Field label="Name">{(p) => <input {...p} className={inputClass} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />}</Field>
          <Field label="Role" hint={ROLE_HELP[form.role]}>
            {(p) => (
              <select {...p} className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRecord['role'] })}>
                <option value="reviewer">reviewer</option><option value="editor">editor</option><option value="superadmin">superadmin</option>
              </select>
            )}
          </Field>
        </div>
        <Button type="submit" disabled={busy}><Save className="h-4 w-4" aria-hidden /> Add administrator</Button>
      </form>
    </div>
  );
}
