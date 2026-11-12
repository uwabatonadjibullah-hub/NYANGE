import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Language, NavigationPage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  Home, 
  GitFork, 
  Image as ImageIcon, 
  Info, 
  Mail, 
  Heart, 
  AlertCircle, 
  Globe, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenRecordMe: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentLanguage,
  onLanguageChange,
  onOpenRecordMe
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = TRANSLATIONS[currentLanguage];

  const navLinks: { id: NavigationPage; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.navHome, icon: <Home className="w-4 h-4" /> },
    { id: 'family-tree', label: t.navFamilyTree, icon: <GitFork className="w-4 h-4" /> },
    { id: 'gallery', label: t.navGallery, icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'about', label: t.navAbout, icon: <Info className="w-4 h-4" /> },
    { id: 'contact', label: t.navContact, icon: <Mail className="w-4 h-4" /> },
    { id: 'donate', label: t.navDonate, icon: <Heart className="w-4 h-4" /> }
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'sw', label: 'Kiswahili', flag: 'SW' },
    { code: 'rw', label: 'Kinyarwanda', flag: 'RW' }
  ];

  const handleLinkClick = (page: NavigationPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Banner indicating official preliminary census in progress */}
      <div className="bg-[#064734] text-[#E0FFC2] text-xs py-1.5 px-4 text-center font-medium tracking-wide border-b border-[#043124]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-[11px] sm:text-xs">
          <span className="truncate">
            <span className="font-semibold">{t.officialBadge}</span> — 398+ {t.statRecordedMembers}
          </span>
          <button
            onClick={onOpenRecordMe}
            className="shrink-0 underline hover:text-white transition-colors cursor-pointer font-semibold"
          >
            {t.heroRecordAction} &rarr;
          </button>
        </div>
      </div>

      {/* Primary Sticky Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#064734]/10 transition-shadow duration-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center text-left cursor-pointer group focus:outline-hidden"
          >
            <BrandLogo size="md" />
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-stone-700">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative py-1 whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#064734] font-bold'
                      : 'text-stone-600 hover:text-[#064734]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#064734] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Language Selector & Primary Record Me Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-[#064734] bg-stone-100 hover:bg-[#E0FFC2]/40 rounded-lg transition-colors cursor-pointer border border-stone-200"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#064734]" />
                <span className="uppercase">{currentLanguage}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-38 bg-white border border-stone-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                          currentLanguage === lang.code
                            ? 'bg-[#E0FFC2]/50 text-[#064734] font-bold'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span>{lang.label}</span>
                        <span className="text-[10px] font-mono text-stone-400">{lang.flag}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* RECORD ME Action Button (Desktop prominent - Black with white text) */}
            <button
              onClick={onOpenRecordMe}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 border border-black"
            >
              <AlertCircle className="w-3.5 h-3.5 text-white" />
              <span className="whitespace-nowrap uppercase tracking-wider">{t.navRecordMe}</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-[#064734] hover:bg-stone-100 rounded-lg cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between p-6 z-50 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-stone-200">
                <BrandLogo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-stone-500 hover:text-stone-800 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="mt-6 space-y-1">
                {navLinks.map((link) => {
                  const isActive = currentPage === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(link.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#064734] text-[#E0FFC2]'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Record Me trigger inside drawer */}
              <div className="mt-6 pt-6 border-t border-stone-200">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRecordMe();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm cursor-pointer border border-black"
                >
                  <AlertCircle className="w-4 h-4 text-white" />
                  <span>{t.navRecordMe}</span>
                </button>
                <p className="text-[11px] text-stone-500 mt-2 text-center">
                  {t.recordMeModalSubtitle}
                </p>
              </div>
            </div>

            {/* Mobile Drawer Footer with Language Buttons */}
            <div className="pt-6 border-t border-stone-200">
              <span className="text-xs font-medium text-stone-500 block mb-2">{t.navLanguage}</span>
              <div className="grid grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg text-center cursor-pointer border ${
                      currentLanguage === lang.code
                        ? 'bg-[#064734] text-white border-[#064734]'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {lang.flag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Tab Bar for Instant Thumb Ergonomics */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-safe">
        <div className="grid grid-cols-5 items-center h-15">
          <button
            onClick={() => handleLinkClick('home')}
            className={`flex flex-col items-center justify-center h-full cursor-pointer ${
              currentPage === 'home' ? 'text-[#064734]' : 'text-stone-500'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{t.navHome}</span>
          </button>

          <button
            onClick={() => handleLinkClick('family-tree')}
            className={`flex flex-col items-center justify-center h-full cursor-pointer ${
              currentPage === 'family-tree' ? 'text-[#064734]' : 'text-stone-500'
            }`}
          >
            <GitFork className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{t.navFamilyTree}</span>
          </button>

          <button
            onClick={() => handleLinkClick('gallery')}
            className={`flex flex-col items-center justify-center h-full cursor-pointer ${
              currentPage === 'gallery' ? 'text-[#064734]' : 'text-stone-500'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{t.navGallery}</span>
          </button>

          <button
            onClick={() => handleLinkClick('about')}
            className={`flex flex-col items-center justify-center h-full cursor-pointer ${
              currentPage === 'about' ? 'text-[#064734]' : 'text-stone-500'
            }`}
          >
            <Info className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{t.navAbout}</span>
          </button>

          <button
            onClick={onOpenRecordMe}
            className="flex flex-col items-center justify-center h-full cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-[9px] font-bold text-black mt-0.5 uppercase tracking-tighter">
              {t.navRecordMe}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
