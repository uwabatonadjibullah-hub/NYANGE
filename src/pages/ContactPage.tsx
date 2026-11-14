import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Consent, FormError, Honeypot, Receipt, useFormStatus } from '../components/forms';
import { Button, Field, PageHeader, inputClass } from '../components/ui';
import { REPORT_SECTIONS } from '../data/seed';
import { useI18n } from '../i18n';
import { useSiteContent } from '../lib/content';
import { isPlausibleContact } from '../lib/sanitize';
import { submitMessage, type MessageInput } from '../lib/submit';
import { useMeta } from '../lib/useMeta';

const CATEGORIES: MessageInput['category'][] = ['general', 'correction', 'history', 'photos', 'other'];

export default function ContactPage() {
  const { t, lang } = useI18n();
  const { contact } = useSiteContent();
  const [params] = useSearchParams();
  useMeta(t('contactTitle'));

  const initialCategory = (CATEGORIES as string[]).includes(params.get('category') ?? '') ? (params.get('category') as MessageInput['category']) : 'general';
  const about = params.get('about');
  const [f, setF] = useState({
    fullName: '',
    contact: '',
    category: initialCategory,
    branchId: '',
    subject: about ? about.slice(0, 180) : '',
    message: '',
  });
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState('');
  const status = useFormStatus();
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const catLabel: Record<MessageInput['category'], string> = {
    general: t('contactCatGeneral'),
    correction: t('contactCatCorrection'),
    history: t('contactCatHistory'),
    photos: t('contactCatPhotos'),
    other: t('contactCatOther'),
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!f.fullName.trim()) missing.push(t('formYourName'));
    if (!f.contact.trim()) missing.push(t('formYourContact'));
    if (f.subject.trim().length < 2) missing.push(t('contactSubject'));
    if (f.message.trim().length < 5) missing.push(t('contactMessage'));
    if (missing.length) return status.setError(t('formErrRequired', { fields: missing.join(', ') }));
    if (!isPlausibleContact(f.contact)) return status.setError(t('formErrContact'));
    if (!consent) return status.setError(t('formErrConsent'));
    if (trap) return status.setReceipt('NR-MSG-000000');
    status.run(() => submitMessage({ ...f, branchId: f.branchId || undefined }, lang));
  };

  const reset = () => {
    setF((s) => ({ ...s, subject: '', message: '' }));
    setConsent(false);
    status.setReceipt(null);
  };

  const direct = [
    contact.phone && { Icon: Phone, label: t('contactPhone'), value: contact.phone, href: `tel:${contact.phone.replace(/[^+\d]/g, '')}` },
    contact.whatsapp && { Icon: MessageCircle, label: t('contactWhatsapp'), value: contact.whatsapp, href: `https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}` },
    contact.email && { Icon: Mail, label: t('contactEmail'), value: contact.email, href: `mailto:${contact.email}` },
    contact.address && { Icon: MapPin, label: t('contactAddress'), value: contact.address },
  ].filter(Boolean) as { Icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={t('contactTitle')} intro={t('contactIntro')} />
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-line bg-white p-5 sm:p-8">
          {status.receipt ? (
            <Receipt code={status.receipt} onAnother={reset} />
          ) : (
            <form onSubmit={onSubmit} noValidate className="relative space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('formYourName')} required>
                  {(p) => <input {...p} autoComplete="name" className={inputClass} value={f.fullName} onChange={set('fullName')} maxLength={120} />}
                </Field>
                <Field label={t('formYourContact')} required hint={t('formContactHint')}>
                  {(p) => <input {...p} autoComplete="email" className={inputClass} value={f.contact} onChange={set('contact')} maxLength={160} />}
                </Field>
                <Field label={t('contactCategory')}>
                  {(p) => (
                    <select {...p} className={inputClass} value={f.category} onChange={set('category')}>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{catLabel[c]}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field label={t('recordBranch')} optionalText={t('formOptional')}>
                  {(p) => (
                    <select {...p} className={inputClass} value={f.branchId} onChange={set('branchId')}>
                      <option value="">{t('recordBranchUnknown')}</option>
                      {REPORT_SECTIONS.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field label={t('contactSubject')} required className="sm:col-span-2">
                  {(p) => <input {...p} className={inputClass} value={f.subject} onChange={set('subject')} maxLength={200} />}
                </Field>
                <Field label={t('contactMessage')} required className="sm:col-span-2">
                  {(p) => <textarea {...p} rows={6} className={inputClass} value={f.message} onChange={set('message')} maxLength={4000} />}
                </Field>
              </div>
              <Honeypot value={trap} onChange={setTrap} />
              <Consent checked={consent} onChange={setConsent} />
              <FormError message={status.error} />
              <Button type="submit" disabled={status.sending} className="w-full sm:w-auto">
                {status.sending ? t('formSending') : t('formSend')}
              </Button>
            </form>
          )}
        </div>
        <aside className="rounded-lg border border-line bg-white p-5">
          <h2 className="font-serif text-2xl">{t('contactDirect')}</h2>
          {direct.length ? (
            <ul className="mt-4 space-y-3">
              {direct.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm text-muted">{label}</p>
                    {href ? (
                      <a href={href} className="text-lg text-primary underline" rel="noopener noreferrer" target={href.startsWith('http') ? '_blank' : undefined}>{value}</a>
                    ) : (
                      <p className="text-lg">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted">{t('contactNoDirect')}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
