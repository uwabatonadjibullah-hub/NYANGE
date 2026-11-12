import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  GenealogyPerson, 
  CanvasLayoutNode, 
  CanvasConnectionLine, 
  Language 
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  getPersonById, 
  getChildren, 
  getSiblings, 
  getParents, 
  getRelationshipToFocused, 
  ROOT_PATRIARCH_ID,
  getPendingSubmissionsCount,
  getAllGenealogyPersons,
  getDirectLineageAncestors
} from '../data/genealogyDatabase';
import { computeDynamicTreeLayout, LayoutEngineOutput } from '../utils/canvasLayoutEngine';
import { AddDescendantsModal } from './AddDescendantsModal';
import { AdminReviewModal } from './AdminReviewModal';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Crosshair, 
  GitFork, 
  GitBranch, 
  Users, 
  User, 
  Search, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  ChevronRight, 
  ChevronDown, 
  Minimize2,
  CheckCircle2,
  Compass,
  ArrowRight,
  Plus,
  ShieldAlert,
  Sliders,
  Workflow,
  Eye,
  Layers,
  Network
} from 'lucide-react';

interface DynamicFamilyTreeCanvasProps {
  currentLanguage: Language;
  initialPersonId?: string;
  onSelectPersonForDetail?: (person: GenealogyPerson) => void;
  onOpenRecordMe?: () => void;
}

export const DynamicFamilyTreeCanvas: React.FC<DynamicFamilyTreeCanvasProps> = ({
  currentLanguage,
  initialPersonId = ROOT_PATRIARCH_ID, // Default to NYANGE RADJABU (Full Family Tree starting point)
  onSelectPersonForDetail,
  onOpenRecordMe
}) => {
  const t = TRANSLATIONS[currentLanguage];

  // Core Canvas State
  const [focusedPersonId, setFocusedPersonId] = useState<string>(initialPersonId);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(initialPersonId);
  
  // Default selected mode when opening must be Full Family Tree per Section 2
  const [viewMode, setViewMode] = useState<'full_tree' | 'dynamic' | 'direct_lineage'>('full_tree');

  // Independent Expansion States per Node
  const [expandedDescendants, setExpandedDescendants] = useState<Set<string>>(new Set());
  const [expandedSiblings, setExpandedSiblings] = useState<Set<string>>(new Set());

  // Track the 4-state / 2-state click cycle per node
  // State: 0 (neither), 1 (both), 2 (siblings only), 3 (descendants only)
  const [nodeClickCycles, setNodeClickCycles] = useState<Record<string, number>>({});

  // Viewport Transform State: Pan (x, y) & Zoom
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(0.65);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Full Screen State (Section 3 Requirement)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Touch pinch-to-zoom tracking
  const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(0.65);

  // Modals state
  const [isAddDescendantsOpen, setIsAddDescendantsOpen] = useState(false);
  const [personToAddDescendants, setPersonToAddDescendants] = useState<GenealogyPerson | null>(null);
  const [isAdminReviewOpen, setIsAdminReviewOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0); // Trigger re-render when submissions change

  // Canvas Instant Search State
  const [canvasSearchQuery, setCanvasSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [lineageStatusToast, setLineageStatusToast] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute layout with current expansion state and data
  const layout: LayoutEngineOutput = computeDynamicTreeLayout(
    focusedPersonId,
    expandedDescendants,
    expandedSiblings,
    viewMode,
    selectedPersonId
  );

  const focusedPerson = getPersonById(focusedPersonId) || getPersonById(ROOT_PATRIARCH_ID)!;
  const directAncestors = getDirectLineageAncestors(focusedPerson.id);
  const directAncestorIds = new Set(directAncestors.map((a) => a.id));
  const selectedPerson = selectedPersonId ? getPersonById(selectedPersonId) : focusedPerson;
  const pendingSubmissionsCount = getPendingSubmissionsCount();

  // Center Viewport on a specific position or focused node
  const centerOnPosition = useCallback((targetX: number, targetY: number, customZoom?: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const currentZ = customZoom !== undefined ? customZoom : zoom;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const newPanX = containerWidth / 2 - targetX * currentZ;
    const newPanY = containerHeight / 2 - targetY * currentZ;

    setPan({ x: newPanX, y: newPanY });
    if (customZoom !== undefined) setZoom(customZoom);
  }, [zoom]);

  // Fit Entire Tree into Viewport
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const treeW = layout.bounds.width;
    const treeH = layout.bounds.height;
    const scaleX = (container.clientWidth - 120) / treeW;
    const scaleY = (container.clientHeight - 120) / treeH;
    const fitZoom = Math.min(1.0, Math.max(0.15, Math.min(scaleX, scaleY)));

    const centerX = (layout.bounds.minX + layout.bounds.maxX) / 2;
    const centerY = (layout.bounds.minY + layout.bounds.maxY) / 2;

    centerOnPosition(centerX, centerY, fitZoom);
  }, [layout.bounds, centerOnPosition]);

  // Initial Full Tree Fit on Mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToScreen();
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize initialPersonId prop changes from parent
  useEffect(() => {
    if (initialPersonId) {
      setFocusedPersonId(initialPersonId);
      setSelectedPersonId(initialPersonId);
      if (initialPersonId !== ROOT_PATRIARCH_ID) {
        setViewMode('direct_lineage');
        setExpandedSiblings(new Set());
        setExpandedDescendants(new Set());
        setNodeClickCycles({ [initialPersonId]: 0 });
      }
    }
  }, [initialPersonId]);

  // Center on focused person when focused person changes in direct_lineage or dynamic mode
  useEffect(() => {
    if (viewMode !== 'full_tree' && layout.focusedNodePosition) {
      centerOnPosition(layout.focusedNodePosition.x, layout.focusedNodePosition.y, 0.85);
    }
  }, [focusedPersonId, viewMode]);

  // -------------------------------------------------------------------------
  // FULL SCREEN HANDLERS & LISTENERS (Section 3 Requirement)
  // -------------------------------------------------------------------------
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      setIsFullScreen(true);
      try {
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => {});
        }
      } catch {
        // Fallback to CSS full-viewport
      }
    } else {
      setIsFullScreen(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullScreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  // Direct Lineage Isolation Search Handler (Part 2.2 Requirement)
  const focusOnPersonDirectLineage = (personId: string) => {
    const person = getPersonById(personId);
    if (!person) return;

    setFocusedPersonId(personId);
    setSelectedPersonId(personId);
    setViewMode('direct_lineage');
    setExpandedSiblings(new Set());
    setExpandedDescendants(new Set());
    setNodeClickCycles({ [personId]: 0 });
    setCanvasSearchQuery('');
    setIsSearchFocused(false);

    setLineageStatusToast(
      `Focused on "${person.fullName}". Direct ancestral lineage traced back to NYANGE RADJABU. Siblings and descendants hidden (initial state).`
    );
  };

  // View Mode Switchers
  const switchToFullTree = () => {
    setViewMode('full_tree');
    setExpandedSiblings(new Set());
    setExpandedDescendants(new Set());
    setNodeClickCycles({});
    setLineageStatusToast(null);
    setTimeout(() => {
      fitToScreen();
    }, 60);
  };

  const switchToDirectLineage = () => {
    setViewMode('direct_lineage');
    setExpandedSiblings(new Set());
    setExpandedDescendants(new Set());
    setNodeClickCycles({});
    let targetId = selectedPersonId || focusedPersonId;
    if (!targetId || targetId === ROOT_PATRIARCH_ID) {
      targetId = 'gc-mselem-1'; // Bizimungu Saidi default for direct lineage exploration
    }
    const target = getPersonById(targetId) || getPersonById(ROOT_PATRIARCH_ID)!;
    setFocusedPersonId(target.id);
    setSelectedPersonId(target.id);
    setTimeout(() => {
      centerSelectedPerson();
    }, 80);
  };

  const centerSelectedPerson = () => {
    const targetId = selectedPersonId || focusedPersonId;
    const targetNode = layout.nodes.find((n) => n.id === targetId);
    const targetZoom = Math.max(zoom, 0.75);
    if (targetNode) {
      centerOnPosition(targetNode.x + targetNode.width / 2, targetNode.y + targetNode.height / 2, targetZoom);
    } else if (layout.focusedNodePosition) {
      centerOnPosition(layout.focusedNodePosition.x, layout.focusedNodePosition.y, targetZoom);
    }
  };

  const resetView = () => {
    setViewMode('full_tree');
    setFocusedPersonId(ROOT_PATRIARCH_ID);
    setSelectedPersonId(ROOT_PATRIARCH_ID);
    setExpandedSiblings(new Set());
    setExpandedDescendants(new Set());
    setNodeClickCycles({});
    setCanvasSearchQuery('');
    setLineageStatusToast(null);
    setTimeout(() => {
      fitToScreen();
    }, 60);
  };

  // Pan Handlers (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-interactive-element')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom via wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(2.0, Math.max(0.15, zoom * zoomFactor));

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    } else {
      setZoom(newZoom);
    }
  };

  // Touch Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-interactive-element')) return;

    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDist(dist);
      setInitialPinchZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && initialPinchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / initialPinchDist;
      const newZoom = Math.min(2.0, Math.max(0.15, initialPinchZoom * scale));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialPinchDist(null);
  };

  // -------------------------------------------------------------------------
  // MANDATORY NODE INTERACTION CLICK CYCLES (Part 2.3 & Part 2.4)
  // -------------------------------------------------------------------------
  const handleNodeClick = (person: GenealogyPerson, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPersonId(person.id);

    // Differentiate node roles in the genealogical tree:
    const isDirectAncestor = directAncestorIds.has(person.id) && person.id !== focusedPerson.id;
    const isCollateral = !directAncestorIds.has(person.id) && person.id !== focusedPerson.id;
    const isFocusedSelected = person.id === focusedPerson.id;

    // -------------------------------------------------------------------------
    // INTERACTION 1: CLICK ANY DIRECT ANCESTOR TO EXPLORE THEIR SIBLINGS
    // 2-State Cycle: Show siblings -> Hide siblings -> Repeat.
    // Ancestor remains anchored in central column. Siblings appear horizontally.
    // -------------------------------------------------------------------------
    if (isDirectAncestor) {
      setExpandedSiblings((prev) => {
        const next = new Set(prev);
        if (next.has(person.id)) {
          next.delete(person.id);
          // When closing ancestor siblings, cleanly collapse any open collateral branches of those siblings
          const sibs = getSiblings(person.id);
          setExpandedDescendants((prevDesc) => {
            const nextDesc = new Set(prevDesc);
            sibs.forEach((s) => nextDesc.delete(s.id));
            return nextDesc;
          });
        } else {
          next.add(person.id);
        }
        return next;
      });
      return;
    }

    // -------------------------------------------------------------------------
    // INTERACTION 2: CLICK ANY REVEALED SIBLING TO EXPLORE THEIR DESCENDANTS
    // 2-State Cycle: Show descendants -> Hide descendants -> Repeat.
    // Descendants drop vertically beneath the sibling as a separate collateral branch.
    // Independent branch state: expanding/collapsing this relative does not affect other relatives.
    // -------------------------------------------------------------------------
    if (isCollateral) {
      setExpandedDescendants((prev) => {
        const next = new Set(prev);
        if (next.has(person.id)) {
          next.delete(person.id);
        } else {
          next.add(person.id);
        }
        return next;
      });
      return;
    }

    // -------------------------------------------------------------------------
    // SECTION 3: PRESERVE THE SELECTED PERSON'S OWN CLICK CYCLE
    // If person has recorded descendants: 4-State Cycle (both -> siblings only -> descendants only -> hidden both)
    // If person has no recorded descendants: 2-State Cycle (show siblings -> hide siblings) + "+ ADD DESCENDANTS"
    // -------------------------------------------------------------------------
    if (isFocusedSelected) {
      const children = getChildren(person.id);
      const hasRecordedDescendants = children.length > 0;
      const currentCycle = nodeClickCycles[person.id] || 0;

      if (hasRecordedDescendants) {
        // 4-STATE CLICK CYCLE FOR INDIVIDUALS WITH RECORDED DESCENDANTS:
        // State 0 (Initial): Hidden Siblings, Hidden Descendants
        // Click 1 (State 1): Show siblings AND descendants
        // Click 2 (State 2): Hide descendants. Keep siblings visible
        // Click 3 (State 3): Show descendants. Hide siblings
        // Click 4 (State 0): Hide both siblings AND descendants (returns to Initial)
        const nextCycle = (currentCycle + 1) % 4;
        setNodeClickCycles((prev) => ({ ...prev, [person.id]: nextCycle }));

        if (nextCycle === 1) {
          setExpandedSiblings((prev) => new Set(prev).add(person.id));
          setExpandedDescendants((prev) => new Set(prev).add(person.id));
        } else if (nextCycle === 2) {
          setExpandedSiblings((prev) => new Set(prev).add(person.id));
          setExpandedDescendants((prev) => {
            const next = new Set(prev);
            next.delete(person.id);
            return next;
          });
        } else if (nextCycle === 3) {
          setExpandedSiblings((prev) => {
            const next = new Set(prev);
            next.delete(person.id);
            return next;
          });
          setExpandedDescendants((prev) => new Set(prev).add(person.id));
        } else {
          setExpandedSiblings((prev) => {
            const next = new Set(prev);
            next.delete(person.id);
            return next;
          });
          setExpandedDescendants((prev) => {
            const next = new Set(prev);
            next.delete(person.id);
            return next;
          });
        }
      } else {
        // 2-STATE CLICK CYCLE FOR INDIVIDUALS WITHOUT RECORDED DESCENDANTS:
        // State 0: Hidden Siblings
        // Click 1: Show siblings
        // Click 2: Hide siblings
        const nextCycle = (currentCycle + 1) % 2;
        setNodeClickCycles((prev) => ({ ...prev, [person.id]: nextCycle }));

        if (nextCycle === 1) {
          setExpandedSiblings((prev) => new Set(prev).add(person.id));
        } else {
          setExpandedSiblings((prev) => {
            const next = new Set(prev);
            next.delete(person.id);
            return next;
          });
        }
      }
    }
  };

  const openAddDescendantsModal = (person: GenealogyPerson, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPersonToAddDescendants(person);
    setIsAddDescendantsOpen(true);
  };

  // Quick Guided Scenarios for Acceptance Testing
  const runAcceptanceFullTree = () => {
    switchToFullTree();
  };

  const runAcceptanceCaseA = () => {
    // Case A: Bizimungu Saidi (Direct Lineage test)
    focusOnPersonDirectLineage('gc-mselem-1');
  };

  const runAcceptanceCaseB = () => {
    // Case B: Person without recorded descendants (e.g. Kibogora Hassan)
    focusOnPersonDirectLineage('gc-kwiriha-4');
  };

  return (
    <div className="space-y-4">
      {/* 1. SCENARIO WALKTHROUGH & QUICK JUMP BANNER */}
      <div className="bg-gradient-to-r from-[#064734] via-[#053d2c] to-[#043124] text-white p-4 sm:p-5 rounded-3xl shadow-md border border-[#064734]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#E0FFC2] text-[#064734] shrink-0 mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-white/20 text-[#E0FFC2]">
                Official Genealogy Canvas · Levels 0–2
              </span>
              <span className="text-xs text-stone-300">
                Full Family Tree by Default · Straight 90° Orthogonal Connectors
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 font-sans">
              NYANGE RADJABU Complete Heritage Tree
            </h3>
            <p className="text-xs text-stone-200 mt-0.5 leading-relaxed max-w-2xl">
              Default view shows the full family tree from Level 0 to Level 2. Search any individual to focus on direct lineage. Use Full Screen control for expanded exploration.
            </p>
          </div>
        </div>

        {/* Guided Test Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto shrink-0">
          <button
            onClick={runAcceptanceFullTree}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm ${
              viewMode === 'full_tree'
                ? 'bg-[#E0FFC2] text-[#064734]'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Show Full Family Tree (All 8 branches & 82 grandchildren)"
          >
            <Network className="w-3.5 h-3.5" />
            <span>Full Family Tree</span>
          </button>

          <button
            onClick={runAcceptanceCaseA}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Case A: Focus on Bizimungu Saidi direct lineage"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E0FFC2]" />
            <span>Case A: Bizimungu</span>
          </button>

          <button
            onClick={runAcceptanceCaseB}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors cursor-pointer"
            title="Case B: Test individual without descendants"
          >
            <span>Case B: Kibogora</span>
          </button>

          <button
            onClick={() => setIsAdminReviewOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Open Admin Review panel to approve pending submissions and remove yellow border"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Review ({pendingSubmissionsCount})</span>
          </button>
        </div>
      </div>

      {/* 1.1 IN-CANVAS SEARCH & DIRECT LINEAGE TRACER (Part 2.2 Requirement) */}
      <div className="relative z-40 bg-white rounded-2xl p-3 border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative grow">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={canvasSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setCanvasSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            placeholder="Search any family member to trace direct lineage (e.g. Bizimungu Saidi, Kibogora Hassan, Rehema Sudi)..."
            className="w-full pl-9 pr-9 py-2 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#064734] bg-stone-50 focus:bg-white text-stone-900"
          />
          {canvasSearchQuery && (
            <button
              onClick={() => {
                setCanvasSearchQuery('');
                setIsSearchFocused(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {isSearchFocused && canvasSearchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-stone-200 max-h-64 overflow-y-auto divide-y divide-stone-100 z-50 animate-in fade-in zoom-in-95 duration-100">
              {getAllGenealogyPersons()
                .filter(
                  (p) =>
                    p.fullName.toLowerCase().includes(canvasSearchQuery.toLowerCase()) ||
                    p.branchName.toLowerCase().includes(canvasSearchQuery.toLowerCase())
                )
                .slice(0, 8)
                .map((person) => (
                  <div
                    key={person.id}
                    onClick={() => focusOnPersonDirectLineage(person.id)}
                    className="p-2.5 hover:bg-stone-50 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-6 h-6 rounded-md bg-[#064734] text-[#E0FFC2] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        L{person.generationLevel}
                      </span>
                      <div className="truncate">
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          {person.fullName}
                        </span>
                        <span className="text-[10px] text-stone-500 block truncate">
                          {person.branchName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#064734] bg-[#E0FFC2] px-2 py-0.5 rounded shrink-0">
                      Trace Lineage &rarr;
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Quick Jump Shortcuts */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 shrink-0">
          <span className="text-[11px] font-semibold text-stone-400">Quick Test:</span>
          <button
            onClick={() => focusOnPersonDirectLineage('gc-mselem-1')}
            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-[#E0FFC2] hover:text-[#064734] font-medium text-[11px] cursor-pointer transition-colors"
          >
            Bizimungu Saidi (L2)
          </button>
          <button
            onClick={() => focusOnPersonDirectLineage('gc-kwiriha-4')}
            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-[#E0FFC2] hover:text-[#064734] font-medium text-[11px] cursor-pointer transition-colors"
          >
            Kibogora Hassan (L2)
          </button>
          <button
            onClick={() => focusOnPersonDirectLineage('gc-kwiriha-1')}
            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-[#E0FFC2] hover:text-[#064734] font-medium text-[11px] cursor-pointer transition-colors"
          >
            Rehema Sudi (L2)
          </button>
        </div>
      </div>

      {/* Direct Lineage Status Feedback Alert */}
      {lineageStatusToast && (
        <div className="bg-[#064734] text-[#E0FFC2] p-3 rounded-2xl border border-[#E0FFC2]/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lineageStatusToast}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={switchToFullTree}
              className="px-3 py-1 bg-[#E0FFC2] hover:bg-white text-[#064734] font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
            >
              Return to Full Family Tree
            </button>
            <button
              onClick={() => setLineageStatusToast(null)}
              className="p-1 text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. CANVAS MAIN VIEWPORT CONTAINER (Supports Full-Screen Mode) */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`canvas-viewport-container select-none ${
          isFullScreen 
            ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none m-0 p-0 border-0 shadow-none' 
            : 'relative w-full h-[650px] sm:h-[750px] rounded-3xl border-2 border-stone-800 shadow-2xl'
        } bg-stone-900 overflow-hidden cursor-grab active:cursor-grabbing`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(6, 71, 52, 0.18) 0%, transparent 80%),
            radial-gradient(rgba(224, 255, 194, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px'
        }}
      >
        {/* Floating Controls Toolbar (Top Left) */}
        <div className="canvas-interactive-element absolute top-4 left-4 z-30 flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl text-white text-xs max-w-[90vw]">
          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="p-2 rounded-xl hover:bg-white/10 text-stone-200 hover:text-white cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.15, z - 0.15))}
            className="p-2 rounded-xl hover:bg-white/10 text-stone-200 hover:text-white cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(0.65)}
            className="px-2 py-1 rounded-xl hover:bg-white/10 text-stone-300 font-mono text-[11px] font-bold cursor-pointer"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <div className="w-px h-5 bg-white/15 mx-0.5" />

          {/* Mode 1: Full Family Tree (Section 2 Requirement) */}
          <button
            onClick={switchToFullTree}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer flex items-center gap-1.5 transition-colors ${
              viewMode === 'full_tree'
                ? 'bg-[#064734] text-[#E0FFC2] border border-[#E0FFC2]/40 shadow-xs'
                : 'hover:bg-white/10 text-stone-300'
            }`}
            title="View entire documented family tree (Levels 0-2)"
          >
            <Network className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full Family Tree</span>
            <span className="sm:hidden">Full</span>
          </button>

          {/* Mode 2: Direct Lineage (Section 2 Requirement) */}
          <button
            onClick={switchToDirectLineage}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer flex items-center gap-1.5 transition-colors ${
              viewMode === 'direct_lineage'
                ? 'bg-[#064734] text-[#E0FFC2] border border-[#E0FFC2]/40 shadow-xs'
                : 'hover:bg-white/10 text-stone-300'
            }`}
            title="View focused direct ancestral lineage only"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Direct Lineage</span>
            <span className="sm:hidden">Lineage</span>
          </button>

          <div className="w-px h-5 bg-white/15 mx-0.5 hidden sm:block" />

          {/* Fit Entire Tree (Section 2 Requirement) */}
          <button
            onClick={fitToScreen}
            className="p-2 rounded-xl hover:bg-white/10 text-stone-200 hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
            title="Fit Entire Family Tree to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Fit Entire Tree</span>
          </button>

          {/* Center Selected Person (Section 2 Requirement) */}
          <button
            onClick={centerSelectedPerson}
            className="p-2 rounded-xl hover:bg-white/10 text-stone-200 hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
            title="Center Selected Person on Canvas"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#E0FFC2]" />
            <span className="hidden md:inline">Center Person</span>
          </button>

          {/* Reset View (Section 2 Requirement) */}
          <button
            onClick={resetView}
            className="p-2 rounded-xl hover:bg-white/10 text-stone-200 hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
            title="Reset View to Full Family Tree & Patriarch"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset View</span>
          </button>
        </div>

        {/* Floating Top-Right Controls Toolbar: Full Screen & Lineage Badge (Section 3 Requirement) */}
        <div className="canvas-interactive-element absolute top-4 right-4 z-30 flex items-center gap-2">
          {/* Section 3: Prominent Full Screen / Exit Full Screen Control */}
          <button
            onClick={toggleFullScreen}
            aria-label={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            title={isFullScreen ? "Exit Full Screen (Esc)" : "Enter Full Screen"}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-md shadow-xl text-xs font-bold transition-all cursor-pointer border ${
              isFullScreen
                ? 'bg-amber-400 text-amber-950 border-amber-300 hover:bg-amber-300 ring-2 ring-amber-400/50'
                : 'bg-stone-900/90 text-[#E0FFC2] border-white/15 hover:bg-stone-800 hover:text-white'
            }`}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>

          {/* Floating Focused Person Badge */}
          <div className="hidden lg:flex items-center gap-2.5 p-2 pr-3.5 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl text-white">
            <div className="w-7 h-7 rounded-lg bg-[#064734] text-[#E0FFC2] font-bold text-xs flex items-center justify-center border border-[#E0FFC2]/30">
              L{focusedPerson.generationLevel}
            </div>
            <div className="text-left">
              <span className="text-[9px] text-stone-400 uppercase tracking-wider block font-semibold">
                {viewMode === 'full_tree' ? 'Active Focus' : 'Lineage Focus'}
              </span>
              <span className="text-xs font-bold text-white block truncate max-w-[150px]">
                {focusedPerson.fullName}
              </span>
            </div>
          </div>
        </div>

        {/* 3. DYNAMIC SVG & DOM CANVAS LAYER (Transforms with Pan & Zoom) */}
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-75 pointer-events-auto"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {/* MANDATORY STRAIGHT-LINE 90° ORTHOGONAL CONNECTORS */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              width: layout.bounds.width + 1000,
              height: layout.bounds.height + 1000,
              overflow: 'visible'
            }}
          >
            {layout.connections.map((conn) => {
              // Strict Orthogonal Layout: Vertical drop from parent, horizontal across, vertical drop to child
              const pathD = `M ${conn.startX} ${conn.startY} V ${conn.midY} H ${conn.endX} V ${conn.endY}`;

              return (
                <g key={conn.id}>
                  {conn.isDirectLineage && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#E0FFC2"
                      strokeWidth={5}
                      strokeOpacity={0.25}
                    />
                  )}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      conn.isPending 
                        ? '#fbbf24' 
                        : conn.isDirectLineage 
                        ? '#E0FFC2' 
                        : '#6b7280'
                    }
                    strokeWidth={conn.isDirectLineage ? 2.5 : 1.5}
                    strokeDasharray={conn.isPending ? '6 3' : 'none'}
                  />
                  {/* Square orthogonal connector joint indicator */}
                  <rect
                    x={conn.endX - 2.5}
                    y={conn.endY - 2.5}
                    width={5}
                    height={5}
                    fill={conn.isPending ? '#fbbf24' : conn.isDirectLineage ? '#E0FFC2' : '#9ca3af'}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Person Node Cards */}
          {layout.nodes.map((node) => {
            const isSelected = node.person.id === selectedPersonId;
            const isFocused = node.person.id === focusedPersonId;
            const isPending = node.isPendingVerification || node.person.verificationStatus === 'pending_approval';
            const cycleState = nodeClickCycles[node.person.id] || 0;

            const isDirectAncestor = directAncestorIds.has(node.person.id) && node.person.id !== focusedPerson.id;
            const isCollateral = node.isSiblingCollateral;
            const isFocusedPerson = node.person.id === focusedPerson.id;

            let cycleStatusLabel = 'Click to explore';
            let footerStatusText = 'Click to explore';

            if (isDirectAncestor) {
              const isSibOpen = expandedSiblings.has(node.person.id);
              cycleStatusLabel = isSibOpen ? 'Click to hide ancestor siblings' : 'Click to explore ancestor siblings';
              footerStatusText = isSibOpen ? 'Siblings open' : 'Click for siblings';
            } else if (isCollateral) {
              const isDescOpen = expandedDescendants.has(node.person.id);
              if (node.hasChildren) {
                cycleStatusLabel = isDescOpen ? 'Click to hide collateral descendants' : `Click to explore ${node.childrenCount} descendants`;
                footerStatusText = isDescOpen ? 'Descendants open' : `+${node.childrenCount} descendants`;
              } else {
                cycleStatusLabel = 'No descendants recorded';
                footerStatusText = 'No descendants';
              }
            } else if (isFocusedPerson) {
              if (node.hasChildren) {
                if (cycleState === 1) {
                  cycleStatusLabel = 'Click 1/4: Siblings + Descendants shown';
                  footerStatusText = 'Siblings + Descendants';
                } else if (cycleState === 2) {
                  cycleStatusLabel = 'Click 2/4: Siblings only shown';
                  footerStatusText = 'Siblings only';
                } else if (cycleState === 3) {
                  cycleStatusLabel = 'Click 3/4: Descendants only shown';
                  footerStatusText = 'Descendants only';
                } else {
                  cycleStatusLabel = 'Click 4/4: Hidden (Click to cycle)';
                  footerStatusText = 'Click to cycle';
                }
              } else {
                if (cycleState === 1) {
                  cycleStatusLabel = 'Click 1/2: Siblings shown';
                  footerStatusText = 'Siblings open';
                } else {
                  cycleStatusLabel = 'Click 2/2: Hidden (Click to show siblings)';
                  footerStatusText = 'Click for siblings';
                }
              }
            } else {
              footerStatusText = cycleState > 0 ? `State ${cycleState}` : 'Click to select';
            }

            return (
              <div
                key={node.id}
                onClick={(e) => handleNodeClick(node.person, e)}
                className={`canvas-interactive-element absolute rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg select-none ${
                  // MANDATORY YELLOW BORDER FOR PENDING APPROVAL NODES
                  isPending
                    ? 'border-4 border-amber-400 bg-amber-950/80 text-amber-100 ring-4 ring-amber-400/50 shadow-2xl shadow-amber-500/30'
                    : isFocused
                    ? 'bg-gradient-to-br from-[#064734] via-[#053d2c] to-[#043124] text-white border-2 border-[#E0FFC2] ring-4 ring-[#E0FFC2]/40 shadow-2xl scale-105 z-20'
                    : isSelected
                    ? 'bg-stone-800 text-white border-2 border-[#E0FFC2] shadow-xl ring-2 ring-[#E0FFC2]/30 z-10'
                    : node.isInDirectLineage
                    ? 'bg-stone-800/95 text-stone-100 border-2 border-[#064734] hover:border-[#E0FFC2] hover:bg-stone-800'
                    : 'bg-stone-900/90 text-stone-300 border border-stone-700 hover:border-stone-500 hover:bg-stone-800'
                }`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height
                }}
                title={cycleStatusLabel}
              >
                {/* Node Card Header Strip */}
                <div className={`px-3 py-1 text-[10px] font-bold flex items-center justify-between border-b ${
                  isPending
                    ? 'bg-amber-400 text-amber-950 border-amber-500 font-extrabold uppercase'
                    : isFocused
                    ? 'bg-[#043124] border-[#E0FFC2]/30 text-[#E0FFC2]'
                    : isSelected
                    ? 'bg-stone-700 border-stone-600 text-[#E0FFC2]'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400'
                }`}>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] uppercase font-bold ${
                      isPending
                        ? 'bg-amber-950 text-amber-300'
                        : node.generationLevel === 0
                        ? 'bg-[#E0FFC2] text-[#064734]'
                        : 'bg-white/10 text-stone-200'
                    }`}>
                      Level {node.generationLevel}
                    </span>
                    <span className="truncate max-w-[110px] text-[10px]">
                      {isPending 
                        ? 'Pending Verification' 
                        : getRelationshipToFocused(node.person, focusedPerson)}
                    </span>
                  </div>

                  {isPending ? (
                    <span className="text-[9px] bg-amber-900 text-amber-200 px-1 rounded uppercase font-bold">
                      Pending
                    </span>
                  ) : node.person.verificationStatus === 'verified_audit_record' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#E0FFC2] shrink-0" />
                  ) : null}
                </div>

                {/* Node Body */}
                <div className="p-3">
                  <h4 className={`text-xs sm:text-sm font-bold font-sans truncate ${
                    isPending ? 'text-amber-100 font-mono' : isFocused ? 'text-white' : 'text-stone-100'
                  }`}>
                    {node.person.fullName}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 mt-0.5">
                    <span className="truncate max-w-[130px]">
                      {node.person.branchName.replace(' Family', '')}
                    </span>
                    {node.person.birthOrder && (
                      <span className="text-[10px] text-stone-300 font-mono">
                        #{node.person.birthOrder} born
                      </span>
                    )}
                  </div>
                </div>

                {/* Node Expansion Action Footer */}
                <div className={`px-2 py-1 text-[10px] flex items-center justify-between border-t ${
                  isPending
                    ? 'bg-amber-950/90 border-amber-400/40 text-amber-300'
                    : isFocused
                    ? 'bg-[#043124]/90 border-white/10'
                    : 'bg-stone-950/80 border-stone-800 text-stone-400'
                }`}>
                  {/* Status Indicator */}
                  <span className="text-[9px] font-mono text-stone-400 truncate max-w-[130px]">
                    {footerStatusText}
                  </span>

                  {/* Add Descendants Action Button for nodes without descendants */}
                  {!node.hasChildren ? (
                    <button
                      type="button"
                      onClick={(e) => openAddDescendantsModal(node.person, e)}
                      className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                      title="Add proposed descendants to census"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>+ ADD DESCENDANTS</span>
                    </button>
                  ) : (
                    <span className="text-[9px] text-[#E0FFC2] font-semibold">
                      {node.childrenExpanded ? 'Descendants open' : `+${node.childrenCount} descendants`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. DOCKED PROFILE PREVIEW & ACTION PANEL (Bottom Left) */}
        {selectedPerson && (
          <div className="canvas-interactive-element absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-30 bg-stone-900/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-4 text-white animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/15">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                    selectedPerson.verificationStatus === 'pending_approval'
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-[#E0FFC2] text-[#064734]'
                  }`}>
                    Level {selectedPerson.generationLevel}
                  </span>
                  <span className="text-xs text-stone-300 font-semibold">
                    {getRelationshipToFocused(selectedPerson, focusedPerson)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1 font-sans">
                  {selectedPerson.fullName}
                </h3>
                <p className="text-xs text-[#E0FFC2] mt-0.5">
                  {selectedPerson.branchName}
                </p>
              </div>

              <button
                onClick={() => setSelectedPersonId(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verification Status Warning if Pending */}
            {selectedPerson.verificationStatus === 'pending_approval' && (
              <div className="my-2 p-2.5 rounded-xl bg-amber-500/20 border-2 border-amber-400 text-xs text-amber-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Pending Verification: Submitted by community, awaiting council approval.</span>
              </div>
            )}

            {/* Quick Context & Location */}
            <div className="py-2 text-xs text-stone-300 space-y-1">
              {selectedPerson.birthOrder && (
                <div className="text-stone-300 text-[11px]">
                  Birth Order: #{selectedPerson.birthOrder} born ({selectedPerson.birthOrderStatus || 'provisional'})
                </div>
              )}
              {selectedPerson.location && (
                <div className="text-stone-400 text-[11px]">
                  Location: {selectedPerson.location}
                </div>
              )}
              {selectedPerson.note && (
                <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                  {selectedPerson.note[currentLanguage]}
                </p>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="pt-2 border-t border-white/15 flex flex-wrap items-center gap-2">
              {/* Focus Direct Lineage on this person */}
              <button
                onClick={() => focusOnPersonDirectLineage(selectedPerson.id)}
                className="px-3 py-1.5 rounded-xl bg-[#064734] hover:bg-[#0a5841] text-[#E0FFC2] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                title="Isolate direct lineage to NYANGE RADJABU"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Focus Direct Lineage</span>
              </button>

              {/* Add Descendants Action Button */}
              <button
                onClick={() => openAddDescendantsModal(selectedPerson)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Descendants</span>
              </button>

              {/* View in Detailed Page */}
              {onSelectPersonForDetail && (
                <button
                  onClick={() => onSelectPersonForDetail(selectedPerson)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-semibold cursor-pointer ml-auto flex items-center gap-1"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 5. CANVAS NAVIGATION INSTRUCTIONS HINT (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-xs rounded-xl border border-white/10 text-[11px] text-stone-400 pointer-events-none">
          <span>{viewMode === 'full_tree' ? 'Full Family Tree (Levels 0–2)' : 'Direct Lineage Mode'}</span>
          <span>·</span>
          <span>Straight 90° lines</span>
          <span>·</span>
          <span>Drag to pan · Wheel to zoom</span>
        </div>
      </div>

      {/* ADD DESCENDANTS CONTRIBUTION MODAL */}
      {personToAddDescendants && (
        <AddDescendantsModal
          isOpen={isAddDescendantsOpen}
          onClose={() => {
            setIsAddDescendantsOpen(false);
            setPersonToAddDescendants(null);
          }}
          parentPerson={personToAddDescendants}
          currentLanguage={currentLanguage}
          onSubmissionSuccess={() => {
            setDataVersion((v) => v + 1);
            if (personToAddDescendants) {
              setExpandedDescendants((prev) => new Set(prev).add(personToAddDescendants.id));
            }
          }}
        />
      )}

      {/* ADMIN REVIEW MODAL */}
      <AdminReviewModal
        isOpen={isAdminReviewOpen}
        onClose={() => setIsAdminReviewOpen(false)}
        currentLanguage={currentLanguage}
        onSubmissionsUpdated={() => {
          setDataVersion((v) => v + 1);
        }}
      />
    </div>
  );
};
