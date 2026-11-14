import { ChevronRight, GitFork, Info, ShieldCheck, UserPlus } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ButtonLink } from '../components/ui';
import { generationLabel, statusLabel, useI18n } from '../i18n';
import { getChildren, getLineage, getSiblings } from '../lib/genealogy';
import { useRegistry } from '../lib/registry';
import { useMeta } from '../lib/useMeta';
import type { Person } from '../lib/types';

const SuggestChildrenDialog = lazy(() => import('../components/SuggestChildrenDialog'));

function PersonChip({ p }: { p: Person }) {
  return (
    <li>
      <Link to={`/person/${encodeURIComponent(p.id)}`} className="flex min-h-11 items-center justify-between gap-2 rounded-md border border-line bg-white px-3 py-2 hover:border-primary">
        <span className="font-medium text-ink">{p.fullName}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden />
      </Link>
    </li>
  );
}

export default function PersonPage() {
  const { id = '' } = useParams();
  const { t } = useI18n();
  const { index, loading } = useRegistry();
  const [suggestOpen, setSuggestOpen] = useState(false);
  const person = index.byId.get(id);
  useMeta(person?.fullName ?? t('personNotFound'), { noindex: true });

  if (!person) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg" role={loading ? 'status' : undefined}>{loading ? t('loading') : t('personNotFound')}</p>
        <ButtonLink to="/family-tree" className="mt-6">{t('personBackToTree')}</ButtonLink>
      </div>
    );
  }

  const lineage = getLineage(index, person.id);
  const parent = person.parentId ? index.byId.get(person.parentId) : undefined;
  const siblings = getSiblings(index, person.id);
  const children = getChildren(index, person.id);
  // Living people (or unknown) never show dates or places publicly.
  const showPrivate = person.isLiving === false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <nav aria-label={t('personLineage')} className="mb-6 overflow-x-auto">
        <ol className="flex items-center gap-1 whitespace-nowrap text-sm">
          {lineage.map((p, i) => (
            <li key={p.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-4 w-4 text-muted" aria-hidden />}
              {p.id === person.id ? (
                <span aria-current="page" className="font-semibold">{p.fullName}</span>
              ) : (
                <Link to={`/person/${encodeURIComponent(p.id)}`} className="inline-flex min-h-11 items-center rounded px-1 text-primary underline">{p.fullName}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <article className="rounded-lg border border-line bg-white p-5 sm:p-8">
        <p className="text-muted">{generationLabel(t, person.generation)}</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">{person.fullName}</h1>
        <p className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${person.status === 'verified' ? 'bg-mint text-primary' : 'bg-pending-soft text-pending'}`}>
          {person.status === 'verified' && <ShieldCheck className="h-4 w-4" aria-hidden />}
          {statusLabel(t, person)}
        </p>

        {person.kind === 'family_section' && (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-mint-soft p-3">
            <Info className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>{t('sectionKindNote')}</span>
          </p>
        )}

        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {person.generation > 0 && (
            <div>
              <dt className="text-sm text-muted">{t('personReported')}</dt>
              <dd className="text-lg font-semibold">{person.reportedCount15Plus ?? <span className="font-normal text-muted">{t('personReportedUnknown')}</span>}</dd>
            </div>
          )}
          {person.isLiving === false && (
            <div>
              <dt className="text-sm text-muted">{t('personDeceased')}</dt>
              <dd className="text-lg">{[person.birthYear && `${t('personBorn')} ${person.birthYear}`, person.deathYear && `${t('personDied')} ${person.deathYear}`].filter(Boolean).join(' · ') || '—'}</dd>
            </div>
          )}
          {showPrivate && person.location && (
            <div>
              <dt className="text-sm text-muted">{t('personPlace')}</dt>
              <dd className="text-lg">{person.location}</dd>
            </div>
          )}
          {person.otherParentName && (
            <div>
              <dt className="text-sm text-muted">{t('personOtherParent')}</dt>
              <dd className="text-lg">{person.otherParentName}</dd>
            </div>
          )}
          {person.sourceRef && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted">{t('personSource')}</dt>
              <dd>{person.sourceRef}</dd>
            </div>
          )}
          {person.note && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted">{t('personNotes')}</dt>
              <dd className="whitespace-pre-line">{person.note}</dd>
            </div>
          )}
        </dl>
        {person.isLiving !== false && person.generation > 1 && <p className="mt-4 text-sm text-muted">{t('personLivingPrivacy')}</p>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to={`/family-tree?focus=${encodeURIComponent(person.id)}`}>
            <GitFork className="h-5 w-5" aria-hidden /> {t('personViewInTree')}
          </ButtonLink>
          {person.descendantsStatus !== 'none_confirmed' && (
            <button type="button" onClick={() => setSuggestOpen(true)} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-primary px-4 font-semibold text-primary hover:bg-mint">
              <UserPlus className="h-5 w-5" aria-hidden /> {t('personSuggestChildren')}
            </button>
          )}
        </div>
      </article>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {parent && (
          <section>
            <h2 className="mb-3 font-serif text-2xl">{t('personParent')}</h2>
            <ul><PersonChip p={parent} /></ul>
            {person.parentLinkStatus === 'unconfirmed' && <p className="mt-2 text-sm text-pending">{t('linkUnconfirmed')}</p>}
          </section>
        )}
        <section className={parent ? '' : 'md:col-span-2'}>
          <h2 className="mb-3 font-serif text-2xl">{t('personChildren')} {children.length > 0 && <span className="text-muted">({children.length})</span>}</h2>
          {children.length ? (
            <ul className="space-y-2">{children.map((c) => <PersonChip key={c.id} p={c} />)}</ul>
          ) : (
            <p className="text-muted">{person.descendantsStatus === 'none_confirmed' ? t('personNoneConfirmed') : t('personNoChildren')}</p>
          )}
        </section>
        {siblings.length > 0 && (
          <section className="md:col-span-2">
            <h2 className="mb-3 font-serif text-2xl">{t('personSiblings')} <span className="text-muted">({siblings.length})</span></h2>
            <ul className="grid gap-2 sm:grid-cols-2">{siblings.map((s) => <PersonChip key={s.id} p={s} />)}</ul>
          </section>
        )}
      </div>

      <p className="mt-10">
        <Link to={`/contact?category=correction&about=${encodeURIComponent(person.fullName)}`} className="inline-flex min-h-11 items-center text-primary underline">{t('personCorrection')}</Link>
      </p>

      {suggestOpen && (
        <Suspense fallback={null}>
          <SuggestChildrenDialog parent={person} open={suggestOpen} onClose={() => setSuggestOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
