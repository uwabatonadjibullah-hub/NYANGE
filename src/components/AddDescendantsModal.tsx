import React, { useState } from 'react';
import { GenealogyPerson, ProposedChildSubmission, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { addCommunitySubmission } from '../data/genealogyDatabase';
import { 
  X, 
  Plus, 
  Trash2, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';

interface AddDescendantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentPerson: GenealogyPerson;
  currentLanguage: Language;
  onSubmissionSuccess: () => void;
}

export const AddDescendantsModal: React.FC<AddDescendantsModalProps> = ({
  isOpen,
  onClose,
  parentPerson,
  currentLanguage,
  onSubmissionSuccess
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const suggestedGeneration = parentPerson.generationLevel + 1;

  // Multiple children form state
  const [childrenList, setChildrenList] = useState<ProposedChildSubmission[]>([
    {
      id: 'child-1',
      fullName: '',
      gender: 'unspecified',
      birthYear: '',
      birthOrder: 1,
      motherName: '',
      notes: ''
    }
  ]);

  const [contributorName, setContributorName] = useState('');
  const [contributorContact, setContributorContact] = useState('');
  const [relationshipExplanation, setRelationshipExplanation] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddChildRow = () => {
    setChildrenList((prev) => [
      ...prev,
      {
        id: `child-${Date.now()}-${prev.length + 1}`,
        fullName: '',
        gender: 'unspecified',
        birthYear: '',
        birthOrder: prev.length + 1,
        motherName: '',
        notes: ''
      }
    ]);
  };

  const handleRemoveChildRow = (index: number) => {
    if (childrenList.length === 1) return;
    setChildrenList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateChild = (index: number, field: keyof ProposedChildSubmission, value: any) => {
    setChildrenList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation: at least one child with a name
    const validChildren = childrenList.filter((c) => c.fullName.trim().length > 0);
    if (validChildren.length === 0) {
      setErrorMsg('Please provide the full name for at least one child.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newSubmission = addCommunitySubmission({
        parentId: parentPerson.id,
        parentName: parentPerson.fullName,
        parentGenerationLevel: parentPerson.generationLevel,
        branchId: parentPerson.branchId,
        branchName: parentPerson.branchName,
        children: validChildren,
        contributorName: contributorName.trim() || undefined,
        contributorContact: contributorContact.trim() || undefined,
        relationshipExplanation: relationshipExplanation.trim() || undefined,
        additionalNotes: additionalNotes.trim() || undefined
      });

      setIsSubmitting(false);
      setSubmissionReceipt(newSubmission.id);
      onSubmissionSuccess();
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Failed to save submission. Please try again.');
    }
  };

  const handleResetAndClose = () => {
    setSubmissionReceipt(null);
    setChildrenList([
      {
        id: 'child-1',
        fullName: '',
        gender: 'unspecified',
        birthYear: '',
        birthOrder: 1,
        motherName: '',
        notes: ''
      }
    ]);
    setContributorName('');
    setContributorContact('');
    setRelationshipExplanation('');
    setAdditionalNotes('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={handleResetAndClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#064734] text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#E0FFC2]">
                Community Census Contribution
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Add Descendants for {parentPerson.fullName}
            </h2>
            <p className="text-xs text-[#E0FFC2]/90 mt-0.5">
              Parent: Level {parentPerson.generationLevel} · Proposed Children: Level {suggestedGeneration}
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto grow space-y-6">
          {submissionReceipt ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="py-6 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border-2 border-amber-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-stone-900">
                  Submission Saved — Pending Verification
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Your proposed descendant records have been catalogued and now appear in the family tree with a <strong className="text-amber-700">YELLOW BORDER</strong> indicating they are awaiting verification by the family council.
                </p>
              </div>

              <div className="inline-block px-4 py-2 bg-stone-100 border border-stone-300 rounded-xl font-mono text-xs font-bold text-stone-800">
                Tracking ID: {submissionReceipt}
              </div>

              {/* Yellow border indicator notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-xs text-amber-900 text-left max-w-lg mx-auto space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Mandatory Yellow Border Safeguard</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  The proposed family nodes will be visually distinguished with a yellow border and labelled <em>"Pending verification"</em> until an authorized administrator reviews and approves the relationship.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-[#064734] hover:bg-[#0a5841] text-[#E0FFC2] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Done & Return to Family Tree
                </button>
              </div>
            </div>
          ) : (
            /* CONTRIBUTION FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Notice Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-amber-900 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <span className="font-bold block">Census Verification Notice:</span>
                  <p>
                    All public contributions enter a pending review workflow. Proposed descendants will appear on the canvas with a <strong>yellow border</strong> and will not be incorporated into verified statistical totals until ratified by the family council.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Children Entry List (Supports Multiple Children) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#064734] flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Proposed Descendants (Level {suggestedGeneration})</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddChildRow}
                    className="px-3 py-1 bg-[#E0FFC2] hover:bg-[#cbf4a4] text-[#064734] text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Child</span>
                  </button>
                </div>

                {childrenList.map((child, index) => (
                  <div
                    key={child.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200">
                      <span className="font-bold text-stone-700 font-mono text-[11px]">
                        Child #{index + 1}
                      </span>
                      {childrenList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChildRow(index)}
                          className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                          title="Remove this child"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={child.fullName}
                          onChange={(e) => handleUpdateChild(index, 'fullName', e.target.value)}
                          placeholder="e.g. Fatima Kibogora Hassan"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={child.gender}
                          onChange={(e) => handleUpdateChild(index, 'gender', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] bg-white"
                        >
                          <option value="unspecified">Unspecified / Unknown</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Birth Year (Approx.)
                        </label>
                        <input
                          type="text"
                          value={child.birthYear || ''}
                          onChange={(e) => handleUpdateChild(index, 'birthYear', e.target.value)}
                          placeholder="e.g. 1995"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Sibling Birth Order
                        </label>
                        <select
                          value={child.birthOrder || index + 1}
                          onChange={(e) => handleUpdateChild(index, 'birthOrder', parseInt(e.target.value, 10))}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] bg-white"
                        >
                          <option value="1">1st Born</option>
                          <option value="2">2nd Born</option>
                          <option value="3">3rd Born</option>
                          <option value="4">4th Born</option>
                          <option value="5">5th Born</option>
                          <option value="6">6th Born</option>
                          <option value="7">7th Born</option>
                          <option value="8">8th Born</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Mother's Name (if known)
                        </label>
                        <input
                          type="text"
                          value={child.motherName || ''}
                          onChange={(e) => handleUpdateChild(index, 'motherName', e.target.value)}
                          placeholder="Mother full name"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contributor Information */}
              <div className="pt-2 border-t border-stone-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Contributor Details (Optional & Kept Confidential)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={contributorName}
                      onChange={(e) => setContributorName(e.target.value)}
                      placeholder="e.g. Sudi Rajabu"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Contact (Phone / Email)
                    </label>
                    <input
                      type="text"
                      value={contributorContact}
                      onChange={(e) => setContributorContact(e.target.value)}
                      placeholder="e.g. +250 78... or email"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Relationship Explanation / Historical Notes
                    </label>
                    <textarea
                      rows={2}
                      value={relationshipExplanation}
                      onChange={(e) => setRelationshipExplanation(e.target.value)}
                      placeholder="Describe how this family unit connects to the lineage of Nyange Radjabu..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:border-[#064734] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-black shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Proposed Descendants'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
