import { ChevronRight, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FamilyTree from '../components/FamilyTree';
import { inputClass } from '../components/ui';
import { PENDING_FAMILIES_COUNT } from '../data/seed';
import { generationLabel, statusLabel, useI18n } from '../i18n';
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
    `min-h-11 flex-1 cursor-pointer rounded-md px-3 font-semibold leading-tight sm:flex-none sm:px-4 ${active ? 'bg-primary text-white' : 'text-ink hover:bg-mint'}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <header className="mb-4">
        <h1 className="font-serif text-3xl sm:text-4xl">{t('treeTitle')}</h1>
        <p className="mt-2 hidden max-w-3xl text-muted sm:block">{t('treeIntro')}</p>
      </header>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label={t('treeTitle')} className="flex gap-1 rounded-lg border border-line bg-white p-1">
          <button role="tab" aria-selected={tab === 'tree'} className={tabClass(tab === 'tree')} onClick={() => update({ tab: null })}>
            {t('treeTabTree')}
          </button>
          <button role="tab" aria-selected={tab === 'list'} className={tabClass(tab === 'list')} onClick={() => update({ tab: 'list' })}>
            {t('treeTabList')}
          </button>
        </div>
        {tab === 'tree' && (
          <div className="flex gap-1 rounded-lg border border-line bg-white p-1" role="group" aria-label={t('treeTitle')}>
            <button aria-pressed={mode === 'full'} className={tabClass(mode === 'full')} onClick={() => update({ focus: null })}>
              {t('treeModeFull')}
            </button>
            <button
              aria-pressed={mode === 'lineage'}
              className={tabClass(mode === 'lineage')}
              onClick={() => (mode === 'lineage' ? undefined : update({ tab: 'list' }))}
              disabled={mode === 'lineage'}
            >
              {t('treeModeLineage')}
            </button>
          </div>
        )}
      </div>

      {tab === 'tree' ? (
        <>
          {mode === 'lineage' && focus && (
            <nav aria-label={t('personLineage')} className="mb-3 overflow-x-auto">
              <ol className="flex items-center gap-1 whitespace-nowrap text-sm">
                {(() => {
                  const chain: string[] = [];
                  let cur = index.byId.get(focus);
                  while (cur) {
                    chain.unshift(cur.id);
                    cur = cur.parentId ? index.byId.get(cur.parentId) : undefined;
                  }
                  return chain.map((id, i) => (
                    <li key={id} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="h-4 w-4 text-muted" aria-hidden />}
                      <Link to={`/person/${encodeURIComponent(id)}`} className="inline-flex min-h-11 items-center rounded px-1 text-primary underline">
                        {index.byId.get(id)!.fullName}
                      </Link>
                    </li>
                  ));
                })()}
              </ol>
            </nav>
          )}
          {loading && index.all.length === 0 ? (
            <p role="status" className="py-16 text-center text-muted">{t('treeLoading')}</p>
          ) : (
            <FamilyTree index={index} mode={mode} focusId={focus} onTraceLineage={(id) => update({ focus: id })} />
          )}
          <p className="mt-4 flex items-start gap-2 text-muted">
            <Info className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>{t('treePendingFamilies', { n: PENDING_FAMILIES_COUNT })} {t('sectionKindNote')}</span>
          </p>
        </>
      ) : (
        <section aria-label={t('treeTabList')}>
          <div className="grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label htmlFor="tree-q" className="mb-1 block font-semibold">{t('treeSearchLabel')}</label>
              <input id="tree-q" type="search" className={inputClass} placeholder={t('treeSearchPlaceholder')} value={q} onChange={(e) => update({ q: e.target.value }, true)} autoFocus={!!q} />
            </div>
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

          <p className="mt-4 text-muted" role="status">{t('treeResultsCount', { n: results.length })}</p>
          {results.length === 0 ? (
            <p className="py-10 text-center text-lg text-muted">{t('treeNoResults')}</p>
          ) : (
            <ul className="mt-2 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
              {results.slice(0, limit).map((p) => {
                const parent = p.parentId ? index.byId.get(p.parentId) : undefined;
                return (
                  <li key={p.id}>
                    <Link to={`/person/${encodeURIComponent(p.id)}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-mint-soft">
                      <span>
                        <span className="block font-semibold text-ink">{p.fullName}</span>
                        <span className="block text-sm text-muted">
                          {generationLabel(t, p.generation)}
                          {parent ? ` · ${parent.fullName}` : ''} · {statusLabel(t, p)}
                        </span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {results.length > limit && (
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="min-h-11 cursor-pointer rounded-md border border-primary px-5 font-semibold text-primary hover:bg-mint">
                {t('treeShowMore')}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
