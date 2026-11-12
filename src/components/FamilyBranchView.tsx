import React, { useState } from 'react';
import { FamilyBranch, GrandchildRecord, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  GitFork, 
  Info,
  Sparkles,
  X,
  UserCheck
} from 'lucide-react';

interface FamilyBranchViewProps {
  branch: FamilyBranch;
  currentLanguage: Language;
  onBackToTree: () => void;
  onSelectGrandchild: (grandchild: GrandchildRecord) => void;
  onOpenRecordMe: () => void;
  onOpenInCanvas?: (branchId: string) => void;
}

export const FamilyBranchView: React.FC<FamilyBranchViewProps> = ({
  branch,
  currentLanguage,
  onBackToTree,
  onSelectGrandchild,
  onOpenRecordMe,
  onOpenInCanvas
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGrandchildren = branch.grandchildren.filter((gc) =>
    gc.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. PERSISTENT LINEAGE BREADCRUMB */}
      <nav aria-label="Lineage Breadcrumb" className="text-xs text-stone-500 flex flex-wrap items-center gap-1.5 font-medium">
        <button
          onClick={onBackToTree}
          className="hover:text-[#064734] transition-colors cursor-pointer"
        >
          {t.navHome}
        </button>
        <span>&gt;</span>
        <button
          onClick={onBackToTree}
          className="hover:text-[#064734] transition-colors cursor-pointer"
        >
          {t.navFamilyTree}
        </button>
        <span>&gt;</span>
        <button
          onClick={onBackToTree}
          className="hover:text-[#064734] transition-colors cursor-pointer font-semibold text-stone-700"
        >
          NYANGE RADJABU (Level 0)
        </button>
        <span>&gt;</span>
        <span className="font-bold text-[#064734] bg-[#E0FFC2]/50 px-2 py-0.5 rounded">
          {branch.name} (Level 1)
        </span>
      </nav>

      {/* 2. BACK ACTION & BRANCH HERO HEADER */}
      <div className="bg-gradient-to-br from-[#064734] via-[#053d2c] to-[#043124] text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#064734]/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onBackToTree}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer w-fit border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Family Tree</span>
            </button>
            {onOpenInCanvas && (
              <button
                onClick={() => onOpenInCanvas(branch.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E0FFC2] text-[#064734] hover:bg-[#cbf4a4] text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <span>Explore in Canvas &rarr;</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#E0FFC2] text-[#064734] font-bold">
              Level 1 Family Section
            </span>
            <span className="text-xs text-stone-300 font-mono">
              {branch.code}
            </span>
          </div>
        </div>

        {/* Branch Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {branch.name}
          </h1>
          <p className="text-sm sm:text-base text-[#E0FFC2] font-medium">
            Descendants of NYANGE RADJABU · Official Branch Record
          </p>
        </div>

        {/* 4. VISUAL ANCESTOR LINEAGE BANNER */}
        <div className="p-4 rounded-2xl bg-black/25 border border-white/15 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-stone-300 font-medium">Direct Lineage Path:</span>
          <div className="flex items-center gap-2 font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-[#064734] border border-[#E0FFC2]/40 text-[#E0FFC2]">
              NYANGE RADJABU (Level 0 Patriarch)
            </span>
            <span className="text-[#E0FFC2]">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#E0FFC2] text-[#064734]">
              {branch.name} (Level 1)
            </span>
            <span className="text-[#E0FFC2]">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/15 text-stone-200">
              {branch.grandchildrenCount} Grandchildren (Level 2)
            </span>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-white/10 border border-white/15">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-300 block">
              Reported Branch Total (15+)
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#E0FFC2] tabular-nums">
              {branch.reportedCount15Plus}
            </span>
            <span className="text-[11px] text-stone-300 block mt-0.5">
              Audited family members 15+
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/15">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-300 block">
              Registered Grandchildren
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
              {branch.grandchildrenCount}
            </span>
            <span className="text-[11px] text-stone-300 block mt-0.5">
              Named Level 2 records in report
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/15">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-300 block">
              Document Reference
            </span>
            <span className="text-sm font-bold text-white block mt-1 truncate">
              {branch.sourceDocumentRef}
            </span>
            <span className="text-[11px] text-stone-300 block mt-0.5">
              {branch.primaryLocation}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed pt-2 border-t border-white/15">
          {branch.summary[currentLanguage]}
        </p>
      </div>

      {/* 5. GRANDCHILDREN SECTION & SEARCH */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#064734] mb-1">
              <Users className="w-4 h-4" />
              <span>Generational Registry · Level 2</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
              Grandchildren of Nyange Radjabu ({branch.grandchildrenCount})
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Organized directly under the family section of {branch.name}. Click on any grandchild to explore their family lineage and consecutive descendants.
            </p>
          </div>

          {/* Search within this branch */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grandchildren in branch..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#064734] bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Statistical Note */}
        <div className="p-4 rounded-2xl bg-[#E0FFC2]/30 border border-[#064734]/20 flex items-start gap-3 text-xs text-stone-700 leading-relaxed">
          <Info className="w-4 h-4 text-[#064734] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#064734]">Audit Statistical Interpretation: </span>
            <span>
              The number beside each grandchild represents recorded members aged 15+ within that grandchild's household unit according to the preliminary audit report. Individual Level 3 descendants are recorded progressively during the ongoing census.
            </span>
          </div>
        </div>

        {/* 6. GRANDCHILDREN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGrandchildren.map((gc) => (
            <div
              key={gc.id}
              onClick={() => onSelectGrandchild(gc)}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-[#064734] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-mono text-[10px] font-semibold text-stone-400">
                    Row #{gc.orderNumber}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#064734] text-[#E0FFC2] px-2 py-0.5 rounded">
                    Level 2 Grandchild
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 group-hover:text-[#064734] transition-colors leading-snug">
                  {gc.fullName}
                </h3>

                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    Reported family count:
                  </span>
                  {gc.reportedFamilyCount15Plus !== undefined ? (
                    <span className="text-sm font-bold text-[#064734] tabular-nums bg-[#E0FFC2]/50 px-2 py-0.5 rounded">
                      {gc.reportedFamilyCount15Plus} (15+)
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-stone-400 italic">
                      Unavailable in report
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-stone-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Audit Record</span>
                </span>
                <span className="font-bold text-[#064734] group-hover:underline flex items-center gap-0.5">
                  <span>View Family</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredGrandchildren.length === 0 && (
          <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
            No grandchildren found matching "{searchQuery}" in this branch.
          </div>
        )}

        {/* 9. EXPANDABLE AREA FOR FUTURE GENERATIONS & ACTION */}
        <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-stone-900">
              Are you or your parent part of the {branch.name}?
            </h4>
            <p className="text-xs text-stone-600">
              Descendants belonging to Level 3 (great-grandchildren) or Level 4 can submit their information to be registered under their respective grandchild lineage.
            </p>
          </div>
          <button
            onClick={onOpenRecordMe}
            className="shrink-0 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-black shadow-sm"
          >
            {t.ctaRecordButton}
          </button>
        </div>
      </div>
    </div>
  );
};
