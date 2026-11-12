import React, { useState } from 'react';
import { Language, GalleryItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { GALLERY_ARCHIVES } from '../data/familyData';
import { 
  Image as ImageIcon, 
  FileText, 
  Upload, 
  ShieldCheck, 
  Calendar, 
  User, 
  X, 
  Search,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface GalleryPageProps {
  currentLanguage: Language;
  onOpenRecordMe: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  currentLanguage,
  onOpenRecordMe
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'all', label: t.galleryFilterAll },
    { id: 'archives', label: t.galleryFilterArchives },
    { id: 'historical', label: t.galleryFilterHistorical },
    { id: 'gatherings', label: t.galleryFilterGatherings },
    { id: 'celebrations', label: t.galleryFilterCelebrations },
    { id: 'leaders', label: t.galleryFilterLeaders }
  ];

  const filteredItems = GALLERY_ARCHIVES.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#064734] mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Digital Family Archives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            {t.galleryPageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {t.galleryPageSubtitle}
          </p>
        </div>

        {/* Submit photo CTA */}
        <button
          onClick={onOpenRecordMe}
          className="self-start md:self-auto px-4 py-2.5 bg-[#064734] hover:bg-[#0a5841] text-[#E0FFC2] font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>{t.gallerySubmitPhoto}</span>
        </button>
      </div>

      {/* ARCHIVAL INTEGRITY BANNER (Anti-Fake Photo Policy) */}
      <div className="bg-[#064734]/5 border border-[#064734]/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-2.5 bg-[#064734] text-[#E0FFC2] rounded-xl shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#064734]">
            {t.galleryNoticeTitle}
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {t.galleryNoticeText}
          </p>
        </div>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
              activeCategory === cat.id
                ? 'bg-[#064734] text-[#E0FFC2] border-[#064734]'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* GALLERY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md hover:border-[#064734]/30 transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
          >
            {/* Visual Box / Archival Container */}
            <div className="h-48 bg-stone-100 border-b border-stone-200 relative flex items-center justify-center p-6 text-center overflow-hidden">
              {item.isArchiveDocument ? (
                <div className="w-full h-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-left shadow-xs flex flex-col justify-between font-mono">
                  <div className="flex items-center justify-between text-[10px] text-stone-400 border-b border-stone-200 pb-1">
                    <span>OFFICIAL AUDIT DOC</span>
                    <span>15+ VERIFIED</span>
                  </div>
                  <p className="text-[11px] text-stone-700 font-serif line-clamp-3 italic">
                    {item.documentExcerpt}
                  </p>
                  <div className="text-[9px] text-stone-400">
                    Source: Kamembe Archive Registry
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-stone-400 group-hover:text-[#064734] transition-colors">
                  <div className="p-3 rounded-full bg-stone-200/70 group-hover:bg-[#E0FFC2]/50 transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                    Archival Record Entry
                  </span>
                </div>
              )}

              {/* Category indicator badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-[#064734] border border-stone-200">
                {item.category.toUpperCase()}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-2">
              <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#064734] transition-colors leading-snug">
                {item.title[currentLanguage]}
              </h3>

              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {item.description[currentLanguage]}
              </p>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{item.year || 'Historical Archive'}</span>
                </span>
                <span className="text-xs font-bold text-[#064734] group-hover:underline">
                  {t.galleryViewDocument} &rarr;
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State Card: Call for Historical Family Photographs */}
        <div className="bg-[#E0FFC2]/20 rounded-2xl border-2 border-dashed border-[#064734]/30 p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#E0FFC2] text-[#064734] flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-serif font-bold text-[#064734]">
              Open Call for Historical Photographs
            </h4>
            <p className="text-xs text-stone-600 max-w-xs leading-relaxed">
              Family members holding authentic photographs, letters, or certificates related to Babu Nyange Radjabu or family gatherings are invited to submit them for archival preservation.
            </p>
          </div>
          <button
            onClick={onOpenRecordMe}
            className="px-4 py-2 bg-[#064734] text-[#E0FFC2] font-semibold text-xs rounded-xl hover:bg-[#0a5841] transition-colors cursor-pointer"
          >
            {t.gallerySubmitPhoto}
          </button>
        </div>
      </div>

      {/* LIGHTBOX / DOCUMENT DETAIL VIEWER */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedItem(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 z-10 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#064734] bg-[#E0FFC2]/50 px-2 py-0.5 rounded">
                  {selectedItem.category} Archive
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
                  {selectedItem.title[currentLanguage]}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document display preview */}
            <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 text-left font-serif space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-200 pb-2">
                <span>ARCHIVAL RECORD REFERENCE</span>
                <span>STATUS: VERIFIED</span>
              </div>
              <p className="text-sm text-stone-800 leading-relaxed italic">
                {selectedItem.documentExcerpt || selectedItem.description[currentLanguage]}
              </p>
              <div className="text-xs text-stone-500 pt-2 border-t border-stone-200">
                Contributor / Custodian: {selectedItem.contributor || 'Family Archive Working Group'}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-stone-800">
                Detailed Archival Description
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {selectedItem.description[currentLanguage]}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Documented for future generation preservation
              </span>
              <button
                onClick={() => setSelectedItem(null)}
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
