import React, { useState, useEffect } from 'react';
import { DescendantSubmission, Language } from '../types';
import { 
  getCommunitySubmissions, 
  approveCommunitySubmission, 
  rejectCommunitySubmission, 
  deleteCommunitySubmission 
} from '../data/genealogyDatabase';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  onAuthStatusChanged 
} from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Clock, 
  User, 
  FileText, 
  Info,
  Users,
  LogIn,
  LogOut,
  Database
} from 'lucide-react';

interface AdminReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onSubmissionsUpdated: () => void;
}

export const AdminReviewModal: React.FC<AdminReviewModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSubmissionsUpdated
}) => {
  const [submissions, setSubmissions] = useState<DescendantSubmission[]>(getCommunitySubmissions());
  const [selectedSub, setSelectedSub] = useState<DescendantSubmission | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStatusChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleSubmissionsUpdated = () => {
      setSubmissions(getCommunitySubmissions());
    };
    window.addEventListener('nyange-submissions-updated', handleSubmissionsUpdated);
    return () => window.removeEventListener('nyange-submissions-updated', handleSubmissionsUpdated);
  }, []);

  if (!isOpen) return null;

  const refreshList = () => {
    const list = getCommunitySubmissions();
    setSubmissions(list);
    onSubmissionsUpdated();
  };

  const handleApprove = (subId: string) => {
    approveCommunitySubmission(subId, 'Family Archival Secretariat');
    setActionSuccessMsg('Submission approved! Nodes converted to verified records (yellow borders removed).');
    refreshList();
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleReject = (subId: string) => {
    rejectCommunitySubmission(subId, 'Family Archival Secretariat');
    setActionSuccessMsg('Submission rejected and archived.');
    refreshList();
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleDelete = (subId: string) => {
    deleteCommunitySubmission(subId);
    refreshList();
    if (selectedSub?.id === subId) setSelectedSub(null);
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending_approval').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#064734] text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#E0FFC2]">
                Secretariat Verification Workflow
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Census Review & Administrative Approval
            </h2>
            <p className="text-xs text-[#E0FFC2]/90 mt-0.5">
              Review community contributions, ratify verified relationships, and update the genealogical registry.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action feedback alert */}
        {actionSuccessMsg && (
          <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-inner">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Metric summary strip & Firebase Cloud status */}
        <div className="bg-stone-100 border-b border-stone-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Pending ({pendingCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Approved ({approvedCount})</span>
            </div>
            <span className="hidden sm:inline text-stone-300">|</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#064734]/10 text-[#064734] font-mono text-[10px] font-bold">
              <Database className="w-3 h-3 text-[#064734]" />
              <span>Cloud: nyangefamilie</span>
            </div>
          </div>

          {/* Council Auth Status */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-[11px] text-stone-700">
                  Council: <strong className="text-stone-900">{currentUser.displayName || currentUser.email}</strong>
                </span>
                {currentUser.email === 'uwabatonadjibullah@gmail.com' && (
                  <span className="bg-[#E0FFC2] text-[#064734] text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                    Owner
                  </span>
                )}
                <button
                  onClick={() => logoutUser()}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  try {
                    setAuthError(null);
                    await loginWithGoogle();
                  } catch (e: any) {
                    setAuthError(e?.message || 'Login failed');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#064734] hover:bg-[#0a5841] text-[#E0FFC2] font-bold text-xs cursor-pointer shadow-xs transition-colors"
                title="Authenticate as council administrator"
              >
                <LogIn className="w-3 h-3" />
                <span>Council Sign In</span>
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="bg-amber-100 text-amber-900 px-6 py-1.5 text-[11px] border-b border-amber-200">
            {authError}
          </div>
        )}

        {/* Content list */}
        <div className="p-5 sm:p-6 overflow-y-auto grow space-y-4">
          {submissions.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-stone-400" />
              <p className="font-semibold text-stone-700">No community submissions recorded.</p>
              <p>Contributions submitted via "+ ADD DESCENDANTS" will appear here for review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => {
                const isPending = sub.status === 'pending_approval';
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';

                return (
                  <div
                    key={sub.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isPending
                        ? 'bg-amber-50/60 border-2 border-amber-400 shadow-sm'
                        : isApproved
                        ? 'bg-emerald-50/40 border border-emerald-300'
                        : 'bg-stone-50 border border-stone-300 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isPending
                              ? 'bg-amber-400 text-amber-950 font-bold'
                              : isApproved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-400 text-white'
                          }`}>
                            {isPending ? 'Pending Verification' : isApproved ? 'Approved & Ratified' : 'Rejected'}
                          </span>
                          <span className="font-mono text-[11px] text-stone-500">
                            ID: {sub.id}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-stone-900 mt-1">
                          Proposed Children for: {sub.parentName}
                        </h3>
                        <p className="text-xs text-stone-600">
                          Branch: {sub.branchName} · Parent Level {sub.parentGenerationLevel} &rarr; Children Level {sub.parentGenerationLevel + 1}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApprove(sub.id)}
                              className="px-3.5 py-2 bg-[#064734] hover:bg-[#0a5841] text-[#E0FFC2] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve (Remove Yellow Border)</span>
                            </button>
                            <button
                              onClick={() => handleReject(sub.id)}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-rose-200"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-2 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer transition-colors"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Proposed Children Details */}
                    <div className="py-3 space-y-2">
                      <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                        Proposed Children ({sub.children.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {sub.children.map((child, idx) => (
                          <div
                            key={child.id || idx}
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              isPending
                                ? 'bg-white border-2 border-amber-400'
                                : 'bg-white border-stone-200'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-stone-400">
                              <span>Child #{child.birthOrder || idx + 1}</span>
                              <span className="capitalize">{child.gender}</span>
                            </div>
                            <span className="font-bold text-stone-900 block truncate">
                              {child.fullName}
                            </span>
                            {child.birthYear && (
                              <span className="text-[10px] text-stone-500 block">
                                Born: ~{child.birthYear}
                              </span>
                            )}
                            {child.notes && (
                              <p className="text-[10px] text-stone-500 italic truncate">
                                {child.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contributor metadata */}
                    <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                      <div>
                        <span>Submitted on: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                        {sub.contributorName && (
                          <span> · By: {sub.contributorName}</span>
                        )}
                      </div>
                      {sub.relationshipExplanation && (
                        <span className="italic line-clamp-1 max-w-md">
                          Note: "{sub.relationshipExplanation}"
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            All approvals are saved locally to simulate administrative verification.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
