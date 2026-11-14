import { BookOpen, ChevronDown, ChevronRight, GitFork, Mail, Search, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Emblem } from '../components/Logo';
import { useRecordMe } from '../components/RecordMeContext';
import { PENDING_FAMILIES_COUNT, REPORTED_TOTAL_15_PLUS, REPORT_SECTIONS } from '../data/seed';
import { useI18n } from '../i18n';
import { pick, useSiteContent } from '../lib/content';
import { getChildren } from '../lib/genealogy';
import { useRegistry } from '../lib/registry';
import { useMeta } from '../lib/useMeta';

const tileClass =
  'flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-line bg-white p-4 text-center text-base font-semibold text-ink shadow-sm transition-colors hover:border-primary hover:bg-mint-soft sm:min-h-32 sm:text-lg';
const tileIcon = 'flex h-12 w-12 items-center justify-center rounded-full bg-mint text-primary';

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
      {/* Hero: who we are, in one sentence */}
      <section className="bg-primary text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-8 text-center sm:pb-20 sm:pt-12">
          <Emblem light className="h-16 w-16 sm:h-20 sm:w-20" />
          <p className="mt-4 text-lg font-medium text-mint">{t('homeWelcome')}</p>
          <h1 className="mt-1 font-serif text-[2rem] leading-tight sm:text-5xl">{t('homeTitle')}</h1>
          <p className="mt-3 max-w-xl text-lg text-white/90">{t('homeIntro')}</p>
        </div>
      </section>

      {/* Search: the single most common reason to visit */}
      <section className="mx-auto -mt-10 max-w-3xl px-4">
        <form onSubmit={onSearch} role="search" className="rounded-lg bg-white p-4 shadow-lg ring-1 ring-line sm:p-5">
          <label htmlFor="home-search" className="mb-2 block text-lg font-semibold text-ink">{t('homeSearchLabel')}</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="home-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('treeSearchPlaceholder')}
              className="block min-h-13 w-full rounded-md border-2 border-line-strong bg-white px-4 text-lg text-ink placeholder:text-muted/80 focus:border-primary focus:outline-2 focus:outline-primary/40"
            />
            <button type="submit" className="inline-flex min-h-13 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-lg font-semibold text-white hover:bg-primary-hover">
              <Search className="h-5 w-5" aria-hidden /> {t('homeSearchButton')}
            </button>
          </div>
        </form>
      </section>

      {/* Big, clear choices */}
      <section className="mx-auto max-w-3xl px-4 pt-10" aria-labelledby="tasks-title">
        <h2 id="tasks-title" className="font-serif text-2xl sm:text-3xl">{t('homeTasksTitle')}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
          <li>
            <Link to="/family-tree" className={tileClass}>
              <span className={tileIcon}><GitFork className="h-6 w-6" aria-hidden /></span>
              {t('taskTree')}
            </Link>
          </li>
          <li>
            <button type="button" onClick={() => openRecordMe('new_member')} className={`${tileClass} w-full cursor-pointer`}>
              <span className={tileIcon}><UserPlus className="h-6 w-6" aria-hidden /></span>
              {t('taskRecord')}
            </button>
          </li>
          <li>
            <Link to="/history" className={tileClass}>
              <span className={tileIcon}><BookOpen className="h-6 w-6" aria-hidden /></span>
              {t('taskHistory')}
            </Link>
          </li>
          <li>
            <Link to="/contact" className={tileClass}>
              <span className={tileIcon}><Mail className="h-6 w-6" aria-hidden /></span>
              {t('taskContact')}
            </Link>
          </li>
        </ul>
      </section>

      {/* Patriarch */}
      <section className="mx-auto max-w-3xl px-4 pt-12">
        <div className="rounded-lg border border-line bg-white p-5 sm:p-7">
          <p className="font-medium text-primary">{t('patriarchRole')}</p>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl">{t('patriarchTitle')}</h2>
          <p className="mt-3 text-lg leading-relaxed">{firstSentences}</p>
          <Link to="/history" className="mt-3 inline-flex min-h-11 items-center gap-1 text-lg font-semibold text-primary underline">
            {t('readHistory')} <ChevronRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Census, in one glance */}
      <section className="mx-auto max-w-3xl px-4 pt-12" aria-labelledby="census-title">
        <h2 id="census-title" className="font-serif text-2xl sm:text-3xl">{t('censusTitle')}</h2>
        <dl className="mt-4 divide-y divide-line rounded-lg border border-line bg-white sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            [`${REPORTED_TOTAL_15_PLUS}+`, t('censusMembers')],
            [String(REPORT_SECTIONS.length), t('censusSections')],
            [String(PENDING_FAMILIES_COUNT), t('censusPending')],
          ].map(([n, label]) => (
            <div key={label} className="flex flex-row-reverse items-center justify-end gap-4 px-4 py-3 sm:flex-col-reverse sm:justify-end sm:gap-1 sm:py-5 sm:text-center">
              <dt className="text-lg leading-snug text-ink sm:text-base sm:text-muted">{label}</dt>
              <dd className="w-20 shrink-0 font-serif text-3xl text-primary sm:w-auto sm:text-4xl">{n}</dd>
            </div>
          ))}
        </dl>
        <details className="group mt-3 rounded-md">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-primary">
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden /> {t('censusMore')}
          </summary>
          <p className="mt-1 text-muted">{t('censusNote')}</p>
        </details>
      </section>

      {/* Family sections: compact list */}
      <section className="mx-auto max-w-3xl px-4 pt-10" aria-labelledby="sections-title">
        <h2 id="sections-title" className="font-serif text-2xl sm:text-3xl">{t('sectionsTitle')}</h2>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
          {sections.map((s) => (
            <li key={s.id}>
              <Link to={`/person/${encodeURIComponent(s.id)}`} className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 hover:bg-mint-soft">
                <span>
                  <span className="block text-lg font-semibold text-ink">{s.fullName.replace(/ Family$/, '')}</span>
                  <span className="block text-muted">
                    {s.reportedCount15Plus !== undefined && `${s.reportedCount15Plus} ${t('sectionMembers')} · `}
                    {getChildren(index, s.id).length} {t('sectionHouseholds')}
                  </span>
                </span>
                <ChevronRight className="h-6 w-6 shrink-0 text-primary" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* One calm call to action */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg bg-mint p-6 text-center sm:p-8">
          <h2 className="font-serif text-2xl text-primary sm:text-3xl">{t('contributeTitle')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-lg text-ink">{t('contributeText')}</p>
          <button
            type="button"
            onClick={() => openRecordMe('new_member')}
            className="mt-5 inline-flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-lg font-semibold text-white hover:bg-primary-hover sm:w-auto"
          >
            <UserPlus className="h-5 w-5" aria-hidden /> {t('taskRecord')}
          </button>
        </div>
      </section>
    </>
  );
}
