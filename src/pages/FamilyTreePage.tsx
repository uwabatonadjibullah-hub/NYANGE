import { ChevronDown, ChevronRight, GitFork, Hand, Info, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FamilyTree from '../components/FamilyTree';
import { inputClass } from '../components/ui';
import { PENDING_FAMILIES_COUNT } from '../data/seed';
import { generationLabel, useI18n } from '../i18n';
import { getChildren, searchPersons } from '../lib/genealogy';
import { useRegistry } from '../lib/registry';
import { useMeta } from '../lib/useMeta';

const PAGE = 40;

export default function FamilyTreePage() {
  const { t } = useI18n();
  const { index, loading } = useRegistry();
  const [params, setParams] = useSearchParams();
  useMeta(t('treeTitle'));

  const tab = params.get('tab') === 'list' ? 'list' : 'tree';
  const focus = params.get('focus');
  const mode = focus && index.byId.has(focus) ? 'lineage' : 'full';
  const q = params.get('q') ?? '';
  const branch = params.get('branch') ?? '';
  const gen = params.get('gen') ?? '';
  const [limit, setLimit] = useState(PAGE);

  const update = (patch: Record<string, string | null>, replace = false) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace });
  };

  const sections = index.rootId ? getChildren(index, index.rootId) : [];
  const results = useMemo(
    () => searchPersons(index, q, { branchId: branch || undefined, generation: gen === '' ? undefined : Number(gen) }),
    [index, q, branch, gen],
  );
  const maxGen = index.all.reduce((m, p) => Math.max(m, p.generation), 0);

  const tabClass = (active: boolean) =>
    `inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-lg font-semibold sm:flex-none ${active ? 'bg-primary text-white' : 'text-ink hover:bg-mint'}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-3xl sm:text-4xl">{t('treeTitle')}</h1>
        <div role="tablist" aria-label={t('treeTitle')} className="flex w-full gap-1 rounded-lg border border-line bg-white p-1 sm:w-auto">
          <button role="tab" aria-selected={tab === 'tree'} className={tabClass(tab === 'tree')} onClick={() => update({ tab: null })}>
            <GitFork className="h-5 w-5" aria-hidden /> {t('treeTabTree')}
          </button>
          <button role="tab" aria-selected={tab === 'list'} className={tabClass(tab === 'list')} onClick={() => update({ tab: 'list' })}>
            <Search className="h-5 w-5" aria-hidden /> {t('treeTabList')}
          </button>
        </div>
      </header>

      {tab === 'tree' ? (
        <>
          {mode === 'lineage' && focus ? (
            <div className="mb-3 flex flex-col gap-2 rounded-lg bg-mint-soft p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg">{t('treeShowingLine', { name: index.byId.get(focus)?.fullName ?? '' })}</p>
              <button type="button" onClick={() => update({ focus: null })} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-white px-4 font-semibold text-primary hover:bg-mint">
                <Users className="h-5 w-5" aria-hidden /> {t('treeShowWhole')}
              </button>
            </div>
          ) : (
            <p className="mb-3 flex items-center gap-2 text-lg text-ink">
              <Hand className="h-5 w-5 shrink-0 text-primary" aria-hidden /> {t('treeHint')}
            </p>
          )}
          {loading && index.all.length === 0 ? (
            <p role="status" className="py-16 text-center text-muted">{t('treeLoading')}</p>
          ) : (
            <FamilyTree index={index} mode={mode} focusId={focus} onTraceLineage={(id) => update({ focus: id })} />
          )}
          <p className="mt-4 flex items-start gap-2 text-muted">
            <Info className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>{t('treePendingFamilies', { n: PENDING_FAMILIES_COUNT })}</span>
          </p>
        </>
      ) : (
        <section aria-label={t('treeTabList')}>
          <div className="rounded-lg border border-line bg-white p-4">
            <label htmlFor="tree-q" className="mb-2 block text-lg font-semibold">{t('treeSearchLabel')}</label>
            <input
              id="tree-q"
              type="search"
              className="block min-h-13 w-full rounded-md border-2 border-line-strong bg-white px-4 text-lg text-ink placeholder:text-muted/80 focus:border-primary focus:outline-2 focus:outline-primary/40"
              placeholder={t('treeSearchPlaceholder')}
              value={q}
              onChange={(e) => update({ q: e.target.value }, true)}
              autoFocus
            />
            <details className="group mt-3" open={!!branch || !!gen}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-primary">
                <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden /> {t('listFilters')}
              </summary>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="tree-branch" className="mb-1 block font-semibold">{t('recordBranch')}</label>
                  <select id="tree-branch" className={inputClass} value={branch} onChange={(e) => update({ branch: e.target.value }, true)}>
                    <option value="">{t('treeAllBranches')}</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tree-gen" className="mb-1 block font-semibold">{t('recordGeneration')}</label>
                  <select id="tree-gen" className={inputClass} value={gen} onChange={(e) => update({ gen: e.target.value }, true)}>
                    <option value="">{t('treeAllGenerations')}</option>
                    {Array.from({ length: maxGen + 1 }, (_, n) => (
                      <option key={n} value={String(n)}>{generationLabel(t, n)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </details>
          </div>

          <p className="mt-4 text-muted" role="status">{t('treeResultsCount', { n: results.length })}</p>
          {results.length === 0 ? (
            <p className="py-10 text-center text-lg text-muted">{t('treeNoResults')}</p>
          ) : (
            <ul className="mt-2 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
              {results.slice(0, limit).map((p) => {
                const parent = p.parentId ? index.byId.get(p.parentId) : undefined;
                return (
                  <li key={p.id}>
                    <Link to={`/person/${encodeURIComponent(p.id)}`} className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 hover:bg-mint-soft">
                      <span>
                        <span className="block text-lg font-semibold text-ink">{p.fullName}</span>
                        <span className="block text-muted">{parent ? t('listChildOf', { name: parent.fullName.replace(/ Family$/, '') }) : generationLabel(t, p.generation)}</span>
                      </span>
                      <ChevronRight className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {results.length > limit && (
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="min-h-12 w-full cursor-pointer rounded-md border-2 border-primary px-5 text-lg font-semibold text-primary hover:bg-mint sm:w-auto">
                {t('treeShowMore')}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
