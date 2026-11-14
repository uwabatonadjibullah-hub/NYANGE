import { getChildren, getLineage, type GenealogyIndex } from './genealogy';

export const CARD_W = 176;
export const CARD_H = 88;
const GAP_X = 16;
const GAP_Y = 56;

export interface LayoutNode {
  id: string;
  x: number; // left
  y: number; // top
  depth: number;
  childCount: number;
  childrenVisible: boolean;
  onPath: boolean;
}

export interface LayoutEdge {
  from: string;
  to: string;
}

export interface TreeLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
  byId: Map<string, LayoutNode>;
}

/**
 * Which children are drawn:
 *  - a node in `expanded` shows all its children;
 *  - otherwise, in lineage mode, a node on the focus path shows only the next
 *    person on that path.
 * This single rule gives "Full family tree" (expand from the root down) and
 * "Direct lineage" (path + any branches the visitor opens: siblings of a person
 * appear when their parent is expanded, descendants when the person is expanded).
 */
export function computeLayout(
  idx: GenealogyIndex,
  expanded: ReadonlySet<string>,
  focusId: string | null,
): TreeLayout {
  const rootId = idx.rootId;
  const empty: TreeLayout = { nodes: [], edges: [], width: 0, height: 0, byId: new Map() };
  if (!rootId) return empty;

  const pathNext = new Map<string, string>();
  const onPath = new Set<string>();
  if (focusId && idx.byId.has(focusId)) {
    const chain = getLineage(idx, focusId);
    chain.forEach((p, i) => {
      onPath.add(p.id);
      if (i < chain.length - 1) pathNext.set(p.id, chain[i + 1].id);
    });
  }

  const visibleChildren = (id: string): string[] => {
    if (expanded.has(id)) return getChildren(idx, id).map((c) => c.id);
    const next = pathNext.get(id);
    return next ? [next] : [];
  };

  // Pass 1: subtree widths (iterative post-order to avoid deep recursion limits)
  const width = new Map<string, number>();
  const order: string[] = [];
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    order.push(id);
    stack.push(...visibleChildren(id));
  }
  for (let i = order.length - 1; i >= 0; i--) {
    const id = order[i];
    const kids = visibleChildren(id);
    const total = kids.reduce((s, k) => s + (width.get(k) ?? CARD_W), 0) + Math.max(0, kids.length - 1) * GAP_X;
    width.set(id, Math.max(CARD_W, total));
  }

  // Pass 2: positions
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const centers = new Map<string, number>();
  const place = (id: string, left: number, depth: number) => {
    const kids = visibleChildren(id);
    const w = width.get(id) ?? CARD_W;
    let center: number;
    if (kids.length) {
      const total = kids.reduce((s, k) => s + (width.get(k) ?? CARD_W), 0) + (kids.length - 1) * GAP_X;
      let cursor = left + (w - total) / 2;
      for (const k of kids) {
        place(k, cursor, depth + 1);
        edges.push({ from: id, to: k });
        cursor += (width.get(k) ?? CARD_W) + GAP_X;
      }
      center = (centers.get(kids[0])! + centers.get(kids[kids.length - 1])!) / 2;
    } else {
      center = left + w / 2;
    }
    centers.set(id, center);
    nodes.push({
      id,
      x: center - CARD_W / 2,
      y: depth * (CARD_H + GAP_Y),
      depth,
      childCount: getChildren(idx, id).length,
      childrenVisible: expanded.has(id),
      onPath: onPath.has(id),
    });
  };
  place(rootId, 0, 0);

  const maxDepth = nodes.reduce((m, n) => Math.max(m, n.depth), 0);
  return {
    nodes,
    edges,
    width: width.get(rootId) ?? CARD_W,
    height: (maxDepth + 1) * CARD_H + maxDepth * GAP_Y,
    byId: new Map(nodes.map((n) => [n.id, n])),
  };
}
