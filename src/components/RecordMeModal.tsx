import React, { useState } from 'react';
import { Language, RecordMeType } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { FAMILY_BRANCHES } from '../data/familyData';
import { saveNotificationToFirestore } from '../firebase';
import { 
  X, 
  HeartHandshake, 
  BellRing, 
  UserPlus, 
  PhoneCall, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface RecordMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  initialTab?: RecordMeType;
  prefillData?: {
    branchId?: string;
    parentName?: string;
    generationLevel?: string;
    details?: string;
  };
}

export const RecordMeModal: React.FC<RecordMeModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  initialTab = 'tragedy',
  prefillData
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const [activeTab, setActiveTab] = useState<RecordMeType>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (prefillData?.branchId) {
        setBranchId(prefillData.branchId);
      }
      if (prefillData?.parentName) {
        setFatherName(prefillData.parentName);
      }
      if (prefillData?.generationLevel) {
        setGenerationLevel(prefillData.generationLevel);
      }
      if (prefillData?.details) {
        setDetails(prefillData.details);
      }
    }
  }, [isOpen, initialTab, prefillData]);
  const [showCallNotice, setShowCallNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<string | null>(null);

  // Form fields
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [affectedName, setAffectedName] = useState('');
  const [branchId, setBranchId] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [generationLevel, setGenerationLevel] = useState('2');
  const [connectionStory, setConnectionStory] = useState('');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!senderName.trim() || !senderContact.trim()) {
      setFormError('Please provide your name and contact details.');
      return;
    }

    if (activeTab === 'tragedy' && !affectedName.trim()) {
      setFormError('Please provide the affected family member’s full name.');
      return;
    }

    if (activeTab === 'new_member' && !details.trim() && !connectionStory.trim()) {
      setFormError('Please provide lineage connection details.');
      return;
    }

    setIsSubmitting(true);

    // Generate unique verification tracking receipt
    const receiptCode = `NR-${activeTab.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;

    // Store in localStorage for audit persistence
    try {
      const existingQueue = JSON.parse(localStorage.getItem('nyange_heritage_notifications') || '[]');
      const nowIso = new Date().toISOString();
      const newSubmission = {
        id: receiptCode,
        receiptId: receiptCode,
        type: activeTab,
        senderName,
        senderContact,
        affectedName: activeTab === 'tragedy' ? affectedName : undefined,
        branchId: branchId || undefined,
        fatherName: activeTab === 'new_member' ? fatherName : undefined,
        motherName: activeTab === 'new_member' ? motherName : undefined,
        generationLevel: activeTab === 'new_member' ? generationLevel : undefined,
        connectionStory: activeTab === 'new_member' ? connectionStory : undefined,
        subject: activeTab === 'urgent_notice' ? subject : undefined,
        details,
        status: 'PENDING_VERIFICATION',
        submittedAt: nowIso
      };
      existingQueue.push(newSubmission);
      localStorage.setItem('nyange_heritage_notifications', JSON.stringify(existingQueue));

      // Persist directly to Firebase Firestore
      saveNotificationToFirestore(newSubmission).catch((err) => {
        console.warn('[Firebase] Notification remote save warning:', err);
      });
    } catch {
      // Local fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessReceipt(receiptCode);
    }, 600);
  };

  const handleReset = () => {
    setSuccessReceipt(null);
    setSenderName('');
    setSenderContact('');
    setAffectedName('');
    setBranchId('');
    setFatherName('');
    setMotherName('');
    setConnectionStory('');
    setSubject('');
    setDetails('');
    setFormError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#043124]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 z-10 my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#064734] text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E0FFC2]" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#E0FFC2]">
                Official Secretariat Channel
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
              {t.recordMeModalTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#E0FFC2]/90 mt-1">
              {t.recordMeModalSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#E0FFC2] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto grow">
          {/* Direct Call Advisory Bar */}
          <div className="mb-6 p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#064734]/10 rounded-lg text-[#064734] shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">{t.recordMeDirectCallBtn}</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {t.recordMeDirectCallNotice}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCallNotice(true)}
              className="shrink-0 px-3 py-1.5 text-xs font-semibold text-[#064734] bg-[#E0FFC2] hover:bg-[#cbf4a4] rounded-lg transition-colors cursor-pointer"
            >
              {t.learnMore}
            </button>
          </div>

          {/* Call Notice Dialog if expanded */}
          {showCallNotice && (
            <div className="mb-6 p-4 rounded-xl bg-[#064734]/5 border border-[#064734]/20 text-xs text-stone-700 space-y-2">
              <div className="flex items-center justify-between font-semibold text-[#064734]">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  Official Leadership Telephone Notice
                </span>
                <button
                  onClick={() => setShowCallNotice(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              </div>
              <p>
                In strict compliance with our governance protocols, direct telephone contact numbers for the Head of the Family and Council of Elders are awaiting final ratification by the Family Assembly.
              </p>
              <p className="text-[11px] text-stone-500">
                Please submit your notice using the confidential form below. Notifications marked as <strong>Family Tragedy</strong> trigger prioritized review.
              </p>
            </div>
          )}

          {/* SUCCESS RECEIPT STATE */}
          {successReceipt ? (
            <div className="py-6 px-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#064734]/10 text-[#064734] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#064734]">
                {t.recordSuccessTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                {t.recordSuccessText}
              </p>
              <div className="inline-block px-4 py-2 bg-stone-100 border border-stone-300 rounded-lg font-mono text-sm font-bold text-stone-800 tracking-wider">
                {successReceipt}
              </div>

              <div className="p-3 bg-[#E0FFC2]/30 rounded-xl border border-[#064734]/15 text-[11px] text-[#064734] text-left max-w-md mx-auto space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Next Steps in Verification Process</span>
                </div>
                <p>
                  Your submission has been catalogued with status <strong>PENDING VERIFICATION</strong>. The designated family representative will verify the details before any formal publication.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
                >
                  Submit Another Notice
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#064734] bg-[#E0FFC2] hover:bg-[#c8f5a1] rounded-lg cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* SUBMISSION FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Option Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-stone-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('tragedy')}
                  className={`p-2.5 rounded-lg text-left transition-all cursor-pointer flex items-center sm:flex-col sm:items-start gap-2 ${
                    activeTab === 'tragedy'
                      ? 'bg-white shadow-xs text-[#064734] font-bold border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-rose-700 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold">{t.recordOptionA_Title}</span>
                    <span className="hidden sm:block text-[10px] text-stone-500 font-normal leading-tight mt-0.5">
                      Bereavement or urgent emergency
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('urgent_notice')}
                  className={`p-2.5 rounded-lg text-left transition-all cursor-pointer flex items-center sm:flex-col sm:items-start gap-2 ${
                    activeTab === 'urgent_notice'
                      ? 'bg-white shadow-xs text-[#064734] font-bold border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <BellRing className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold">{t.recordOptionB_Title}</span>
                    <span className="hidden sm:block text-[10px] text-stone-500 font-normal leading-tight mt-0.5">
                      Urgent family announcements
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('new_member')}
                  className={`p-2.5 rounded-lg text-left transition-all cursor-pointer flex items-center sm:flex-col sm:items-start gap-2 ${
                    activeTab === 'new_member'
                      ? 'bg-white shadow-xs text-[#064734] font-bold border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold">{t.recordOptionC_Title}</span>
                    <span className="hidden sm:block text-[10px] text-stone-500 font-normal leading-tight mt-0.5">
                      Descendant census addition
                    </span>
                  </div>
                </button>
              </div>

              {/* Tab Description Callout */}
              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 border border-stone-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#064734] shrink-0 mt-0.5" />
                <span>
                  {activeTab === 'tragedy' && t.recordOptionA_Desc}
                  {activeTab === 'urgent_notice' && t.recordOptionB_Desc}
                  {activeTab === 'new_member' && t.recordOptionC_Desc}
                </span>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.recordFormSenderName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g., Ibrahim Rajabu"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.recordFormSenderContact} *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderContact}
                    onChange={(e) => setSenderContact(e.target.value)}
                    placeholder="Phone number (+250 / +257) or email"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                  />
                </div>

                {/* Option A specific field */}
                {activeTab === 'tragedy' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t.recordFormAffectedName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={affectedName}
                      onChange={(e) => setAffectedName(e.target.value)}
                      placeholder="Name of deceased or affected family member"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                    />
                  </div>
                )}

                {/* Family Branch Selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.recordFormBranch}
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734] bg-white"
                  >
                    <option value="">Select branch if known...</option>
                    {FAMILY_BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.reportedCount15Plus})
                      </option>
                    ))}
                    <option value="unsubmitted-branch">One of the 7 Pending Branches</option>
                    <option value="unknown">Branch Unknown / To Be Verified</option>
                  </select>
                </div>

                {/* Option B specific field */}
                {activeTab === 'urgent_notice' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t.recordFormSubject} *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Urgent Notice Regarding Family Heritage Homestead"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                    />
                  </div>
                )}

                {/* Option C specific fields */}
                {activeTab === 'new_member' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t.recordFormFather}
                      </label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        placeholder="Father's full name"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t.recordFormMother}
                      </label>
                      <input
                        type="text"
                        value={motherName}
                        onChange={(e) => setMotherName(e.target.value)}
                        placeholder="Mother's full name"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t.recordFormGeneration}
                      </label>
                      <select
                        value={generationLevel}
                        onChange={(e) => setGenerationLevel(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734] bg-white"
                      >
                        <option value="1">Level 1 (Direct child of Babu Nyange)</option>
                        <option value="2">Level 2 (Grandchild)</option>
                        <option value="3">Level 3 (Great-grandchild)</option>
                        <option value="4">Level 4 (Great-great-grandchild)</option>
                        <option value="5+">Level 5 and beyond</option>
                        <option value="unknown">To be verified</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t.recordFormConnection}
                      </label>
                      <textarea
                        rows={2}
                        value={connectionStory}
                        onChange={(e) => setConnectionStory(e.target.value)}
                        placeholder="Describe how this person connects to Babu Nyange Radjabu's lineage..."
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                      />
                    </div>
                  </>
                )}

                {/* Details Text Area */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.recordFormDetails} *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={
                      activeTab === 'tragedy'
                        ? 'Details of the tragedy, location, dates, and immediate family contacts...'
                        : activeTab === 'urgent_notice'
                        ? 'Full announcement text and required action...'
                        : 'Any additional notes, age, date of birth, current location...'
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] focus:ring-1 focus:ring-[#064734]"
                  />
                </div>
              </div>

              {/* Operational Rules Disclaimer */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>{t.recordFormDisclaimer}</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5 border border-black"
                >
                  {isSubmitting ? t.recordFormSubmitting : t.recordFormSubmit}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
