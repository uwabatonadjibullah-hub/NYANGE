import { BellRing, HeartHandshake, UserPlus } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { REPORT_SECTIONS } from '../data/seed';
import { useI18n, type TKey } from '../i18n';
import { isPlausibleContact } from '../lib/sanitize';
import { submitNotice } from '../lib/submit';
import type { NoticeType } from '../lib/types';
import { Consent, FormError, Honeypot, Receipt, useFormStatus } from './forms';
import { Button, Dialog, Field, inputClass } from './ui';

const TYPES: { type: NoticeType; title: TKey; desc: TKey; Icon: typeof UserPlus }[] = [
  { type: 'new_member', title: 'recordTypeNewMember', desc: 'recordTypeNewMemberDesc', Icon: UserPlus },
  { type: 'bereavement', title: 'recordTypeBereavement', desc: 'recordTypeBereavementDesc', Icon: HeartHandshake },
  { type: 'announcement', title: 'recordTypeAnnouncement', desc: 'recordTypeAnnouncementDesc', Icon: BellRing },
];

const empty = { senderName: '', senderContact: '', personName: '', branchId: '', fatherName: '', motherName: '', generation: '', connection: '', subject: '', details: '' };

export default function RecordMeDialog({ open, onClose, initialType }: { open: boolean; onClose: () => void; initialType: NoticeType }) {
  const { t, lang } = useI18n();
  const [type, setType] = useState<NoticeType>(initialType);
  const [f, setF] = useState(empty);
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState('');
  const status = useFormStatus();

  useEffect(() => {
    if (open) setType(initialType);
  }, [open, initialType]);

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const reset = () => {
    setF(empty);
    setConsent(false);
    status.setReceipt(null);
    status.setError(null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!f.senderName.trim()) missing.push(t('formYourName'));
    if (!f.senderContact.trim()) missing.push(t('formYourContact'));
    if (type !== 'announcement' && !f.personName.trim()) missing.push(type === 'bereavement' ? t('recordDeceasedName') : t('recordPersonName'));
    if (type === 'announcement' && !f.subject.trim()) missing.push(t('recordSubject'));
    if (!f.details.trim()) missing.push(t('recordDetails'));
    if (missing.length) return status.setError(t('formErrRequired', { fields: missing.join(', ') }));
    if (!isPlausibleContact(f.senderContact)) return status.setError(t('formErrContact'));
    if (!consent) return status.setError(t('formErrConsent'));
    if (trap) return status.setReceipt('NR-NOT-000000'); // silently drop bot submissions
    status.run(() =>
      submitNotice(
        {
          type,
          senderName: f.senderName,
          senderContact: f.senderContact,
          personName: type === 'announcement' ? undefined : f.personName,
          branchId: f.branchId || undefined,
          fatherName: type === 'new_member' ? f.fatherName : undefined,
          motherName: type === 'new_member' ? f.motherName : undefined,
          generation: type === 'new_member' ? f.generation : undefined,
          connection: type === 'new_member' ? f.connection : undefined,
          subject: type === 'announcement' ? f.subject : undefined,
          details: f.details,
        },
        lang,
      ),
    );
  };

  const close = () => {
    if (status.receipt) reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} title={t('recordTitle')} wide>
      {status.receipt ? (
        <Receipt code={status.receipt} onAnother={reset} onDone={close} />
      ) : (
        <form onSubmit={onSubmit} noValidate className="relative space-y-5">
          <p className="text-muted">{t('recordIntro')}</p>
          <fieldset>
            <legend className="sr-only">{t('recordTitle')}</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {TYPES.map(({ type: ty, title, desc, Icon }) => (
                <label
                  key={ty}
                  className={`flex cursor-pointer gap-3 rounded-md border p-3 sm:flex-col ${type === ty ? 'border-primary bg-mint-soft ring-2 ring-primary' : 'border-line hover:border-primary'}`}
                >
                  <input type="radio" name="notice-type" value={ty} checked={type === ty} onChange={() => setType(ty)} className="sr-only" />
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
                  <span>
                    <span className="block font-semibold">{t(title)}</span>
                    <span className="block text-sm text-muted">{t(desc)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('formYourName')} required>
              {(p) => <input {...p} autoComplete="name" className={inputClass} value={f.senderName} onChange={set('senderName')} maxLength={120} />}
            </Field>
            <Field label={t('formYourContact')} required hint={t('formContactHint')}>
              {(p) => <input {...p} autoComplete="tel" inputMode="email" className={inputClass} value={f.senderContact} onChange={set('senderContact')} maxLength={160} />}
            </Field>

            {type !== 'announcement' && (
              <Field label={type === 'bereavement' ? t('recordDeceasedName') : t('recordPersonName')} required className="sm:col-span-2">
                {(p) => <input {...p} className={inputClass} value={f.personName} onChange={set('personName')} maxLength={160} />}
              </Field>
            )}

            {type === 'announcement' && (
              <Field label={t('recordSubject')} required className="sm:col-span-2">
                {(p) => <input {...p} className={inputClass} value={f.subject} onChange={set('subject')} maxLength={200} />}
              </Field>
            )}

            <Field label={t('recordBranch')} optionalText={t('formOptional')} className={type === 'new_member' ? '' : 'sm:col-span-2'}>
              {(p) => (
                <select {...p} className={inputClass} value={f.branchId} onChange={set('branchId')}>
                  <option value="">{t('recordBranchUnknown')}</option>
                  {REPORT_SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  <option value="not-listed">{t('recordBranchOther')}</option>
                </select>
              )}
            </Field>

            {type === 'new_member' && (
              <>
                <Field label={t('recordGeneration')} optionalText={t('formOptional')}>
                  {(p) => (
                    <select {...p} className={inputClass} value={f.generation} onChange={set('generation')}>
                      <option value="">{t('recordGenerationUnknown')}</option>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={String(n)}>{t('genN', { n })}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field label={t('recordFather')} optionalText={t('formOptional')}>
                  {(p) => <input {...p} className={inputClass} value={f.fatherName} onChange={set('fatherName')} maxLength={160} />}
                </Field>
                <Field label={t('recordMother')} optionalText={t('formOptional')}>
                  {(p) => <input {...p} className={inputClass} value={f.motherName} onChange={set('motherName')} maxLength={160} />}
                </Field>
                <Field label={t('recordConnection')} optionalText={t('formOptional')} hint={t('recordConnectionHint')} className="sm:col-span-2">
                  {(p) => <textarea {...p} rows={2} className={inputClass} value={f.connection} onChange={set('connection')} maxLength={2000} />}
                </Field>
              </>
            )}

            <Field
              label={t('recordDetails')}
              required
              className="sm:col-span-2"
              hint={t(type === 'bereavement' ? 'recordDetailsHintBereavement' : type === 'announcement' ? 'recordDetailsHintAnnouncement' : 'recordDetailsHintNewMember')}
            >
              {(p) => <textarea {...p} rows={4} className={inputClass} value={f.details} onChange={set('details')} maxLength={3000} />}
            </Field>
          </div>

          <Honeypot value={trap} onChange={setTrap} />
          <Consent checked={consent} onChange={setConsent} />
          <FormError message={status.error} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={close}>{t('formCancel')}</Button>
            <Button type="submit" disabled={status.sending}>{status.sending ? t('formSending') : t('formSend')}</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
