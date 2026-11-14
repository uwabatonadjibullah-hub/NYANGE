import { describe, expect, it } from 'vitest';
import { buildSeedPersons, REPORT_SECTIONS, ROOT_ID } from '../../data/seed';
import { buildIndex, countDescendants, findDataIssues, getChildren, getLineage, getSiblings, relationship, searchPersons } from '../genealogy';
import { computeLayout } from '../treeLayout';
import type { Person } from '../types';

const idx = buildIndex(buildSeedPersons());

describe('seed registry', () => {
  it('has the patriarch, 8 report sections and 82 households', () => {
    expect(idx.rootId).toBe(ROOT_ID);
    expect(getChildren(idx, ROOT_ID)).toHaveLength(8);
    expect(idx.all.filter((p) => p.generation === 2)).toHaveLength(82);
  });

  it('never invents gender, birth order, location or verification', () => {
    for (const p of idx.all.filter((x) => x.generation > 0)) {
      expect(p.gender).toBe('unknown');
      expect(p.birthOrder).toBeUndefined();
      expect(p.location).toBeUndefined();
      expect(p.status).toBe('listed');
      expect(p.parentLinkStatus).toBe('unconfirmed');
    }
  });

  it('keeps unknown household counts unknown, not zero', () => {
    const mugunda = getChildren(idx, 'branch-mugunda-tausi');
    expect(mugunda).toHaveLength(8);
    expect(mugunda.every((p) => p.reportedCount15Plus === undefined)).toBe(true);
  });

  it('sums the report sections to the reported 398', () => {
    expect(REPORT_SECTIONS.reduce((s, x) => s + x.reportedCount15Plus, 0)).toBe(398);
  });

  it('flags census figures that need family confirmation', () => {
    const issues = findDataIssues(idx).filter((i) => i.kind === 'census_sum_mismatch').map((i) => i.personId);
    expect(issues).toContain('branch-mselem'); // rows add up to 126, report says 116
    expect(issues).toContain('branch-mariam'); // rows add up to 78, report says 79
  });
});

describe('relationships', () => {
  const people: Person[] = [
    { id: 'r', fullName: 'Root', kind: 'person', gender: 'male', generation: 0, status: 'verified' },
    { id: 'a', fullName: 'A', kind: 'person', gender: 'female', generation: 1, parentId: 'r', status: 'verified' },
    { id: 'b', fullName: 'B', kind: 'person', gender: 'male', generation: 1, parentId: 'r', status: 'verified' },
    { id: 'a1', fullName: 'A1', kind: 'person', gender: 'unknown', generation: 2, parentId: 'a', status: 'verified' },
    { id: 'b1', fullName: 'B1', kind: 'person', gender: 'male', generation: 2, parentId: 'b', status: 'verified' },
    { id: 'a11', fullName: 'A11', kind: 'person', gender: 'female', generation: 3, parentId: 'a1', status: 'verified' },
  ];
  const g = buildIndex(people);

  it('computes kinship from the lineage only', () => {
    expect(relationship(g, 'a', 'a1')).toBe('parent');
    expect(relationship(g, 'r', 'a11')).toBe('greatGrandparent');
    expect(relationship(g, 'b', 'a')).toBe('sibling');
    expect(relationship(g, 'b', 'a1')).toBe('parentSibling');
    expect(relationship(g, 'b1', 'a1')).toBe('cousin');
    expect(relationship(g, 'a1', 'b')).toBe('siblingChild');
    expect(relationship(g, 'a11', 'a')).toBe('grandchild');
  });

  it('finds lineage, siblings and descendants', () => {
    expect(getLineage(g, 'a11').map((p) => p.id)).toEqual(['r', 'a', 'a1', 'a11']);
    expect(getSiblings(g, 'a').map((p) => p.id)).toEqual(['b']);
    expect(countDescendants(g, 'a')).toBe(2);
  });

  it('searches without caring about accents or case', () => {
    expect(searchPersons(idx, 'saeed').length).toBeGreaterThan(0);
    expect(searchPersons(idx, 'REHEMA sudi').map((p) => p.fullName)).toEqual(['Rehema Sudi']);
  });
});

describe('tree layout', () => {
  it('shows only the root and its children when the root is expanded', () => {
    const l = computeLayout(idx, new Set([ROOT_ID]), null);
    expect(l.nodes).toHaveLength(9);
    expect(l.edges).toHaveLength(8);
  });

  it('shows the direct line only in lineage mode', () => {
    const l = computeLayout(idx, new Set(), 'gc-mselem-1');
    expect(l.nodes.map((n) => n.id).sort()).toEqual([ROOT_ID, 'branch-mselem', 'gc-mselem-1'].sort());
  });

  it('reveals siblings when the parent is opened, without overlapping cards', () => {
    const l = computeLayout(idx, new Set(['branch-mselem']), 'gc-mselem-1');
    expect(l.nodes).toHaveLength(2 + 23);
    const row = l.nodes.filter((n) => n.depth === 2).sort((a, b) => a.x - b.x);
    for (let i = 1; i < row.length; i++) expect(row[i].x - row[i - 1].x).toBeGreaterThanOrEqual(176);
  });

  it('handles a full expansion of the whole registry', () => {
    const all = new Set(idx.all.map((p) => p.id));
    const l = computeLayout(idx, all, null);
    expect(l.nodes).toHaveLength(idx.all.length);
  });
});
