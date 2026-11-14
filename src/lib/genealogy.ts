import type { Person } from './types';

export interface GenealogyIndex {
  byId: Map<string, Person>;
  childrenOf: Map<string, Person[]>;
  rootId: string | null;
  all: Person[];
}

const sortKey = (p: Person) => p.birthOrder ?? p.reportOrder ?? 9999;

/** Build lookup tables once; every query afterwards is O(1) or O(depth). */
export function buildIndex(persons: Person[]): GenealogyIndex {
  const byId = new Map<string, Person>();
  const childrenOf = new Map<string, Person[]>();
  for (const p of persons) byId.set(p.id, p);
  for (const p of persons) {
    if (!p.parentId || !byId.has(p.parentId)) continue;
    const list = childrenOf.get(p.parentId) ?? [];
    list.push(p);
    childrenOf.set(p.parentId, list);
  }
  for (const list of childrenOf.values()) {
    list.sort((a, b) => sortKey(a) - sortKey(b) || a.fullName.localeCompare(b.fullName));
  }
  const root = persons.find((p) => p.generation === 0 && !p.parentId) ?? null;
  return { byId, childrenOf, rootId: root?.id ?? null, all: persons };
}

export const getChildren = (idx: GenealogyIndex, id: string): Person[] => idx.childrenOf.get(id) ?? [];

export function getSiblings(idx: GenealogyIndex, id: string): Person[] {
  const p = idx.byId.get(id);
  if (!p?.parentId) return [];
  return getChildren(idx, p.parentId).filter((s) => s.id !== id);
}

/** Ancestors from the root down to (and including) the given person. */
export function getLineage(idx: GenealogyIndex, id: string): Person[] {
  const chain: Person[] = [];
  const seen = new Set<string>();
  let cur = idx.byId.get(id);
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    chain.unshift(cur);
    cur = cur.parentId ? idx.byId.get(cur.parentId) : undefined;
  }
  return chain;
}

export function countDescendants(idx: GenealogyIndex, id: string): number {
  let n = 0;
  const stack = [...getChildren(idx, id)];
  while (stack.length) {
    const c = stack.pop()!;
    n++;
    stack.push(...getChildren(idx, c.id));
  }
  return n;
}

/**
 * Relationship of `target` as seen from `focus`, computed from the lineage only.
 * Returns a translation key plus the gender to pick the right word.
 */
export type RelationshipKey =
  | 'self' | 'parent' | 'grandparent' | 'greatGrandparent' | 'ancestor'
  | 'child' | 'grandchild' | 'greatGrandchild' | 'descendant'
  | 'sibling' | 'parentSibling' | 'grandparentSibling' | 'siblingChild' | 'cousin' | 'relative';

export function relationship(idx: GenealogyIndex, targetId: string, focusId: string): RelationshipKey {
  if (targetId === focusId) return 'self';
  const t = getLineage(idx, targetId).map((p) => p.id);
  const f = getLineage(idx, focusId).map((p) => p.id);
  let common = -1;
  for (let i = 0; i < Math.min(t.length, f.length); i++) {
    if (t[i] === f[i]) common = i;
    else break;
  }
  if (common < 0) return 'relative';
  const dt = t.length - 1 - common; // steps from common ancestor down to target
  const df = f.length - 1 - common; // steps from common ancestor down to focus
  if (dt === 0) return df === 1 ? 'parent' : df === 2 ? 'grandparent' : df === 3 ? 'greatGrandparent' : 'ancestor';
  if (df === 0) return dt === 1 ? 'child' : dt === 2 ? 'grandchild' : dt === 3 ? 'greatGrandchild' : 'descendant';
  if (dt === 1 && df === 1) return 'sibling';
  if (dt === 1 && df === 2) return 'parentSibling';
  if (dt === 1 && df === 3) return 'grandparentSibling';
  if (dt === 2 && df === 1) return 'siblingChild';
  if (dt === df) return 'cousin';
  return 'relative';
}

/** Accent- and case-insensitive name normalisation used for search and duplicate checks. */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function searchPersons(
  idx: GenealogyIndex,
  query: string,
  opts: { branchId?: string; generation?: number } = {},
): Person[] {
  const q = normalize(query);
  const terms = q ? q.split(' ') : [];
  return idx.all
    .filter((p) => {
      if (opts.branchId && p.branchId !== opts.branchId) return false;
      if (opts.generation !== undefined && p.generation !== opts.generation) return false;
      if (!terms.length) return true;
      const name = normalize(p.fullName);
      return terms.every((term) => name.includes(term));
    })
    .sort((a, b) => a.generation - b.generation || sortKey(a) - sortKey(b) || a.fullName.localeCompare(b.fullName));
}

export interface DataIssue {
  kind: 'census_sum_mismatch' | 'missing_parent' | 'generation_mismatch' | 'possible_duplicate';
  personId: string;
  detail: string;
}

/** Consistency checks shown to administrators (never to the public). */
export function findDataIssues(idx: GenealogyIndex): DataIssue[] {
  const issues: DataIssue[] = [];
  for (const p of idx.all) {
    if (p.parentId && !idx.byId.has(p.parentId)) {
      issues.push({ kind: 'missing_parent', personId: p.id, detail: `Parent record "${p.parentId}" does not exist.` });
    }
    const parent = p.parentId ? idx.byId.get(p.parentId) : undefined;
    if (parent && parent.generation + 1 !== p.generation) {
      issues.push({ kind: 'generation_mismatch', personId: p.id, detail: `Generation ${p.generation} but parent is generation ${parent.generation}.` });
    }
    const kids = getChildren(idx, p.id);
    if (p.reportedCount15Plus !== undefined && kids.length && kids.every((k) => k.reportedCount15Plus !== undefined)) {
      const sum = kids.reduce((s, k) => s + (k.reportedCount15Plus ?? 0), 0);
      if (sum !== p.reportedCount15Plus) {
        issues.push({ kind: 'census_sum_mismatch', personId: p.id, detail: `Reported ${p.reportedCount15Plus} members aged 15+, but the listed households add up to ${sum}.` });
      }
    }
    const seen = new Map<string, string>();
    for (const k of kids) {
      const key = normalize(k.fullName);
      if (seen.has(key)) issues.push({ kind: 'possible_duplicate', personId: k.id, detail: `Same name as ${seen.get(key)} under the same parent.` });
      else seen.set(key, k.id);
    }
  }
  return issues;
}
