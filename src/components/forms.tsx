import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n, type TKey } from '../i18n';
import { SubmitError } from '../lib/submit';
import { Alert, Button } from './ui';

export function useFormStatus() {
  const { t } = useI18n();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);

  async function run(fn: () => Promise<string>) {
    setError(null);
    setSending(true);
    try {
      setReceipt(await fn());
    } catch (e) {
      const code = e instanceof SubmitError ? e.code : 'unknown';
      const map: Record<string, TKey> = { too_fast: 'formErrTooFast', offline: 'formErrOffline', rejected: 'formErrRejected', unknown: 'formErrUnknown' };
      setError(t(map[code]));
    } finally {
      setSending(false);
    }
  }
  return { sending, error, setError, receipt, setReceipt, run };
}

/** Invisible to people, often filled in by spam bots. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

export function Consent({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const { t } = useI18n();
  return (
    <div className="rounded-md border border-line bg-mint-soft p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-primary" />
        <span>{t('formConsent')}</span>
      </label>
      <Link to="/privacy" target="_blank" className="mt-2 inline-block text-primary underline">
        {t('formPrivacyLink')}
      </Link>
    </div>
  );
}

export function Receipt({ code, onAnother, onDone }: { code: string; onAnother?: () => void; onDone?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4 text-center" role="status">
      <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
      <h3 className="font-serif text-2xl text-primary">{t('formReceived')}</h3>
      <div>
        <p className="text-muted">{t('formReceipt')}</p>
        <p className="mt-1 inline-block rounded-md border border-line bg-white px-4 py-2 font-mono text-xl font-semibold tracking-wider">{code}</p>
      </div>
      <p className="text-muted">{t('formReceiptHint')}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {onAnother && <Button variant="secondary" onClick={onAnother}>{t('formSendAnother')}</Button>}
        {onDone && <Button onClick={onDone}>{t('formDone')}</Button>}
      </div>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <Alert tone="error">{message}</Alert>;
}
