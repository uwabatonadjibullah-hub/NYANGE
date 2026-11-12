import React, { useState, useEffect } from 'react';
import { 
  Language, 
  FamilyBranch, 
  FamilyMember, 
  DescendantNode, 
  GrandchildRecord, 
  GenealogyPerson 
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  PATRIARCH_INFO, 
  FAMILY_BRANCHES, 
  ALL_GRANDCHILDREN,
  getBranchById,
  getGrandchildById,
  UNRECORDED_BRANCHES_NOTE,
  REPORTED_TOTAL_15_PLUS,
  REPORTED_SECTIONS_COUNT,
  TOTAL_GRANDCHILDREN_COUNT,
  PENDING_FAMILIES_COUNT,
  DESCENDANT_TREE_ROOT
} from '../data/familyData';
import { 
  searchGenealogyPersons, 
  getPersonById, 
  getAllGenealogyPersons, 
  ROOT_PATRIARCH_ID 
} from '../data/genealogyDatabase';
import { LineageGateNode } from '../components/LineageGateNode';
import { FamilyBranchView } from '../components/FamilyBranchView';
import { GrandchildFamilyView } from '../components/GrandchildFamilyView';
import { DynamicFamilyTreeCanvas } from '../components/DynamicFamilyTreeCanvas';
import { 
  Search, 
  SlidersHorizontal, 
  GitFork, 
  Layers, 
  User, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShieldCheck, 
  MapPin, 
  X,
  ExternalLink,
  Info,
  DoorOpen,
  Users,
  Sparkles,
  Compass,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface FamilyTreePageProps {
  currentLanguage: Language;
  onOpenRecordMe: () => void;
  onOpenRecordMeForGrandchild?: (grandchild: GrandchildRecord) => void;
  initialBranchId?: string | null;
  initialGrandchildId?: string | null;
}

export const FamilyTreePage: React.FC<FamilyTreePageProps> = ({
  currentLanguage,
  onOpenRecordMe,
  onOpenRecordMeForGrandchild,
  initialBranchId = null,
  initialGrandchildId = null
}) => {
  const t = TRANSLATIONS[currentLanguage];

  // Deep Navigation State
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(initialBranchId);
  const [selectedGrandchildId, setSelectedGrandchildId] = useState<string | null>(initialGrandchildId);

  // Tab state within the main family tree view: 'canvas' (Dynamic bidirectional tree), 'gates' (Heritage Gate explorer), 'directory' (Searchable list)
  const [activeTab, setActiveTab] = useState<'canvas' | 'gates' | 'directory'>('canvas');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'branches' | 'grandchildren' | 'all_members'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [selectedGenFilter, setSelectedGenFilter] = useState<string>('all');
  const [canvasFocusPersonId, setCanvasFocusPersonId] = useState<string>(ROOT_PATRIARCH_ID);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Drawer modal for patriarch, branch or individual
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<{
    type: 'patriarch' | 'branch' | 'grandchild' | 'person';
    data?: FamilyBranch | FamilyMember | GrandchildRecord | GenealogyPerson;
  } | null>(null);

  // Synchronize with URL Query parameters on mount & popstate
  useEffect(() => {
    const parseUrlParams = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const b = params.get('branch');
        const gc = params.get('grandchild');
        const person = params.get('person');
        const tab = params.get('tab');

        if (tab && ['canvas', 'gates', 'directory'].includes(tab)) {
          setActiveTab(tab as 'canvas' | 'gates' | 'directory');
        }

        if (person) {
          setCanvasFocusPersonId(person);
          setActiveTab('canvas');
        }

        if (gc) {
          setSelectedGrandchildId(gc);
          const gcObj = getGrandchildById(gc);
          if (gcObj) {
            setSelectedBranchId(gcObj.branchId);
          } else if (b) {
            setSelectedBranchId(b);
          }
        } else if (b) {
          setSelectedBranchId(b);
          setSelectedGrandchildId(null);
        } else {
          if (initialBranchId) {
            setSelectedBranchId(initialBranchId);
          }
          if (initialGrandchildId) {
            setSelectedGrandchildId(initialGrandchildId);
          }
        }
      } catch {
        // Fallback for sandboxed environments
      }
    };

    parseUrlParams();

    const handlePopState = () => {
      parseUrlParams();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialBranchId, initialGrandchildId]);

  // Navigation handlers with URL update
  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    setSelectedGrandchildId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'family-tree');
      url.searchParams.set('branch', branchId);
      url.searchParams.delete('grandchild');
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectGrandchild = (grandchild: GrandchildRecord) => {
    setSelectedBranchId(grandchild.branchId);
    setSelectedGrandchildId(grandchild.id);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'family-tree');
      url.searchParams.set('branch', grandchild.branchId);
      url.searchParams.set('grandchild', grandchild.id);
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBranch = () => {
    setSelectedGrandchildId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'family-tree');
      if (selectedBranchId) {
        url.searchParams.set('branch', selectedBranchId);
      }
      url.searchParams.delete('grandchild');
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTree = () => {
    setSelectedBranchId(null);
    setSelectedGrandchildId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'family-tree');
      url.searchParams.delete('branch');
      url.searchParams.delete('grandchild');
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPersonInCanvas = (personId: string) => {
    setCanvasFocusPersonId(personId);
    setActiveTab('canvas');
    setSelectedBranchId(null);
    setSelectedGrandchildId(null);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  // 1. RENDER GRANDCHILD FAMILY VIEW IF A GRANDCHILD IS SELECTED
  if (selectedGrandchildId) {
    const currentGrandchild = getGrandchildById(selectedGrandchildId);
    const parentBranch = currentGrandchild ? getBranchById(currentGrandchild.branchId) : null;

    if (currentGrandchild && parentBranch) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GrandchildFamilyView
            branch={parentBranch}
            grandchild={currentGrandchild}
            currentLanguage={currentLanguage}
            onBackToBranch={handleBackToBranch}
            onBackToTree={handleBackToTree}
            onSelectGrandchild={handleSelectGrandchild}
            onOpenInCanvas={handleOpenPersonInCanvas}
            onOpenRecordMeForGrandchild={(gc) => {
              if (onOpenRecordMeForGrandchild) {
                onOpenRecordMeForGrandchild(gc);
              } else {
                onOpenRecordMe();
              }
            }}
          />
        </div>
      );
    }
  }

  // 2. RENDER FAMILY BRANCH VIEW IF A BRANCH IS SELECTED
  if (selectedBranchId) {
    const currentBranch = getBranchById(selectedBranchId);
    if (currentBranch) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FamilyBranchView
            branch={currentBranch}
            currentLanguage={currentLanguage}
            onBackToTree={handleBackToTree}
            onSelectGrandchild={handleSelectGrandchild}
            onOpenInCanvas={handleOpenPersonInCanvas}
            onOpenRecordMe={onOpenRecordMe}
          />
        </div>
      );
    }
  }

  // 3. RENDER MAIN ROOT FAMILY TREE VIEW
  const filteredBranches = FAMILY_BRANCHES.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.summary[currentLanguage].toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch =
      selectedBranchFilter === 'all' || branch.id === selectedBranchFilter;

    return matchesSearch && matchesBranch;
  });

  const filteredGrandchildren = ALL_GRANDCHILDREN.filter((gc) => {
    const matchesSearch =
      gc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gc.branchName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch =
      selectedBranchFilter === 'all' || gc.branchId === selectedBranchFilter;

    return matchesSearch && matchesBranch;
  });

  const allFilteredMembers = searchGenealogyPersons(searchQuery, selectedBranchFilter, selectedGenFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#064734] mb-1">
            <GitFork className="w-4 h-4" />
            <span>Official Genealogical Registry · Miaka 15+</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            {t.treePageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {t.treePageSubtitle}
          </p>
        </div>

        {/* View Switcher Tabs: Dynamic Canvas, Heritage Gates, Directory */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200 self-start md:self-auto shadow-xs">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'canvas'
                ? 'bg-[#064734] text-[#E0FFC2] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Dynamic Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab('gates')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'gates'
                ? 'bg-white text-[#064734] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Heritage Gates</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-white text-[#064734] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Searchable Directory</span>
          </button>
        </div>
      </div>

      {/* QUICK BRANCH SELECTOR STRIP */}
      <div className="bg-[#064734]/5 border border-[#064734]/15 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-[#064734] uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>Dedicated Family Branch Portals (8 Documented Sections)</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-stone-500 font-mono">
              {TOTAL_GRANDCHILDREN_COUNT} Grandchildren · {REPORTED_TOTAL_15_PLUS} Audited (15+)
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {FAMILY_BRANCHES.map((b) => (
            <button
              key={b.id}
              onClick={() => handleSelectBranch(b.id)}
              className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-[#064734] hover:shadow-sm text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <span className="text-[10px] font-mono font-bold text-stone-400 group-hover:text-[#064734]">
                {b.code}
              </span>
              <span className="text-xs font-bold text-stone-900 group-hover:text-[#064734] line-clamp-1 mt-1">
                {b.name.replace(' Family', '')}
              </span>
              <div className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between text-[10px]">
                <span className="text-stone-500">{b.grandchildrenCount} gc</span>
                <span className="font-bold text-[#064734] bg-[#E0FFC2] px-1.5 py-0.2 rounded">
                  {b.reportedCount15Plus}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* VIEW A: DYNAMIC BIDIRECTIONAL FAMILY TREE CANVAS */}
      {activeTab === 'canvas' && (
        <div className="space-y-6">
          <DynamicFamilyTreeCanvas
            currentLanguage={currentLanguage}
            initialPersonId={canvasFocusPersonId}
            onSelectPersonForDetail={(person) => {
              if (person.generationLevel === 1) {
                const branch = getBranchById(person.branchId);
                if (branch) handleSelectBranch(branch.id);
              } else if (person.generationLevel === 2) {
                const gc = getGrandchildById(person.id);
                if (gc) handleSelectGrandchild(gc);
              } else {
                setSelectedDrawerItem({
                  type: 'person',
                  data: person
                });
              }
            }}
            onOpenRecordMe={onOpenRecordMe}
          />
        </div>
      )}

      {/* VIEW B: INTERACTIVE VISUAL GENEALOGY TREE WITH HERITAGE GATES */}
      {activeTab === 'gates' && (
        <div className="space-y-6">
          {/* Gate Explorer Instructions Header */}
          <div className="p-4 bg-[#E0FFC2]/40 rounded-2xl border border-[#064734]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#064734] text-[#E0FFC2]">
                <DoorOpen className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-[#064734] block">
                  Cascading Heritage Gate Lineage Explorer
                </span>
                <span className="text-stone-600 text-[11px]">
                  Click on any descendant gate to open their lineage and reveal consecutive generations down to terminal leaves.
                </span>
              </div>
            </div>
          </div>

          {/* Continuous Heritage Gate Canvas */}
          <div className="bg-stone-50/90 rounded-3xl p-4 sm:p-8 border border-stone-200 overflow-x-auto min-h-[550px] shadow-inner relative">
            <div
              className="transition-transform duration-200 origin-top-left mx-auto min-w-[700px] flex flex-col items-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* THE MASTER CONTINUOUS GATE EXPLORER ROOT */}
              <div className="w-full flex flex-col items-center">
                <LineageGateNode
                  node={
                    selectedBranchFilter === 'all'
                      ? DESCENDANT_TREE_ROOT
                      : {
                          ...DESCENDANT_TREE_ROOT,
                          children: DESCENDANT_TREE_ROOT.children?.filter(
                            (c) => c.branchId === selectedBranchFilter
                          )
                        }
                  }
                  currentLanguage={currentLanguage}
                  onSelectNode={(selectedNode) => {
                    if (selectedNode.generationLevel === 0) {
                      setSelectedDrawerItem({
                        type: 'patriarch',
                        data: PATRIARCH_INFO
                      });
                    } else if (selectedNode.generationLevel === 1) {
                      const branch = getBranchById(selectedNode.branchId);
                      if (branch) {
                        handleSelectBranch(branch.id);
                      }
                    }
                  }}
                  onOpenRecordMe={onOpenRecordMe}
                  depth={0}
                  initiallyOpen={true}
                />
              </div>

              {/* THE 7 PENDING UNRECORDED BRANCHES NODE */}
              <div className="w-full max-w-xl mt-12 p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-stone-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        {PENDING_FAMILIES_COUNT} Branches Awaiting Census Submission
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {UNRECORDED_BRANCHES_NOTE[currentLanguage]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenRecordMe}
                    className="shrink-0 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer border border-black shadow-sm"
                  >
                    {t.ctaRecordButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: SEARCHABLE DIRECTORY LIST (BRANCHES, GRANDCHILDREN, CONSECUTIVE MEMBERS) */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* FILTER & SEARCH BAR */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative grow">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any family member (e.g. Nadjibullah, Uwabato, Bizimungu, Rehema, Juma)..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-[#064734] bg-stone-50 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-stone-200 rounded-lg bg-white text-stone-700 focus:outline-hidden focus:border-[#064734]"
              >
                <option value="all">{t.treeFilterAllBranches}</option>
                {FAMILY_BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.reportedCount15Plus})
                  </option>
                ))}
              </select>

              <select
                value={selectedGenFilter}
                onChange={(e) => setSelectedGenFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-stone-200 rounded-lg bg-white text-stone-700 focus:outline-hidden focus:border-[#064734]"
              >
                <option value="all">All Documented Generations (L0–L2)</option>
                <option value="0">Level 0 (Patriarch)</option>
                <option value="1">Level 1 (Sons & Daughters)</option>
                <option value="2">Level 2 (Grandchildren)</option>
                <option value="3">Level 3 (Community Proposed)</option>
              </select>
            </div>
          </div>

          {/* Sub-filter tabs for directory */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDirectoryFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                  directoryFilter === 'all'
                    ? 'bg-[#064734] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Records ({allFilteredMembers.length})
              </button>
              <button
                onClick={() => setDirectoryFilter('branches')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                  directoryFilter === 'branches'
                    ? 'bg-[#064734] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Level 1 Branches ({filteredBranches.length})
              </button>
              <button
                onClick={() => setDirectoryFilter('grandchildren')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                  directoryFilter === 'grandchildren'
                    ? 'bg-[#064734] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Level 2 Grandchildren ({filteredGrandchildren.length})
              </button>
            </div>

            <div className="text-xs text-stone-500 font-mono">
              Audited Total: {REPORTED_TOTAL_15_PLUS} (15+)
            </div>
          </div>

          {/* Directory Content List */}
          <div className="space-y-6">
            {/* Full Relational Members Directory */}
            {directoryFilter === 'all' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#064734] uppercase tracking-wider">
                    All Family Records ({allFilteredMembers.length})
                  </span>
                  <span className="text-stone-400 text-[11px]">Click 'Explore in Canvas' to focus on any member</span>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden divide-y divide-stone-100">
                  {allFilteredMembers.map((person) => (
                    <div
                      key={person.id}
                      className="p-4 sm:p-5 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 font-mono text-xs font-bold text-stone-700 flex items-center justify-center shrink-0 group-hover:bg-[#064734] group-hover:text-white transition-colors">
                          L{person.generationLevel}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#064734] transition-colors">
                              {person.fullName}
                            </h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#064734] px-2 py-0.5 rounded">
                              Level {person.generationLevel}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-0.5">
                            <span>{person.branchName}</span>
                            {person.location && (
                              <>
                                <span>·</span>
                                <span>{person.location}</span>
                              </>
                            )}
                          </div>
                          {person.note && (
                            <p className="text-xs text-stone-600 mt-1 line-clamp-1">
                              {person.note[currentLanguage]}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        {person.reportedFamilyCount15Plus !== undefined && (
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#064734] tabular-nums block">
                              {person.reportedFamilyCount15Plus}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              (15+)
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => handleOpenPersonInCanvas(person.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#064734] text-[#E0FFC2] hover:bg-[#0a5841] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Explore in Canvas</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {allFilteredMembers.length === 0 && (
                    <div className="py-12 text-center text-xs text-stone-500">
                      No family records found matching your filters.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LEVEL 1 BRANCHES SECTION */}
            {directoryFilter === 'branches' && (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden divide-y divide-stone-100">
                  {filteredBranches.map((branch) => (
                    <div
                      key={branch.id}
                      onClick={() => handleSelectBranch(branch.id)}
                      className="p-4 sm:p-5 hover:bg-stone-50 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 font-mono text-xs font-bold text-stone-700 flex items-center justify-center shrink-0 group-hover:bg-[#064734] group-hover:text-white transition-colors">
                          {branch.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#064734] transition-colors">
                              {branch.name}
                            </h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#064734] px-2 py-0.5 rounded">
                              Level 1
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-0.5">
                            <span>{branch.grandchildrenCount} Grandchildren</span>
                            <span>·</span>
                            <span>{branch.primaryLocation}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#064734] tabular-nums block">
                            {branch.reportedCount15Plus}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {t.branchMembers15Plus}
                          </span>
                        </div>
                        <span className="px-3 py-1.5 rounded-lg bg-stone-100 group-hover:bg-[#064734] group-hover:text-[#E0FFC2] text-stone-700 text-xs font-bold transition-colors flex items-center gap-1">
                          <span>View Branch</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LEVEL 2 GRANDCHILDREN SECTION */}
            {directoryFilter === 'grandchildren' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredGrandchildren.map((gc) => (
                    <div
                      key={gc.id}
                      onClick={() => handleSelectGrandchild(gc)}
                      className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-[#064734] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-[10px] font-mono text-stone-400">
                            #{gc.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold text-[#064734] bg-[#E0FFC2] px-2 py-0.5 rounded">
                            Level 2
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#064734] transition-colors leading-snug">
                          {gc.fullName}
                        </h4>

                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                          {gc.branchName}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        {gc.reportedFamilyCount15Plus !== undefined ? (
                          <span className="text-[11px] font-bold text-[#064734] bg-[#E0FFC2]/50 px-2 py-0.5 rounded">
                            {gc.reportedFamilyCount15Plus} (15+)
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">
                            Unlisted
                          </span>
                        )}

                        <span className="text-xs font-semibold text-[#064734] group-hover:underline flex items-center gap-0.5">
                          <span>View Lineage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSPECTION DETAIL DRAWER / MODAL */}
      {selectedDrawerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setSelectedDrawerItem(null)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 z-10 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#064734]">
                  {selectedDrawerItem.type === 'patriarch'
                    ? 'Level 0 Lineage Foundation'
                    : selectedDrawerItem.type === 'person'
                    ? `Level ${(selectedDrawerItem.data as GenealogyPerson).generationLevel} Lineage Member`
                    : 'Level 1 Audited Family Section'}
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                  {selectedDrawerItem.type === 'patriarch'
                    ? PATRIARCH_INFO.fullName
                    : (selectedDrawerItem.data as any).fullName || (selectedDrawerItem.data as any).name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDrawerItem(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content for Person */}
            {selectedDrawerItem.type === 'person' && (
              <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
                {(() => {
                  const p = selectedDrawerItem.data as GenealogyPerson;
                  return (
                    <>
                      <div className="p-4 rounded-xl bg-[#064734]/5 border border-[#064734]/15 space-y-2">
                        <span className="text-[11px] font-bold text-[#064734] uppercase tracking-wider block">
                          Lineage & Historical Notes
                        </span>
                        <p>{p.note?.[currentLanguage] || p.biography?.[currentLanguage]}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-stone-50 rounded-lg">
                          <span className="text-stone-500 block text-[10px] uppercase">Generational Role</span>
                          <span className="font-bold text-stone-800">Level {p.generationLevel}</span>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg">
                          <span className="text-stone-500 block text-[10px] uppercase">Family Branch</span>
                          <span className="font-bold text-stone-800 truncate block">{p.branchName}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedDrawerItem(null);
                            handleOpenPersonInCanvas(p.id);
                          }}
                          className="px-4 py-2 bg-[#064734] hover:bg-[#0a5841] text-[#E0FFC2] font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                        >
                          <Compass className="w-4 h-4" />
                          <span>Focus in Dynamic Canvas</span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Footer Action */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-200">
              <button
                onClick={() => {
                  setSelectedDrawerItem(null);
                  onOpenRecordMe();
                }}
                className="text-xs font-bold text-[#064734] hover:underline cursor-pointer"
              >
                Submit correction or add descendant &rarr;
              </button>
              <button
                onClick={() => setSelectedDrawerItem(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                {t.galleryClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
