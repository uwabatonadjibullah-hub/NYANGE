import { PageHeader } from '../components/ui';
import { useI18n } from '../i18n';
import { useMeta } from '../lib/useMeta';

export default function PrivacyPage() {
  const { t } = useI18n();
  useMeta(t('privacyTitle'));
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader title={t('privacyTitle')} />
      <div className="space-y-4 text-lg leading-relaxed">
        <p>{t('privacyP1')}</p>
        <p>{t('privacyP2')}</p>
        <p>{t('privacyP3')}</p>
        <p>{t('privacyP4')}</p>
      </div>
    </div>
  );
}
