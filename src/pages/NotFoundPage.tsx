import { ButtonLink, PageHeader } from '../components/ui';
import { useI18n } from '../i18n';
import { useMeta } from '../lib/useMeta';

export default function NotFoundPage() {
  const { t } = useI18n();
  useMeta(t('notFoundTitle'), { noindex: true });
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <PageHeader title={t('notFoundTitle')} intro={t('notFoundText')} />
      <ButtonLink to="/">{t('navHome')}</ButtonLink>
    </div>
  );
}
