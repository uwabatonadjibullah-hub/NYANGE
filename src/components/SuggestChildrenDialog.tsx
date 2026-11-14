import { Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useI18n } from '../i18n';
import { isPlausibleContact } from '../lib/sanitize';
import { submitDescendantClaim } from '../lib/submit';
import type { ChildProposal, Gender, Person } from '../lib/types';
import { Consent, FormError, Honeypot, Receipt, useFormStatus } from './forms';
import { Button, Dialog, Field, inputClass } from './ui';

const newChild = (): ChildProposal & { key: number } => ({ key: Math.random(), fullName: '', gender: 'unknown', birthYear: '', otherParentName: '', notes: '' });

export default function SuggestChildrenDialog({ parent, open, onClose }: { parent: Person; open: boolean; onClose: () => void }) {
  const { t, lang } = useI18n();
  const [children, setChildren] = useState([newChild()]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState('');
  const status = useFormStatus();

  const update = (i: number, patch: Partial<ChildProposal>) => setChildren((list) => list.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const reset = () => {
    setChildren([newChild()]);
    setRelationship('');
    setNotes('');
    setConsent(false);
    status.setReceipt(null);
    status.setError(null);
  };

  const close = () => {
    if (status.receipt) reset();
    onClose();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const valid = children.filter((c) => c.fullName.trim());
    const missing: string[] = [];
    if (!valid.length) missing.push(t('claimChildName'));
    if (!name.trim()) missing.push(t('formYourName'));
    if (!contact.trim()) missing.push(t('formYourContact'));
    if (missing.length) return status.setError(t('formErrRequired', { fields: missing.join(', ') }));
    if (!isPlausibleContact(contact)) return status.setError(t('formErrContact'));
    if (!consent) return status.setError(t('formErrConsent'));
    if (trap) return status.setReceipt('NR-DES-000000');
    status.run(() =>
      submitDescendantClaim(
        {
          parentId: parent.id,
          parentName: parent.fullName,
          parentGeneration: parent.generation,
          children: valid.map(({ fullName, gender, birthYear, otherParentName, notes: n }) => ({ fullName, gender, birthYear, otherParentName, notes: n })),
          contributorName: name,
          contributorContact: contact,
          relationship,
          notes,
        },
        lang,
      ),
    );
  };

  return (
    <Dialog open={open} onClose={close} title={t('claimTitle', { name: parent.fullName })} wide>
      {status.receipt ? (
        <Receipt code={status.receipt} onDone={close} />
      ) : (
        <form onSubmit={onSubmit} noValidate className="relative space-y-5">
          <p className="text-muted">{t('claimIntro')}</p>
          {children.map((c, i) => (
            <fieldset key={c.key} className="rounded-md border border-line p-4">
              <legend className="px-1 font-semibold text-primary">{t('claimChild', { n: i + 1 })}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('claimChildName')} required={i === 0} className="sm:col-span-2">
                  {(p) => <input {...p} className={inputClass} value={c.fullName} onChange={(e) => update(i, { fullName: e.target.value })} maxLength={120} />}
                </Field>
                <Field label={t('claimChildGender')} optionalText={t('formOptional')}>
                  {(p) => (
                    <select {...p} className={inputClass} value={c.gender} onChange={(e) => update(i, { gender: e.target.value as Gender })}>
                      <option value="unknown">{t('claimGenderUnknown')}</option>
                      <option value="female">{t('claimGenderFemale')}</option>
                      <option value="male">{t('claimGenderMale')}</option>
                    </select>
                  )}
                </Field>
                <Field label={t('claimChildBirthYear')} optionalText={t('formOptional')}>
                  {(p) => <input {...p} inputMode="numeric" className={inputClass} value={c.birthYear} onChange={(e) => update(i, { birthYear: e.target.value })} maxLength={12} />}
                </Field>
                <Field label={t('claimChildOtherParent')} optionalText={t('formOptional')} className="sm:col-span-2">
                  {(p) => <input {...p} className={inputClass} value={c.otherParentName} onChange={(e) => update(i, { otherParentName: e.target.value })} maxLength={120} />}
                </Field>
              </div>
              {children.length > 1 && (
                <Button variant="ghost" className="mt-3" onClick={() => setChildren((l) => l.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" aria-hidden /> {t('claimRemoveChild')}
                </Button>
              )}
            </fieldset>
          ))}
          {children.length < 10 && (
            <Button variant="secondary" onClick={() => setChildren((l) => [...l, newChild()])}>
              <Plus className="h-5 w-5" aria-hidden /> {t('claimAddChild')}
            </Button>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('formYourName')} required>
              {(p) => <input {...p} autoComplete="name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />}
            </Field>
            <Field label={t('formYourContact')} required hint={t('formContactHint')}>
              {(p) => <input {...p} autoComplete="tel" className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} maxLength={160} />}
            </Field>
            <Field label={t('claimRelationship')} optionalText={t('formOptional')} className="sm:col-span-2">
              {(p) => <input {...p} className={inputClass} value={relationship} onChange={(e) => setRelationship(e.target.value)} maxLength={500} />}
            </Field>
            <Field label={t('claimNotes')} optionalText={t('formOptional')} className="sm:col-span-2">
              {(p) => <textarea {...p} rows={3} className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />}
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
