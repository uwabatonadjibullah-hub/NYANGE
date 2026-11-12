import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { FAMILY_BRANCHES } from '../data/familyData';
import { 
  Mail, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  HelpCircle,
  PhoneCall
} from 'lucide-react';

interface ContactUsPageProps {
  currentLanguage: Language;
  onOpenRecordMe: () => void;
}

export const ContactUsPage: React.FC<ContactUsPageProps> = ({
  currentLanguage,
  onOpenRecordMe
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const [fullName, setFullName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [branchId, setBranchId] = useState('');
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptCode, setReceiptCode] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !contactInfo.trim() || !subject.trim() || !message.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    const generatedReceipt = `NR-MSG-${Date.now().toString().slice(-6)}`;

    // Store in localStorage
    try {
      const messages = JSON.parse(localStorage.getItem('nyange_contact_messages') || '[]');
      messages.push({
        id: generatedReceipt,
        fullName,
        contactInfo,
        branchId: branchId || 'Unspecified',
        category,
        subject,
        message,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('nyange_contact_messages', JSON.stringify(messages));
    } catch {
      // Local fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setReceiptCode(generatedReceipt);
    }, 600);
  };

  const handleReset = () => {
    setReceiptCode(null);
    setFullName('');
    setContactInfo('');
    setBranchId('');
    setCategory('general');
    setSubject('');
    setMessage('');
    setErrorMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* HEADER */}
      <div className="pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#064734] mb-1">
          <Mail className="w-4 h-4" />
          <span>Official Communication Channel</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
          {t.contactPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
          {t.contactPageSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* CONTACT FORM CONTAINER */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs">
          {receiptCode ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#064734]/10 text-[#064734] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#064734]">
                {t.contactSuccessTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                {t.contactSuccessText}
              </p>
              <div className="inline-block px-4 py-2 bg-stone-100 border border-stone-300 rounded-lg font-mono text-sm font-bold text-stone-800 tracking-wider">
                {receiptCode}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-[#064734] text-[#E0FFC2] font-semibold text-xs rounded-xl hover:bg-[#0a5841] transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.contactFormName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mariam Hussein Rajabu"
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.contactFormEmailPhone} *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Phone number (+250 / +257) or email"
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.contactFormBranch}
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#064734] bg-white text-stone-700"
                  >
                    <option value="">Select branch if known...</option>
                    {FAMILY_BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                    <option value="unrecorded">One of the 7 Pending Branches</option>
                    <option value="unknown">Branch Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.contactFormCategory} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#064734] bg-white text-stone-700"
                  >
                    <option value="general">{t.contactCatGeneral}</option>
                    <option value="correction">{t.contactCatCorrection}</option>
                    <option value="suggestion">{t.contactCatSuggestion}</option>
                    <option value="historical">{t.contactCatHistorical}</option>
                    <option value="other">{t.contactCatOther}</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.contactFormSubject} *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief subject of your message"
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.contactFormMessage} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide detailed message, inquiries, or historical notes..."
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-500">
                  Submissions are logged directly into the family archive queue.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#064734] hover:bg-[#0a5841] text-[#E0FFC2] font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t.contactSending : t.contactSubmitBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* SIDEBAR: GUIDANCE & URGENT ESCALATION */}
        <div className="lg:col-span-4 space-y-6">
          {/* Urgent Notice Callout */}
          <div className="p-6 rounded-3xl bg-[#064734] text-white space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E0FFC2]">
              Urgent Matters
            </span>
            <h3 className="text-xl font-serif font-bold text-white">
              Is this a Bereavement or Urgent Family Emergency?
            </h3>
            <p className="text-xs text-stone-200 leading-relaxed">
              For deaths, hospitalizations, or sensitive urgent notices, please use the dedicated <strong>Record Me</strong> action for direct prioritized handling by leadership.
            </p>
            <button
              onClick={onOpenRecordMe}
              className="w-full py-2.5 bg-[#E0FFC2] hover:bg-[#cbf4a4] text-[#064734] font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
            >
              Open Record Me Notification &rarr;
            </button>
          </div>

          {/* Secretariat Working Hours & Channel Advisory */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-4 text-xs text-stone-700">
            <h4 className="font-bold text-[#064734] uppercase tracking-wider text-xs">
              Secretariat Response Guidelines
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  The Family Census & Heritage Secretariat reviews incoming submissions bi-weekly and confirms receipt against the official family records.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  All communications remain strictly within the designated family council.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
