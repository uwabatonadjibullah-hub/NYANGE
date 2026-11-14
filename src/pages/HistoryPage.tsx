import { HandHeart, Home, Landmark, Moon } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { useI18n, type TKey } from '../i18n';
import { pick, useSiteContent } from '../lib/content';
import { useMeta } from '../lib/useMeta';

const VALUES: { title: TKey; text: TKey; Icon: typeof Moon }[] = [
  { title: 'valueFaithTitle', text: 'valueFaithText', Icon: Moon },
  { title: 'valueCultureTitle', text: 'valueCultureText', Icon: Landmark },
  { title: 'valueGenerosityTitle', text: 'valueGenerosityText', Icon: HandHeart },
  { title: 'valueCareTitle', text: 'valueCareText', Icon: Home },
];

export default function HistoryPage() {
  const { t, lang } = useI18n();
  const content = useSiteContent();
  useMeta(t('historyTitle'));
  const gens: TKey[] = ['gen0', 'gen1', 'gen2', 'gen3', 'gen4', 'historyGen5'];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <PageHeader title={t('historyTitle')} intro={t('historyIntro')} />

      <section className="rounded-lg border border-line bg-white p-6 sm:p-8">
        <h2 className="font-serif text-3xl text-primary">{t('historyStoryTitle')}</h2>
        <div className="mt-4 space-y-4 text-lg leading-relaxed">
          {pick(content.biography, lang).split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <p className="mt-6 text-muted">{t('historyMoreComing')}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-3xl">{t('historyValuesTitle')}</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {VALUES.map(({ title, text, Icon }) => (
            <li key={title} className="flex items-start gap-4 rounded-lg border border-line bg-white p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint text-primary">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span>
                <h3 className="text-lg font-semibold">{t(title)}</h3>
                <p className="mt-0.5 text-ink">{t(text)}</p>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-3xl">{t('historyGenerationsTitle')}</h2>
        <p className="mt-2 text-muted">{t('historyGenerationsIntro')}</p>
        <ol className="mt-4 space-y-2">
          {gens.map((k, i) => (
            <li key={k} className="flex items-center gap-3 rounded-md border border-line bg-white px-4 py-3" style={{ marginLeft: `${Math.min(i, 5) * 0.75}rem` }}>
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white">{i}</span>
              <span>{t(k)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 rounded-lg bg-mint p-6">
        <h2 className="font-serif text-2xl text-primary">{t('historyRecordTitle')}</h2>
        <p className="mt-2 text-lg">{t('historyRecordText')}</p>
      </section>
    </div>
  );
}
