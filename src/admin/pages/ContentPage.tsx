import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, inputClass } from '../../components/ui';
import { DEFAULT_CONTENT, loadContent } from '../../lib/content';
import type { Language, LocalizedText, SiteContent } from '../../lib/types';
import { saveContent } from '../api';
import { describeError, useSession } from '../context';

const LANGS: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'rw', label: 'Kinyarwanda' },
];

function LocalizedInput({ label, value, onChange, rows = 1, max = 600 }: { label: string; value: LocalizedText; onChange: (v: LocalizedText) => void; rows?: number; max?: number }) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-semibold">{label}</legend>
      {LANGS.map((l) => (
        <Field key={l.code} label={l.label}>
          {(p) =>
            rows > 1 ? (
              <textarea {...p} rows={rows} className={inputClass} value={value[l.code] ?? ''} maxLength={max} onChange={(e) => onChange({ ...value, [l.code]: e.target.value })} />
            ) : (
              <input {...p} className={inputClass} value={value[l.code] ?? ''} maxLength={max} onChange={(e) => onChange({ ...value, [l.code]: e.target.value })} />
            )
          }
        </Field>
      ))}
    </fieldset>
  );
}

function isSafeImageUrl(u: string) {
  try {
    return new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
}

export default function ContentPage() {
  const session = useSession();
  const [c, setC] = useState<SiteContent | null>(null);
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadContent(true).then(setC).catch(() => setC(DEFAULT_CONTENT));
  }, []);

  if (!c) return <p role="status" className="text-muted">Loading…</p>;

  const save = async () => {
    const badImage = c.gallery.find((g) => g.imageUrl && !isSafeImageUrl(g.imageUrl));
    if (badImage) return setMsg({ tone: 'error', text: 'Image links must start with https://' });
    setBusy(true);
    setMsg(null);
    try {
      await saveContent(session, c);
      await loadContent(true);
      setMsg({ tone: 'success', text: 'Saved. Visitors will see the new content when they next open the website.' });
    } catch (e) {
      setMsg({ tone: 'error', text: describeError(e) });
    } finally {
      setBusy(false);
    }
  };

  const section = 'rounded-lg border border-line bg-white p-5 space-y-4';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Website content</h1>
        <p className="mt-1 text-muted">Text shown on the public website. Only publish information the family has confirmed.</p>
      </div>

      <section className={section}>
        <h2 className="font-serif text-2xl">Announcement banner</h2>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-primary" checked={c.announcement.active} onChange={(e) => setC({ ...c, announcement: { ...c.announcement, active: e.target.checked } })} />
          Show the announcement at the top of every page
        </label>
        <LocalizedInput label="Announcement text" value={c.announcement.text} onChange={(text) => setC({ ...c, announcement: { ...c.announcement, text } })} rows={2} />
      </section>

      <section className={section}>
        <h2 className="font-serif text-2xl">Biography of Nyange Radjabu</h2>
        <p className="text-sm text-muted">Separate paragraphs with an empty line.</p>
        <LocalizedInput label="Biography" value={c.biography} onChange={(biography) => setC({ ...c, biography })} rows={8} max={8000} />
      </section>

      <section className={section}>
        <h2 className="font-serif text-2xl">Contact details</h2>
        <p className="text-sm text-muted">Leave empty to hide. These are public, so use official family numbers only.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(['phone', 'whatsapp', 'email', 'address'] as const).map((k) => (
            <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
              {(p) => <input {...p} className={inputClass} value={c.contact[k] ?? ''} maxLength={200} onChange={(e) => setC({ ...c, contact: { ...c.contact, [k]: e.target.value } })} />}
            </Field>
          ))}
        </div>
      </section>

      <section className={section}>
        <h2 className="font-serif text-2xl">Contributions</h2>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-primary" checked={c.donation.enabled} onChange={(e) => setC({ ...c, donation: { ...c.donation, enabled: e.target.checked } })} />
          Show contribution channels on the Support page
        </label>
        <LocalizedInput label="Introduction" value={c.donation.intro} onChange={(intro) => setC({ ...c, donation: { ...c.donation, intro } })} rows={2} />
        {c.donation.channels.map((ch, i) => (
          <fieldset key={i} className="grid gap-3 rounded-md border border-line p-4 sm:grid-cols-2">
            <legend className="px-1 font-semibold">Channel {i + 1}</legend>
            {(['name', 'accountName', 'number', 'notes'] as const).map((k) => (
              <Field key={k} label={{ name: 'Name (e.g. MTN Mobile Money)', accountName: 'Account name', number: 'Number', notes: 'Notes' }[k]}>
                {(p) => (
                  <input
                    {...p}
                    className={inputClass}
                    value={ch[k] ?? ''}
                    maxLength={200}
                    onChange={(e) => setC({ ...c, donation: { ...c.donation, channels: c.donation.channels.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) } })}
                  />
                )}
              </Field>
            ))}
            <Button variant="ghost" className="text-danger" onClick={() => setC({ ...c, donation: { ...c.donation, channels: c.donation.channels.filter((_, j) => j !== i) } })}>
              <Trash2 className="h-4 w-4" aria-hidden /> Remove channel
            </Button>
          </fieldset>
        ))}
        <Button variant="secondary" onClick={() => setC({ ...c, donation: { ...c.donation, channels: [...c.donation.channels, { name: '' }] } })}>
          <Plus className="h-4 w-4" aria-hidden /> Add channel
        </Button>
      </section>

      <section className={section}>
        <h2 className="font-serif text-2xl">Gallery</h2>
        <p className="text-sm text-muted">Add genuine family photographs or documents. The image must be hosted at an https:// address (for example a shared Google Drive or Firebase Storage link).</p>
        {c.gallery.map((g, i) => (
          <fieldset key={g.id} className="space-y-3 rounded-md border border-line p-4">
            <legend className="px-1 font-semibold">Item {i + 1}</legend>
            <LocalizedInput label="Title" value={g.title} onChange={(title) => setC({ ...c, gallery: c.gallery.map((x, j) => (j === i ? { ...x, title } : x)) })} />
            <LocalizedInput label="Description" value={g.description ?? {}} onChange={(description) => setC({ ...c, gallery: c.gallery.map((x, j) => (j === i ? { ...x, description } : x)) })} rows={2} />
            <div className="grid gap-3 sm:grid-cols-3">
              {(['imageUrl', 'year', 'credit'] as const).map((k) => (
                <Field key={k} label={{ imageUrl: 'Image link (https://…)', year: 'Year', credit: 'Shared by' }[k]}>
                  {(p) => <input {...p} className={inputClass} value={g[k] ?? ''} maxLength={k === 'imageUrl' ? 1000 : 120} onChange={(e) => setC({ ...c, gallery: c.gallery.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) })} />}
                </Field>
              ))}
            </div>
            <Button variant="ghost" className="text-danger" onClick={() => setC({ ...c, gallery: c.gallery.filter((_, j) => j !== i) })}>
              <Trash2 className="h-4 w-4" aria-hidden /> Remove item
            </Button>
          </fieldset>
        ))}
        <Button variant="secondary" onClick={() => setC({ ...c, gallery: [...c.gallery, { id: crypto.randomUUID(), title: {} }] })}>
          <Plus className="h-4 w-4" aria-hidden /> Add gallery item
        </Button>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur">
        {msg && <div className="mb-3"><Alert tone={msg.tone}>{msg.text}</Alert></div>}
        <Button onClick={save} disabled={busy}><Save className="h-4 w-4" aria-hidden /> {busy ? 'Saving…' : 'Save all changes'}</Button>
      </div>
    </div>
  );
}
