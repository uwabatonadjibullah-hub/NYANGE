import React from 'react';
import { FamilyBranch, GrandchildRecord, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft,
  Users, 
  ShieldCheck, 
  FileText, 
  Info,
  Calendar,
  Sparkles,
  GitFork,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface GrandchildFamilyViewProps {
  branch: FamilyBranch;
  grandchild: GrandchildRecord;
  currentLanguage: Language;
  onBackToBranch: () => void;
  onBackToTree: () => void;
  onSelectGrandchild: (grandchild: GrandchildRecord) => void;
  onOpenRecordMeForGrandchild: (grandchild: GrandchildRecord) => void;
  onOpenInCanvas?: (grandchildId: string) => void;
}

export const GrandchildFamilyView: React.FC<GrandchildFamilyViewProps> = ({
  branch,
  grandchild,
  currentLanguage,
  onBackToBranch,
  onBackToTree,
  onSelectGrandchild,
  onOpenRecordMeForGrandchild,
  onOpenInCanvas
}) => {
  const t = TRANSLATIONS[currentLanguage];

  // Find previous and next sibling grandchildren within this branch
  const currentIndex = branch.grandchildren.findIndex((g) => g.id === grandchild.id);
  const prevGrandchild = currentIndex > 0 ? branch.grandchildren[currentIndex - 1] : null;
  const nextGrandchild = currentIndex < branch.grandchildren.length - 1 ? branch.grandchildren[currentIndex + 1] : null;

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
        <button
          onClick={onBackToBranch}
          className="hover:text-[#064734] transition-colors cursor-pointer font-semibold text-stone-700"
        >
          {branch.name} (Level 1)
        </button>
        <span>&gt;</span>
        <span className="font-bold text-[#064734] bg-[#E0FFC2] px-2 py-0.5 rounded">
          {grandchild.fullName} (Level 2)
        </span>
      </nav>

      {/* 2. GRANDCHILD HERO BANNER */}
      <div className="bg-gradient-to-br from-[#064734] via-[#053d2c] to-[#043124] text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#064734]/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onBackToBranch}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer w-fit border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {branch.name}</span>
            </button>
            {onOpenInCanvas && (
              <button
                onClick={() => onOpenInCanvas(grandchild.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E0FFC2] text-[#064734] hover:bg-[#cbf4a4] text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <span>Explore in Canvas &rarr;</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#E0FFC2] text-[#064734] font-bold">
              Level 2 Grandchild
            </span>
            <span className="text-xs text-stone-300 font-mono">
              Row #{grandchild.orderNumber} of {branch.grandchildrenCount}
            </span>
          </div>
        </div>

        {/* Grandchild Full Name & Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans">
            {grandchild.fullName}
          </h1>
          <p className="text-sm sm:text-base text-[#E0FFC2] font-medium">
            Grandchild of NYANGE RADJABU · Born to the family of {branch.name}
          </p>
        </div>

        {/* 3. VISUAL ANCESTOR LINEAGE PATH */}
        <div className="p-4 rounded-2xl bg-black/25 border border-white/15 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-stone-300 font-medium">Direct Lineage Path:</span>
          <div className="flex items-center gap-2 font-bold flex-wrap">
            <button
              onClick={onBackToTree}
              className="px-2.5 py-1 rounded-lg bg-[#064734] border border-[#E0FFC2]/40 text-[#E0FFC2] hover:bg-white/10 cursor-pointer transition-colors"
            >
              NYANGE RADJABU (L0)
            </button>
            <span className="text-[#E0FFC2]">&rarr;</span>
            <button
              onClick={onBackToBranch}
              className="px-2.5 py-1 rounded-lg bg-white/15 text-stone-200 hover:bg-white/25 cursor-pointer transition-colors"
            >
              {branch.name} (L1)
            </button>
            <span className="text-[#E0FFC2]">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#E0FFC2] text-[#064734]">
              {grandchild.fullName} (L2 Grandchild)
            </span>
            <span className="text-[#E0FFC2]">&rarr;</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-stone-300 italic">
              Level 3 Descendants
            </span>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-white/10 border border-white/15">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-300 block">
              Reported Family Count (15+)
            </span>
            {grandchild.reportedFamilyCount15Plus !== undefined ? (
              <span className="text-2xl sm:text-3xl font-bold text-[#E0FFC2] tabular-nums">
                {grandchild.reportedFamilyCount15Plus}
              </span>
            ) : (
              <span className="text-base font-bold text-stone-300 italic block mt-1">
                Unavailable in report
              </span>
            )}
            <span className="text-[11px] text-stone-300 block mt-0.5">
              Household members aged 15 and above
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/15">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-300 block">
              Parent Branch (Level 1)
            </span>
            <span className="text-base sm:text-lg font-bold text-white block mt-1 truncate">
              {branch.name}
            </span>
            <span className="text-[11px] text-stone-300 block mt-0.5">
              Code: {branch.code}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/15">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-300 block">
              Official Document Ref
            </span>
            <span className="text-xs font-bold text-white block mt-1 truncate">
              {branch.sourceDocumentRef}
            </span>
            <span className="text-[11px] text-stone-300 block mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E0FFC2]" />
              <span>Verified Audit Record</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. SIBLING GRANDCHILD NAVIGATION STRIP */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between gap-3 text-xs">
        {prevGrandchild ? (
          <button
            onClick={() => onSelectGrandchild(prevGrandchild)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-stone-700 hover:text-[#064734] hover:bg-stone-50 font-semibold transition-colors cursor-pointer border border-stone-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Grandchild:</span>
            <span className="font-bold text-[#064734] truncate max-w-[150px] sm:max-w-[200px]">
              {prevGrandchild.fullName}
            </span>
          </button>
        ) : (
          <div className="text-stone-400 text-xs italic px-3 py-2">
            First grandchild in this branch
          </div>
        )}

        <div className="text-center font-mono text-[11px] text-stone-500 hidden md:block">
          Grandchild {currentIndex + 1} of {branch.grandchildren.length} in {branch.name}
        </div>

        {nextGrandchild ? (
          <button
            onClick={() => onSelectGrandchild(nextGrandchild)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-stone-700 hover:text-[#064734] hover:bg-stone-50 font-semibold transition-colors cursor-pointer border border-stone-200"
          >
            <span className="hidden sm:inline">Next Grandchild:</span>
            <span className="font-bold text-[#064734] truncate max-w-[150px] sm:max-w-[200px]">
              {nextGrandchild.fullName}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-stone-400 text-xs italic px-3 py-2">
            Last grandchild in this branch
          </div>
        )}
      </div>

      {/* 5. AUDIT NOTE & STATISTICAL EXPLANATION */}
      <div className="p-5 rounded-2xl bg-[#E0FFC2]/30 border border-[#064734]/20 space-y-2 text-xs text-stone-700 leading-relaxed">
        <div className="flex items-center gap-2 text-[#064734] font-bold">
          <Info className="w-4 h-4" />
          <span>About the Reported Family Count:</span>
        </div>
        <p>
          The number recorded next to <strong>{grandchild.fullName}</strong> in the official audit report (
          {grandchild.reportedFamilyCount15Plus !== undefined ? (
            <span className="font-bold text-[#064734]">{grandchild.reportedFamilyCount15Plus}</span>
          ) : (
            'unavailable for Branch 8'
          )}
          ) represents the reported number of people aged 15 and above belonging to this family unit.
          This number reflects family statistics from the preliminary audit and is not a count of direct children. Individual Level 3 descendant records are collected progressively through the official census registration.
        </p>
      </div>

      {/* 6. LEVEL 3 DESCENDANTS (GREAT-GRANDCHILDREN) AREA */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#064734] mb-1">
              <GitFork className="w-4 h-4" />
              <span>Consecutive Generation · Level 3</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              Descendants of {grandchild.fullName}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Children of {grandchild.fullName} (Great-grandchildren of NYANGE RADJABU)
            </p>
          </div>

          <button
            onClick={() => onOpenRecordMeForGrandchild(grandchild)}
            className="shrink-0 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-black shadow-sm self-start sm:self-auto flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Record Descendant</span>
          </button>
        </div>

        {/* Professional Empty State as instructed */}
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/70 p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#064734]/10 text-[#064734] flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-stone-800">
              Descendant information for this family is not yet available.
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Individual genealogical records for Level 3 children and consecutive Level 4+ descendants under <strong>{grandchild.fullName}</strong> are currently being collected and verified during the ongoing family census.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenRecordMeForGrandchild(grandchild)}
              className="w-full sm:w-auto px-5 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-black shadow-md flex items-center justify-center gap-2"
            >
              <span>{t.ctaRecordButton}</span>
            </button>
            <button
              onClick={onBackToBranch}
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-stone-300"
            >
              Return to {branch.name}
            </button>
          </div>
        </div>

        {/* Census Guidelines Callout */}
        <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200 text-xs text-stone-600 space-y-1">
          <span className="font-bold text-stone-800 block">Registration Guidelines:</span>
          <p>
            When registering descendants belonging to this family line, please specify the child's full name, approximate birth year, and their direct parent ({grandchild.fullName}). Once verified by the family archival committee, their profile will be permanently integrated into the official genealogical tree.
          </p>
        </div>
      </div>
    </div>
  );
};
