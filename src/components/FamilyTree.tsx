import { ChevronDown, ChevronUp, Crosshair, Maximize, Minimize, Minus, Plus, ScanSearch, ShieldCheck, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { generationLabel, relationshipLabel, statusLabel, useI18n } from '../i18n';
import { getChildren, getSiblings, relationship, type GenealogyIndex } from '../lib/genealogy';
import { CARD_H, CARD_W, computeLayout } from '../lib/treeLayout';

const MIN_Z = 0.25;
const MAX_Z = 2;
const PAD = 40;

interface Props {
  index: GenealogyIndex;
  mode: 'full' | 'lineage';
  focusId: string | null;
  onTraceLineage: (id: string) => void;
}

export default function FamilyTree({ index, mode, focusId, onTraceLineage }: Props) {
  const { t } = useI18n();
  const rootId = index.rootId;
  const initialExpanded = useCallback(() => new Set<string>(mode === 'full' && rootId ? [rootId] : []), [mode, rootId]);
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);
  const [selectedId, setSelectedId] = useState<string | null>(mode === 'lineage' ? focusId : rootId);
  const [view, setView] = useState({ x: 0, y: 0, z: 1 });
  const [fullscreen, setFullscreen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const anchor = useRef<{ id: string; x: number; y: number } | null>(null);
  const reveal = useRef<string | null>(null);

  const layout = useMemo(() => computeLayout(index, expanded, mode === 'lineage' ? focusId : null), [index, expanded, mode, focusId]);

  // Reset when the mode or the focused person changes.
  useEffect(() => {
    setExpanded(initialExpanded());
    setSelectedId(mode === 'lineage' ? focusId : rootId);
    anchor.current = null;
    centerPending.current = true;
  }, [mode, focusId, rootId, initialExpanded]);

  // ---------- Viewport helpers ----------
  const viewportSize = () => {
    const el = viewportRef.current;
    return { w: el?.clientWidth ?? 800, h: el?.clientHeight ?? 600 };
  };

  const centerOn = useCallback(
    (id: string | null, z?: number, top = false) => {
      const node = id ? layout.byId.get(id) : undefined;
      const { w, h } = viewportSize();
      const zoom = z ?? view.z;
      if (!node) return;
      const cx = node.x + CARD_W / 2 + PAD;
      const cy = node.y + CARD_H / 2 + PAD;
      setView({ z: zoom, x: w / 2 - cx * zoom, y: top ? 24 - (node.y + PAD) * zoom : h / 2 - cy * zoom });
    },
    [layout, view.z],
  );

  const fit = useCallback(() => {
    const { w, h } = viewportSize();
    const tw = layout.width + PAD * 2;
    const th = layout.height + PAD * 2;
    const z = Math.min(MAX_Z, Math.max(MIN_Z, Math.min(w / tw, h / th)));
    setView({ z, x: (w - tw * z) / 2, y: Math.max(8, (h - th * z) / 2) });
  }, [layout]);

  // Initial / reset positioning: readable zoom, starting person visible.
  const centerPending = useRef(true);
  useLayoutEffect(() => {
    if (!centerPending.current || !layout.nodes.length) return;
    centerPending.current = false;
    const { w } = viewportSize();
    const readable = w < 640 ? 0.85 : 1;
    if (mode === 'lineage' && focusId) centerOn(focusId, readable);
    else centerOn(rootId, w < 640 ? readable : Math.max(0.75, Math.min(readable, w / (layout.width + PAD * 2))), true);
  }, [layout, mode, focusId, rootId, centerOn]);

  // Keep the tapped person in the same place on screen after branches open/close.
  useLayoutEffect(() => {
    const r = reveal.current;
    if (r) {
      reveal.current = null;
      anchor.current = null;
      const node = layout.byId.get(r);
      if (node) {
        const { w } = viewportSize();
        setView((v) => ({ ...v, x: w / 2 - (node.x + CARD_W / 2 + PAD) * v.z, y: 16 - (node.y + PAD) * v.z }));
      }
      return;
    }
    const a = anchor.current;
    if (!a) return;
    anchor.current = null;
    const node = layout.byId.get(a.id);
    if (!node) return;
    setView((v) => ({ ...v, x: v.x - (node.x - a.x) * v.z, y: v.y - (node.y - a.y) * v.z }));
  }, [layout]);

  const toggle = (id: string) => {
    const node = layout.byId.get(id);
    if (node) anchor.current = { id, x: node.x, y: node.y };
    if (!expanded.has(id)) reveal.current = id;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSiblings = (id: string) => {
    const p = index.byId.get(id);
    if (!p?.parentId) return;
    const node = layout.byId.get(id);
    if (node) anchor.current = { id, x: node.x, y: node.y };
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(p.parentId!)) next.delete(p.parentId!);
      else next.add(p.parentId!);
      return next;
    });
  };

  const expandAll = () => {
    anchor.current = null;
    setExpanded(new Set(index.all.filter((p) => getChildren(index, p.id).length).map((p) => p.id)));
    setTimeout(fit, 0);
  };
  const collapseAll = () => {
    setExpanded(initialExpanded());
    centerPending.current = true;
  };

  // ---------- Zoom ----------
  const zoomAt = useCallback((factor: number, px?: number, py?: number) => {
    setView((v) => {
      const { w, h } = viewportSize();
      const cx = px ?? w / 2;
      const cy = py ?? h / 2;
      const z = Math.min(MAX_Z, Math.max(MIN_Z, v.z * factor));
      return { z, x: cx - ((cx - v.x) * z) / v.z, y: cy - ((cy - v.y) * z) / v.z };
    });
  }, []);

  // Non-passive wheel listener so the page does not scroll while zooming the tree.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt, fullscreen]);

  // ---------- Pointer pan & pinch ----------
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; z: number; moved: boolean } | null>(null);
  const dragMoved = useRef(false);

  const onPointerDown = (e: RPointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragMoved.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), z: view.z, moved: true };
    }
  };
  const onPointerMove = (e: RPointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const r = viewportRef.current!.getBoundingClientRect();
      const target = Math.min(MAX_Z, Math.max(MIN_Z, (gesture.current.z * dist) / gesture.current.dist));
      zoomAt(target / view.z, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      dragMoved.current = true;
      return;
    }
    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) dragMoved.current = true;
    if (dragMoved.current) {
      if (!viewportRef.current?.hasPointerCapture(e.pointerId)) viewportRef.current?.setPointerCapture(e.pointerId);
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    }
  };
  const onPointerUp = (e: RPointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
  };

  // ---------- Fullscreen (CSS overlay works on every phone, including iOS) ----------
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [fullscreen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== viewportRef.current) return;
    const step = 60;
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[e.key]) {
      e.preventDefault();
      setView((v) => ({ ...v, x: v.x + moves[e.key][0], y: v.y + moves[e.key][1] }));
    } else if (e.key === '+' || e.key === '=') zoomAt(1.2);
    else if (e.key === '-') zoomAt(1 / 1.2);
  };

  const selected = selectedId ? index.byId.get(selectedId) : undefined;
  const selectedChildren = selected ? getChildren(index, selected.id).length : 0;
  const selectedSiblings = selected ? getSiblings(index, selected.id).length : 0;
  const siblingsShown = !!(selected?.parentId && expanded.has(selected.parentId));
  const relFocus = mode === 'lineage' && focusId ? index.byId.get(focusId) : undefined;

  const toolBase = 'h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-md px-2 text-ink hover:bg-mint focus-visible:outline-2 focus-visible:outline-primary';
  const toolBtn = `inline-flex ${toolBase}`;

  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 flex flex-col bg-paper' : 'flex flex-col'}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-line bg-white px-2 py-1">
        <button type="button" className={toolBtn} onClick={() => zoomAt(1 / 1.25)} aria-label={t('treeZoomOut')} title={t('treeZoomOut')}>
          <Minus className="h-5 w-5" aria-hidden />
        </button>
        <span className="w-11 text-center text-sm tabular-nums text-muted" aria-live="polite">{Math.round(view.z * 100)}%</span>
        <button type="button" className={toolBtn} onClick={() => zoomAt(1.25)} aria-label={t('treeZoomIn')} title={t('treeZoomIn')}>
          <Plus className="h-5 w-5" aria-hidden />
        </button>
        <button type="button" className={toolBtn} onClick={fit} aria-label={t('treeFit')} title={t('treeFit')}>
          <ScanSearch className="h-5 w-5" aria-hidden />
        </button>
        <button type="button" className={toolBtn} onClick={() => centerOn(selectedId ?? rootId)} aria-label={t('treeCenter')} title={t('treeCenter')}>
          <Crosshair className="h-5 w-5" aria-hidden />
        </button>
        {mode === 'full' && (
          <>
            <button type="button" className={`hidden sm:inline-flex ${toolBase}`} onClick={expandAll}>
              <ChevronDown className="h-5 w-5" aria-hidden /> <span className="text-sm font-medium">{t('treeExpandAll')}</span>
            </button>
            <button type="button" className={`hidden sm:inline-flex ${toolBase}`} onClick={collapseAll}>
              <ChevronUp className="h-5 w-5" aria-hidden /> <span className="text-sm font-medium">{t('treeCollapseAll')}</span>
            </button>
          </>
        )}
        <button type="button" className={`${toolBtn} ml-auto`} onClick={() => setFullscreen((f) => !f)} aria-pressed={fullscreen} aria-label={fullscreen ? t('treeExitFullscreen') : t('treeFullscreen')}>
          {fullscreen ? <Minimize className="h-5 w-5" aria-hidden /> : <Maximize className="h-5 w-5" aria-hidden />}
          <span className="hidden text-sm font-medium sm:inline">{fullscreen ? t('treeExitFullscreen') : t('treeFullscreen')}</span>
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={viewportRef}
        tabIndex={0}
        role="group"
        aria-label={`${t('treeCanvasLabel')}. ${t('treeHelp')}`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative overflow-hidden border border-line bg-[radial-gradient(#dce3de_1px,transparent_1px)] [background-size:24px_24px] focus-visible:outline-3 focus-visible:-outline-offset-3 ${
          fullscreen ? 'flex-1' : 'h-[62dvh] min-h-[22rem] sm:h-[calc(100dvh-16rem)] sm:min-h-[28rem] max-h-[46rem]'
        }`}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`, width: layout.width + PAD * 2, height: layout.height + PAD * 2 }}
        >
          <svg className="absolute inset-0 overflow-visible" width={layout.width + PAD * 2} height={layout.height + PAD * 2} aria-hidden="true">
            {layout.edges.map((e) => {
              const a = layout.byId.get(e.from)!;
              const b = layout.byId.get(e.to)!;
              const x1 = a.x + CARD_W / 2 + PAD;
              const y1 = a.y + CARD_H + PAD;
              const x2 = b.x + CARD_W / 2 + PAD;
              const y2 = b.y + PAD;
              const my = y1 + (y2 - y1) / 2;
              const onPath = a.onPath && b.onPath;
              const unconfirmed = index.byId.get(e.to)?.parentLinkStatus === 'unconfirmed';
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={`M${x1},${y1} V${my} H${x2} V${y2}`}
                  fill="none"
                  stroke={onPath ? '#064734' : '#7D8A83'}
                  strokeWidth={onPath ? 3 : 1.75}
                  strokeDasharray={unconfirmed ? '6 5' : undefined}
                />
              );
            })}
          </svg>

          {layout.nodes.map((n) => {
            const p = index.byId.get(n.id)!;
            const isSel = n.id === selectedId;
            const isSection = p.kind === 'family_section';
            return (
              <div key={n.id} className="absolute" style={{ left: n.x + PAD, top: n.y + PAD, width: CARD_W, height: CARD_H }}>
                <button
                  type="button"
                  onClick={() => {
                    if (dragMoved.current) return;
                    setSelectedId(n.id);
                    if (n.childCount) toggle(n.id);
                  }}
                  aria-expanded={n.childCount ? n.childrenVisible : undefined}
                  aria-label={`${p.fullName}, ${generationLabel(t, p.generation)}${n.childCount ? `, ${t('treeChildren', { n: n.childCount })}` : ''}`}
                  className={`flex h-full w-full cursor-pointer flex-col justify-between rounded-md border-2 bg-white px-3 py-2 text-left shadow-sm transition-colors ${
                    isSel ? 'border-primary ring-4 ring-mint' : n.onPath ? 'border-primary/60 bg-mint-soft' : isSection ? 'border-dashed border-line-strong' : 'border-line hover:border-primary'
                  }`}
                >
                  <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{p.fullName}</span>
                  <span className="flex items-center justify-between gap-1 text-[13px] text-muted">
                    <span>{t('genShort', { n: p.generation })}</span>
                    {n.childCount > 0 ? (
                      <span className={`inline-flex items-center gap-0.5 rounded-full px-2 font-semibold ${n.childrenVisible ? 'bg-primary text-white' : 'bg-mint text-primary'}`}>
                        {n.childCount}
                        {n.childrenVisible ? <ChevronUp className="h-3.5 w-3.5" aria-hidden /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden />}
                      </span>
                    ) : p.status === 'verified' ? (
                      <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                    ) : null}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <p className="pointer-events-none absolute bottom-2 left-2 right-2 hidden text-center text-sm text-muted sm:block">{t('treeHelp')}</p>
      </div>

      {/* Selected person panel */}
      {selected && (
        <section
          aria-label={t('treeSelected')}
          className={`border border-t-0 border-line bg-white p-4 ${fullscreen ? 'max-h-[45dvh] overflow-y-auto' : 'rounded-b-lg'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">
                {generationLabel(t, selected.generation)}
                {relFocus && selected.id !== relFocus.id ? ` · ${relationshipLabel(t, relationship(index, selected.id, relFocus.id), selected.gender)}` : ''}
              </p>
              <h3 className="font-serif text-xl text-ink">{selected.fullName}</h3>
              <p className="text-sm text-muted">
                {statusLabel(t, selected)}
                {selectedChildren ? ` · ${t('treeChildren', { n: selectedChildren })}` : ` · ${t('treeNoChildrenRecorded')}`}
              </p>
            </div>
            <button type="button" onClick={() => setSelectedId(null)} className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-mint" aria-label={t('close')}>
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to={`/person/${encodeURIComponent(selected.id)}`} className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-semibold text-white hover:bg-primary-hover">
              {t('treeViewProfile')}
            </Link>
            {selectedChildren > 0 && (
              <button type="button" onClick={() => toggle(selected.id)} className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-primary px-4 font-semibold text-primary hover:bg-mint">
                {expanded.has(selected.id) ? t('treeHideChildren') : t('treeShowChildren')}
              </button>
            )}
            {selectedSiblings > 0 && (
              <button type="button" onClick={() => toggleSiblings(selected.id)} className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-primary px-4 font-semibold text-primary hover:bg-mint">
                {siblingsShown ? t('treeHideSiblings') : t('treeShowSiblings')}
              </button>
            )}
            {selected.generation > 0 && !(mode === 'lineage' && focusId === selected.id) && (
              <button type="button" onClick={() => onTraceLineage(selected.id)} className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-primary px-4 font-semibold text-primary hover:bg-mint">
                {t('treeTraceLineage')}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
