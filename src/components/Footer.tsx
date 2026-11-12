import React from 'react';
import { Language, NavigationPage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { BrandLogo } from './BrandLogo';
import { 
  ShieldCheck, 
  MapPin, 
  GitFork, 
  Mail, 
  Heart, 
  BookOpen, 
  Image as ImageIcon, 
  AlertCircle 
} from 'lucide-react';

interface FooterProps {
  currentLanguage: Language;
  onNavigate: (page: NavigationPage) => void;
  onOpenRecordMe: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLanguage,
  onNavigate,
  onOpenRecordMe
}) => {
  const t = TRANSLATIONS[currentLanguage];

  return (
    <footer className="bg-[#064734] text-white border-t border-[#043124] pt-14 pb-20 lg:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Identity Column */}
          <div className="lg:col-span-5 space-y-4">
            <BrandLogo size="lg" lightMode={true} />
            <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed max-w-sm">
              {t.brandTagline}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E0FFC2]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Kamembe, Cyangugu, Rwanda · Burundi</span>
            </div>
            <div className="pt-2">
              <span className="text-[11px] text-[#E0FFC2]/70 font-mono block">
                {t.sourceDocument}
              </span>
            </div>
          </div>

          {/* Quick Nav Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E0FFC2]">
              Heritage Navigation
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navHome}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('family-tree')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navFamilyTree} (Level 0 – Level 5+)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navGallery} & Archival Documents
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navAbout} & Generational Structure
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navContact}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('donate')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navDonate}
                </button>
              </li>
            </ul>
          </div>

          {/* Important Actions & Record Me */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E0FFC2]">
              Important Family Actions
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Family members are invited to submit bereavement notices, urgent alerts, and descendant additions for the ongoing census.
            </p>
            <button
              onClick={onOpenRecordMe}
              className="w-full sm:w-auto px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-black shadow-md"
            >
              <AlertCircle className="w-4 h-4 text-white" />
              <span>{t.navRecordMe}</span>
            </button>
          </div>
        </div>

        {/* Bottom Rights & Standards Strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E0FFC2]" />
            <span>{t.footerArchivalStandard}</span>
          </div>
          <p className="text-center sm:text-right">
            &copy; {new Date().getFullYear()} Nyange Radjabu Family Heritage. {t.footerRights}
          </p>
        </div>
      </div>
    </footer>
  );
};
