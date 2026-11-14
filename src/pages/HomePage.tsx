import { ArrowRight, GitFork, PenLine, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Emblem } from '../components/Logo';
import { useRecordMe } from '../components/RecordMeContext';
import { ButtonLink, inputClass } from '../components/ui';
import { PENDING_FAMILIES_COUNT, REPORTED_TOTAL_15_PLUS, REPORT_SECTIONS } from '../data/seed';
import { useI18n } from '../i18n';
import { pick, useSiteContent } from '../lib/content';
import { getChildren } from '../lib/genealogy';
import { useRegistry } from '../lib/registry';
import { useMeta } from '../lib/useMeta';

export default function HomePage() {
  const { t, lang } = useI18n();
  const { openRecordMe } = useRecordMe();
  const { index } = useRegistry();
  const content = useSiteContent();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  useMeta('');

  const sections = index.rootId ? getChildren(index, index.rootId) : [];
  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/family-tree?tab=list${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ''}`);
  };
  const bio = pick(content.biography, lang);
  const firstSentences = bio.split(/(?<=\.)\s+/).slice(0, 2).join(' ');

  return (
    <>
      {/* Hero: who we are + the two things most visitors come for */}
      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="mb-3 font-semibold text-mint">{t('homeEyebrow')}</p>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{t('homeTitle')}</h1>
            <p className="mt-4 max-w-xl text-lg text-white/90">{t('homeIntro')}</p>

            <form onSubmit={onSearch} role="search" className="mt-8 max-w-xl">
              <label htmlFor="home-search" className="mb-2 block font-semibold text-mint">{t('homeSearchLabel')}</label>
              <div className="flex gap-2">
                <input id="home-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('homeSearchPlaceholder')} className={`${inputClass} border-white`} />
                <button type="submit" className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-md bg-mint px-4 font-semibold text-primary hover:bg-white">
                  <Search className="h-5 w-5" aria-hidden />
                  <span className="hidden sm:inline">{t('homeSearchButton')}</span>
                  <span className="sr-only sm:hidden">{t('homeSearchButton')}</span>
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/family-tree" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 font-semibold text-primary hover:bg-mint">
                <GitFork className="h-5 w-5" aria-hidden /> {t('homeExploreTree')}
              </Link>
              <button type="button" onClick={() => openRecordMe('new_member')} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-mint px-5 font-semibold text-white hover:bg-white/10">
                <PenLine className="h-5 w-5" aria-hidden /> {t('homeRecordMe')}
              </button>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <Emblem light className="h-64 w-64" />
          </div>
        </div>
      </section>

      {/* Census */}
      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="census-title">
        <h2 id="census-title" className="font-serif text-3xl text-ink">{t('censusTitle')}</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            [`${REPORTED_TOTAL_15_PLUS}+`, t('censusMembers')],
            [String(REPORT_SECTIONS.length), t('censusSections')],
            [String(PENDING_FAMILIES_COUNT), t('censusPending')],
          ].map(([n, label]) => (
            <div key={label} className="rounded-lg border border-line bg-white p-5">
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="block font-serif text-4xl text-primary">{n}</span>
                <span className="mt-1 block text-ink">{label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 max-w-3xl text-muted">{t('censusNote')}</p>
      </section>

      {/* Patriarch */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[auto_1fr] md:items-start">
          <Emblem className="h-24 w-24" />
          <div className="max-w-3xl">
            <p className="font-semibold text-primary">{t('patriarchRole')}</p>
            <h2 className="mt-1 font-serif text-3xl">{t('patriarchTitle')}</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink">{firstSentences}</p>
            <Link to="/history" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline">
              {t('readHistory')} <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Family sections */}
      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="sections-title">
        <h2 id="sections-title" className="font-serif text-3xl">{t('sectionsTitle')}</h2>
        <p className="mt-2 max-w-3xl text-muted">{t('sectionsIntro')}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => (
            <li key={s.id}>
              <Link to={`/person/${encodeURIComponent(s.id)}`} className="flex h-full flex-col rounded-lg border border-line bg-white p-4 hover:border-primary hover:shadow-sm">
                <span className="font-semibold text-ink">{s.fullName}</span>
                <span className="mt-auto pt-3 text-muted">
                  {s.reportedCount15Plus !== undefined && (
                    <>
                      <strong className="text-primary">{s.reportedCount15Plus}</strong> {t('sectionMembers')} ·{' '}
                    </>
                  )}
                  {getChildren(index, s.id).length} {t('sectionHouseholds')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Single, calm call to action */}
      <section className="bg-mint">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-primary">{t('contributeTitle')}</h2>
            <p className="mt-2 text-lg text-ink">{t('contributeText')}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => openRecordMe('new_member')} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 font-semibold text-white hover:bg-primary-hover">
              <PenLine className="h-5 w-5" aria-hidden /> {t('contributeRecord')}
            </button>
            <ButtonLink to="/contact" variant="secondary" className="min-h-12">{t('contributeContact')}</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
