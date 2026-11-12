import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  PATRIARCH_INFO, 
  FAMILY_VALUES, 
  FAMILY_LEADERS 
} from '../data/familyData';
import { BrandLogo } from '../components/BrandLogo';
import { 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Users, 
  MapPin, 
  Heart, 
  Compass, 
  Mail, 
  Phone
} from 'lucide-react';

interface AboutUsPageProps {
  currentLanguage: Language;
  onOpenRecordMe: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  currentLanguage,
  onOpenRecordMe
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const generationalLevels = [
    { level: 'Level 0', title: t.aboutGen0, desc: 'The starting root of the entire genealogy. All branches trace back directly to Babu Nyange Radjabu.' },
    { level: 'Level 1', title: t.aboutGen1, desc: 'The direct sons and daughters of Babu Nyange Radjabu, founding the primary family sections.' },
    { level: 'Level 2', title: t.aboutGen2, desc: 'The grandchildren of Babu Nyange Radjabu, establishing expanded branches across the region.' },
    { level: 'Level 3', title: t.aboutGen3, desc: 'The great-grandchildren, representing the dynamic multi-regional diaspora and homesteads.' },
    { level: 'Level 4', title: t.aboutGen4, desc: 'The great-great-grandchildren preserving family unity and cultural identity.' },
    { level: 'Level 5+', title: t.aboutGen5, desc: 'Subsequent generations entering the digital lineage archive.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* HEADER */}
      <div className="pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#064734] mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Identity, History & Generational Lineage</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
          {t.aboutPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
          {t.aboutPageSubtitle}
        </p>
      </div>

      {/* SECTION 1: THE LEGACY OF NYANGE RADJABU */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <BrandLogo variant="icon" size="lg" />
          <div>
            <span className="text-xs uppercase tracking-widest text-[#064734] font-bold">
              The Lineage Patriarch
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              The Life & Character of Nyange Radjabu
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-stone-100">
          <div className="lg:col-span-8 space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
            <p className="font-serif text-base sm:text-lg text-stone-900 italic bg-[#E0FFC2]/20 p-4 rounded-xl border-l-4 border-[#064734]">
              {t.patriarchQuote}
            </p>
            <p>
              {PATRIARCH_INFO.biography?.[currentLanguage]}
            </p>
            <p className="text-stone-600 text-xs sm:text-sm">
              Living through pivotal decades in East-Central Africa, Babu Nyange Radjabu anchored his households upon steadfast devotion to Islamic values and deep respect for Rwandan traditions. He emphasized high moral character, familial loyalty, and generous care for the needy. In his later years in Burundi, his moral authority and fatherly wisdom continued to inspire his descendants across the borders.
            </p>
          </div>

          <div className="lg:col-span-4 p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 text-xs">
            <h4 className="font-bold text-[#064734] uppercase tracking-wider text-[11px]">
              Archival Provenance Notes
            </h4>
            <div className="space-y-2 text-stone-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#064734] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900 block">Primary Historical Residence:</span>
                  <span>Kamembe, Cyangugu, Rwanda</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#064734] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900 block">Final Period Residence:</span>
                  <span>Burundi</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#064734] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900 block">Generational Status:</span>
                  <span>Level 0 Original Patriarch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE GENERATIONAL STRUCTURE (LEVEL 0 - LEVEL 5+) */}
      <section className="space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#064734] font-bold">
            Genealogical Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            {t.aboutGenerationsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {t.aboutGenerationsIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {generationalLevels.map((gen, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-[#064734] text-white border-[#064734] shadow-md'
                  : 'bg-white text-stone-900 border-stone-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    idx === 0
                      ? 'bg-[#E0FFC2] text-[#064734]'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {gen.level}
                </span>
              </div>
              <h4
                className={`text-base font-serif font-bold mb-1.5 ${
                  idx === 0 ? 'text-[#E0FFC2]' : 'text-[#064734]'
                }`}
              >
                {gen.title}
              </h4>
              <p
                className={`text-xs leading-relaxed ${
                  idx === 0 ? 'text-stone-200' : 'text-stone-600'
                }`}
              >
                {gen.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: CORE VALUES */}
      <section className="bg-stone-50 rounded-3xl p-6 sm:p-10 border border-stone-200 space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#064734] font-bold">
            Guiding Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Our Shared Family Values
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FAMILY_VALUES.map((val) => (
            <div
              key={val.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-2"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#064734]" />
              <h3 className="text-base font-serif font-bold text-[#064734]">
                {val.title[currentLanguage]}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {val.desc[currentLanguage]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: FAMILY LEADERSHIP & GOVERNANCE */}
      <section className="space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#064734] font-bold">
            Family Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            {t.aboutLeadershipTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {t.aboutLeadershipIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FAMILY_LEADERS.map((leader) => (
            <div
              key={leader.id}
              className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {leader.status === 'active' ? 'Active Working Group' : 'Provisional Role'}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#064734]" />
                </div>

                <h3 className="text-lg font-serif font-bold text-[#064734] leading-snug">
                  {leader.role[currentLanguage]}
                </h3>

                <p className="text-xs font-semibold text-stone-800">
                  {leader.name}
                </p>

                <p className="text-xs text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
                  {leader.responsibilities[currentLanguage]}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500">
                <span>{leader.contactNotes[currentLanguage]}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: OFFICIAL LEADERSHIP COMMUNICATION ADVISORY */}
      <section className="bg-[#064734]/5 border border-[#064734]/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#064734]">
            {t.aboutCommTitle}
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {t.aboutCommText}
          </p>
        </div>
        <button
          onClick={onOpenRecordMe}
          className="shrink-0 px-5 py-2.5 bg-[#064734] hover:bg-[#0a5841] text-[#E0FFC2] text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          {t.ctaRecordButton}
        </button>
      </section>
    </div>
  );
};
