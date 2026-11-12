import React from 'react';
import { Language, NavigationPage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  PATRIARCH_INFO, 
  FAMILY_BRANCHES, 
  FAMILY_VALUES,
  REPORTED_TOTAL_15_PLUS,
  REPORTED_SECTIONS_COUNT,
  PENDING_FAMILIES_COUNT,
  UNRECORDED_BRANCHES_NOTE
} from '../data/familyData';
import { BrandLogo } from '../components/BrandLogo';
import { 
  GitFork, 
  Users, 
  FileText, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  MapPin, 
  AlertCircle
} from 'lucide-react';

interface HomePageProps {
  currentLanguage: Language;
  onNavigate: (page: NavigationPage, params?: { branchId?: string }) => void;
  onOpenRecordMe: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentLanguage,
  onNavigate,
  onOpenRecordMe
}) => {
  const t = TRANSLATIONS[currentLanguage];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#064734] via-[#053d2c] to-[#043124] text-white pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#064734]/40">
        {/* Subtle geometric pattern overlay reflecting Rwandan Imigongo & Islamic geometric harmony */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#E0FFC2 1px, transparent 1px), radial-gradient(#E0FFC2 1px, #064734 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Emblem & Official Archive Kicker */}
          <div className="inline-flex flex-col items-center gap-3">
            <BrandLogo variant="icon" size="xl" lightMode={true} />
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0FFC2]/15 border border-[#E0FFC2]/30 text-[#E0FFC2] text-xs font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E0FFC2]" />
              <span>{t.officialBadge}</span>
              <span className="text-[#E0FFC2]/50">·</span>
              <span>Kamembe, Rwanda</span>
            </div>
          </div>

          {/* Hero Headline */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
              {t.heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-stone-200/90 leading-relaxed font-sans max-w-2xl mx-auto">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => onNavigate('family-tree')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#E0FFC2] hover:bg-[#cbf4a4] text-[#064734] font-bold text-sm rounded-xl shadow-md transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <GitFork className="w-4 h-4" />
              <span>{t.heroExploreTree}</span>
            </button>

            <button
              onClick={() => onNavigate('about')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t.heroAboutHistory}</span>
            </button>

            <button
              onClick={onOpenRecordMe}
              className="w-full sm:w-auto px-6 py-3.5 bg-black hover:bg-neutral-800 text-white border border-black font-bold text-sm rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <AlertCircle className="w-4 h-4 text-white" />
              <span>{t.navRecordMe}</span>
            </button>
          </div>

          {/* Preliminary Census Badge Strip */}
          <div className="pt-6 border-t border-white/15 max-w-xl mx-auto">
            <p className="text-xs text-[#E0FFC2]/80 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E0FFC2] shrink-0" />
              <span>
                398+ {t.statRecordedMembers} · 8 {t.statListedSections} · 7 {t.statPendingBranches}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* STATISTIC METRIC CARDS (Centralized Source) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Card 1: Recorded 15+ Members */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#064734] mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Audited Count
              </span>
              <div className="p-2 rounded-lg bg-[#064734]/5 text-[#064734]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#064734] tabular-nums">
                {REPORTED_TOTAL_15_PLUS}+
              </div>
              <p className="text-xs sm:text-sm font-semibold text-stone-900 mt-1">
                {t.statRecordedMembers}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {t.statRecordedMembersSub}
              </p>
            </div>
          </div>

          {/* Card 2: Reported Family Sections */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#064734] mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Audit Sections
              </span>
              <div className="p-2 rounded-lg bg-[#064734]/5 text-[#064734]">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#064734] tabular-nums">
                {REPORTED_SECTIONS_COUNT}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-stone-900 mt-1">
                {t.statListedSections}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {t.statListedSectionsSub}
              </p>
            </div>
          </div>

          {/* Card 3: Pending Census Submissions */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-700 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Census Ongoing
              </span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-800 tabular-nums">
                {PENDING_FAMILIES_COUNT}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-stone-900 mt-1">
                {t.statPendingBranches}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {t.statPendingBranchesSub}
              </p>
            </div>
          </div>

          {/* Card 4: Generational Span */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#064734] mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Lineage Depth
              </span>
              <div className="p-2 rounded-lg bg-[#064734]/5 text-[#064734]">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#064734] tabular-nums">
                L0 – L5+
              </div>
              <p className="text-xs sm:text-sm font-semibold text-stone-900 mt-1">
                {t.statGenerations}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {t.statGenerationsSub}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CENSUS AUDIT OFFICIAL NOTICE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#E0FFC2]/50 border border-[#064734]/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#064734] text-[#E0FFC2] rounded-xl shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#064734] uppercase tracking-wider">
                {t.censusBannerTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 mt-1 leading-relaxed max-w-3xl">
                {t.censusBannerText}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenRecordMe}
            className="shrink-0 px-4 py-2.5 bg-[#064734] hover:bg-[#0a5841] text-[#E0FFC2] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>{t.ctaRecordButton}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* HISTORICAL INTRODUCTION OF NYANGE RADJABU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-stone-200 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual Emblem & Historical Framing */}
            <div className="lg:col-span-5 flex flex-col items-center text-center p-6 sm:p-8 bg-[#064734]/5 rounded-2xl border border-[#064734]/15">
              <BrandLogo variant="icon" size="xl" />
              <div className="mt-4">
                <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold block">
                  Original Patriarch · Level 0
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#064734] mt-1">
                  NYANGE RADJABU
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs text-stone-600 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#064734]" />
                  <span>Kamembe, Rwanda · Burundi</span>
                </div>
              </div>

              {/* Verified historical note quote */}
              <div className="mt-6 pt-6 border-t border-stone-200/80 text-left w-full">
                <p className="text-xs italic text-stone-700 leading-relaxed font-serif">
                  {t.patriarchQuote}
                </p>
              </div>
            </div>

            {/* Historical Narrative Content */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#064734] font-bold">
                  {t.patriarchSectionTitle}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 mt-1">
                  {t.patriarchSectionSubtitle}
                </h2>
              </div>

              <div className="prose text-stone-700 space-y-4 text-sm sm:text-base leading-relaxed">
                <p>
                  {PATRIARCH_INFO.biography?.[currentLanguage]}
                </p>
                <p className="text-stone-600 text-xs sm:text-sm">
                  Our family foundation traces back to the historic town of Kamembe, Cyangugu sector, situated on the shores of Lake Kivu in Western Rwanda. Here, Babu Nyange Radjabu established the family hearth, guiding his households with deep faith, mutual respect, and unfaltering dedication to community wellbeing.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('about')}
                  className="px-5 py-2.5 bg-[#064734] hover:bg-[#0a5841] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>{t.readFullBiography}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('family-tree')}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {t.heroExploreTree}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENTED FAMILY SECTIONS (8 CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#064734] font-bold">
              {t.branchesSectionTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              {t.branchesSectionSubtitle}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('family-tree')}
            className="text-xs font-bold text-[#064734] hover:underline flex items-center gap-1 cursor-pointer self-start md:self-auto"
          >
            <span>{t.heroExploreTree}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Family Branch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FAMILY_BRANCHES.map((branch) => (
            <div
              key={branch.id}
              onClick={() => onNavigate('family-tree', { branchId: branch.id })}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-[#064734] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-mono text-[11px] font-semibold text-stone-400 group-hover:text-[#064734]">
                    {branch.code}
                  </span>
                  <span className="text-[11px] font-bold text-[#064734] bg-[#E0FFC2]/50 px-2 py-0.5 rounded-full">
                    {branch.reportedCount15Plus} {t.treeNodeMembers}
                  </span>
                </div>

                <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#064734] transition-colors leading-snug">
                  {branch.name}
                </h3>

                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {branch.summary[currentLanguage]}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">
                  {branch.grandchildrenCount} Grandchildren
                </span>
                <span
                  className="text-xs font-bold text-[#064734] group-hover:underline flex items-center gap-1"
                >
                  <span>{t.learnMore}</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Note on the 7 Unrecorded Branches */}
        <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 leading-relaxed flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-800">Pending Census Notice: </span>
            <span>{UNRECORDED_BRANCHES_NOTE[currentLanguage]}</span>
          </div>
        </div>
      </section>

      {/* FAMILY CORE VALUES */}
      <section className="bg-stone-50 border-y border-stone-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#064734] font-bold">
              {t.valuesSectionTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              {t.valuesSectionSubtitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FAMILY_VALUES.map((val) => (
              <div
                key={val.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-2"
              >
                <div className="w-2 h-2 rounded-full bg-[#064734] mb-2" />
                <h3 className="text-lg font-serif font-bold text-[#064734]">
                  {val.title[currentLanguage]}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {val.desc[currentLanguage]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HERITAGE PRESERVATION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#064734] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white">
              {t.ctaPreserveTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              {t.ctaPreserveText}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onOpenRecordMe}
                className="px-5 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center border border-black shadow-md"
              >
                {t.ctaRecordButton}
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs rounded-xl transition-colors cursor-pointer text-center"
              >
                {t.ctaContactButton}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
