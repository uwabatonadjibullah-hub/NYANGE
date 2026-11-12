import React, { useState, useEffect } from 'react';
import { Language, NavigationPage, RecordMeType } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RecordMeModal } from './components/RecordMeModal';
import { EmergencyFloatingButton } from './components/EmergencyFloatingButton';
import { HomePage } from './pages/HomePage';
import { FamilyTreePage } from './pages/FamilyTreePage';
import { GalleryPage } from './pages/GalleryPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { DonatePage } from './pages/DonatePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isRecordMeOpen, setIsRecordMeOpen] = useState(false);
  const [recordMeInitialTab, setRecordMeInitialTab] = useState<RecordMeType>('tragedy');
  const [recordMePrefill, setRecordMePrefill] = useState<{
    branchId?: string;
    parentName?: string;
    generationLevel?: string;
    details?: string;
  } | undefined>(undefined);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Restore preferred language if previously set
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('nyange_language_preference');
      if (savedLang && (savedLang === 'en' || savedLang === 'sw' || savedLang === 'rw')) {
        setCurrentLanguage(savedLang as Language);
      }
      // Also inspect URL params for initial page and branch
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      const branchParam = params.get('branch');
      if (pageParam && ['home', 'family-tree', 'gallery', 'about', 'contact', 'donate'].includes(pageParam)) {
        setCurrentPage(pageParam as NavigationPage);
      }
      if (branchParam) {
        setSelectedBranchId(branchParam);
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem('nyange_language_preference', lang);
    } catch {
      // ignore
    }
    // Notice: Preserves current page as explicitly required!
  };

  const handleNavigate = (page: NavigationPage, params?: { branchId?: string }) => {
    if (page === 'record-me') {
      setRecordMePrefill(undefined);
      setRecordMeInitialTab('tragedy');
      setIsRecordMeOpen(true);
      return;
    }
    if (params?.branchId) {
      setSelectedBranchId(params.branchId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfdfb] text-[#121815] selection:bg-[#E0FFC2] selection:text-[#064734]">
      {/* Global Navigation System */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onOpenRecordMe={() => {
          setRecordMePrefill(undefined);
          setRecordMeInitialTab('tragedy');
          setIsRecordMeOpen(true);
        }}
      />

      {/* Main View Router */}
      <main className="grow">
        {currentPage === 'home' && (
          <HomePage
            currentLanguage={currentLanguage}
            onNavigate={handleNavigate}
            onOpenRecordMe={() => {
              setRecordMePrefill(undefined);
              setRecordMeInitialTab('tragedy');
              setIsRecordMeOpen(true);
            }}
          />
        )}

        {currentPage === 'family-tree' && (
          <FamilyTreePage
            currentLanguage={currentLanguage}
            initialBranchId={selectedBranchId}
            onOpenRecordMe={() => {
              setRecordMePrefill(undefined);
              setRecordMeInitialTab('new_member');
              setIsRecordMeOpen(true);
            }}
            onOpenRecordMeForGrandchild={(gc) => {
              setRecordMePrefill({
                branchId: gc.branchId,
                parentName: gc.fullName,
                generationLevel: '3',
                details: `Lineage submission for descendant under Level 2 grandchild ${gc.fullName} (${gc.branchName}).`
              });
              setRecordMeInitialTab('new_member');
              setIsRecordMeOpen(true);
            }}
          />
        )}

        {currentPage === 'gallery' && (
          <GalleryPage
            currentLanguage={currentLanguage}
            onOpenRecordMe={() => setIsRecordMeOpen(true)}
          />
        )}

        {currentPage === 'about' && (
          <AboutUsPage
            currentLanguage={currentLanguage}
            onOpenRecordMe={() => setIsRecordMeOpen(true)}
          />
        )}

        {currentPage === 'contact' && (
          <ContactUsPage
            currentLanguage={currentLanguage}
            onOpenRecordMe={() => setIsRecordMeOpen(true)}
          />
        )}

        {currentPage === 'donate' && (
          <DonatePage
            currentLanguage={currentLanguage}
            onOpenRecordMe={() => setIsRecordMeOpen(true)}
          />
        )}
      </main>

      {/* Global Institutional Footer */}
      <Footer
        currentLanguage={currentLanguage}
        onNavigate={handleNavigate}
        onOpenRecordMe={() => {
          setRecordMeInitialTab('tragedy');
          setIsRecordMeOpen(true);
        }}
      />

      {/* Floating Emergency Button in Bottom Right */}
      <EmergencyFloatingButton
        currentLanguage={currentLanguage}
        onTriggerEmergency={() => {
          setRecordMeInitialTab('tragedy');
          setIsRecordMeOpen(true);
        }}
      />

      {/* Prominent RECORD ME Notification Modal */}
      <RecordMeModal
        isOpen={isRecordMeOpen}
        onClose={() => setIsRecordMeOpen(false)}
        currentLanguage={currentLanguage}
        initialTab={recordMeInitialTab}
        prefillData={recordMePrefill}
      />
    </div>
  );
}
