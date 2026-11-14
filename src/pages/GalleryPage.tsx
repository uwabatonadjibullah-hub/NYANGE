import { FileText, ImagePlus } from 'lucide-react';
import { ButtonLink, PageHeader } from '../components/ui';
import { useI18n } from '../i18n';
import { pick, useSiteContent } from '../lib/content';
import { useMeta } from '../lib/useMeta';

export default function GalleryPage() {
  const { t, lang } = useI18n();
  const content = useSiteContent();
  useMeta(t('galleryTitle'));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={t('galleryTitle')} intro={t('galleryIntro')} />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <li className="flex flex-col rounded-lg border border-line bg-white p-5">
          <FileText className="h-8 w-8 text-primary" aria-hidden />
          <h2 className="mt-3 text-xl font-semibold">{t('galleryReportTitle')}</h2>
          <p className="mt-2 text-ink">{t('galleryReportText')}</p>
          <p className="mt-auto pt-3 text-sm text-muted">2026</p>
        </li>
        {content.gallery.map((g) => (
          <li key={g.id} className="flex flex-col overflow-hidden rounded-lg border border-line bg-white">
            {g.imageUrl && (
              <img src={g.imageUrl} alt={pick(g.title, lang)} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="aspect-[4/3] w-full bg-line object-cover" />
            )}
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-xl font-semibold">{pick(g.title, lang)}</h2>
              {pick(g.description, lang) && <p className="mt-2 text-ink">{pick(g.description, lang)}</p>}
              <p className="mt-auto pt-3 text-sm text-muted">{[g.year, g.credit].filter(Boolean).join(' · ')}</p>
            </div>
          </li>
        ))}
        <li className="flex flex-col items-start rounded-lg border-2 border-dashed border-line-strong p-5">
          <ImagePlus className="h-8 w-8 text-primary" aria-hidden />
          <p className="mt-3 text-lg">{t('galleryEmpty')}</p>
          <ButtonLink to="/contact?category=photos" variant="secondary" className="mt-4">{t('galleryShare')}</ButtonLink>
        </li>
      </ul>
    </div>
  );
}
