import { ShieldAlert } from 'lucide-react';
import { Alert, PageHeader } from '../components/ui';
import { useI18n } from '../i18n';
import { pick, useSiteContent } from '../lib/content';
import { useMeta } from '../lib/useMeta';

export default function SupportPage() {
  const { t, lang } = useI18n();
  const { donation } = useSiteContent();
  useMeta(t('supportTitle'));
  const active = donation.enabled && donation.channels.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader title={t('supportTitle')} intro={pick(donation.intro, lang) || t('supportIntro')} />
      {!active ? (
        <Alert tone="info">{t('supportNotYet')}</Alert>
      ) : (
        <section>
          <h2 className="font-serif text-2xl">{t('supportChannels')}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {donation.channels.map((c, i) => (
              <li key={i} className="rounded-lg border border-line bg-white p-5">
                <h3 className="text-xl font-semibold">{c.name}</h3>
                <dl className="mt-3 space-y-2">
                  {c.accountName && (
                    <div>
                      <dt className="text-sm text-muted">{t('supportAccountName')}</dt>
                      <dd className="text-lg">{c.accountName}</dd>
                    </div>
                  )}
                  {c.number && (
                    <div>
                      <dt className="text-sm text-muted">{t('supportNumber')}</dt>
                      <dd className="font-mono text-lg font-semibold tracking-wide">{c.number}</dd>
                    </div>
                  )}
                  {c.notes && <dd className="text-muted">{c.notes}</dd>}
                </dl>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-start gap-2 rounded-md border border-pending/30 bg-pending-soft p-4 text-ink">
            <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-pending" aria-hidden />
            {t('supportSafety')}
          </p>
        </section>
      )}
    </div>
  );
}
