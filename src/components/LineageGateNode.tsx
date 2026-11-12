import React, { useState } from 'react';
import { DescendantNode, Language } from '../types';
import { 
  GitFork, 
  MapPin, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Users, 
  DoorOpen, 
  DoorClosed, 
  Sparkles,
  PlusCircle,
  Leaf
} from 'lucide-react';

interface LineageGateNodeProps {
  node: DescendantNode;
  currentLanguage: Language;
  onSelectNode?: (node: DescendantNode) => void;
  onOpenRecordMe: () => void;
  depth?: number;
  initiallyOpen?: boolean;
}

export const LineageGateNode: React.FC<LineageGateNodeProps> = ({
  node,
  currentLanguage,
  onSelectNode,
  onOpenRecordMe,
  depth = 0,
  initiallyOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const childrenCount = node.children ? node.children.length : 0;

  const toggleGate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (onSelectNode) {
      onSelectNode(node);
    }
  };

  const getGenerationColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-[#064734] text-[#E0FFC2] border-[#E0FFC2]/50';
      case 1:
        return 'bg-[#0a5841] text-white border-white/30';
      case 2:
        return 'bg-emerald-800 text-emerald-100 border-emerald-600';
      case 3:
        return 'bg-teal-900 text-teal-100 border-teal-700';
      case 4:
        return 'bg-stone-800 text-stone-100 border-stone-600';
      default:
        return 'bg-stone-700 text-stone-200 border-stone-500';
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full transition-all duration-300">
      {/* Node Card Container styled as a Heritage Gate */}
      <div 
        onClick={toggleGate}
        className={`relative z-10 w-full max-w-xl rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden shadow-md select-none ${
          isOpen
            ? 'bg-gradient-to-b from-[#064734] via-[#053d2c] to-[#043124] text-white border-[#E0FFC2] shadow-xl ring-2 ring-[#E0FFC2]/40'
            : 'bg-white text-stone-900 border-stone-300 hover:border-[#064734] hover:shadow-lg'
        }`}
      >
        {/* Top Arch / Crest */}
        <div className={`px-4 py-2 border-b flex items-center justify-between text-xs font-semibold ${
          isOpen ? 'bg-[#043124]/90 border-[#E0FFC2]/20 text-[#E0FFC2]' : 'bg-stone-100 border-stone-200 text-stone-600'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${getGenerationColor(node.generationLevel)}`}>
              Level {node.generationLevel}
            </span>
            <span className="truncate max-w-[200px] text-[11px] font-medium">
              {node.branchName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
            {hasChildren ? (
              <span className={`flex items-center gap-1 font-bold ${isOpen ? 'text-[#E0FFC2]' : 'text-[#064734]'}`}>
                {isOpen ? <DoorOpen className="w-3.5 h-3.5" /> : <DoorClosed className="w-3.5 h-3.5" />}
                <span>{isOpen ? 'Gate Open' : `Open Gate (${childrenCount})`}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-stone-400 font-medium text-[10px]">
                <Leaf className="w-3 h-3 text-emerald-600" />
                <span>Terminal Lineage</span>
              </span>
            )}
          </div>
        </div>

        {/* Gate Double-Door Visual Presentation */}
        <div className="p-4 sm:p-5 relative">
          {/* Animated Carved Gate Doors Overlay when Closed */}
          {!isOpen && hasChildren && (
            <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-[1px] flex items-center justify-center p-4 z-10 transition-opacity hover:bg-stone-50/60">
              <div className="w-full h-full border border-stone-200 rounded-xl flex items-center justify-between p-3 bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100 shadow-inner">
                {/* Left Gate Panel */}
                <div className="w-1/2 h-full border-r border-stone-300 flex flex-col justify-between p-2">
                  <div className="text-[10px] font-mono text-stone-400">HERITAGE GATE</div>
                  <div className="font-bold text-sm text-[#064734] truncate">{node.fullName}</div>
                  <div className="text-[10px] text-stone-500">Click to reveal lineage</div>
                </div>
                {/* Right Gate Panel */}
                <div className="w-1/2 h-full flex flex-col justify-between p-2 pl-4 text-right">
                  <div className="text-[10px] font-mono text-stone-400">{childrenCount} DESCENDANTS</div>
                  <div className="text-xs font-semibold text-stone-700">Level {node.generationLevel + 1} &rarr;</div>
                  <div className="text-[10px] font-bold text-[#064734]">Tap to Open 🚪</div>
                </div>
              </div>
            </div>
          )}

          {/* Person Content */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`text-base sm:text-lg font-bold leading-tight ${isOpen ? 'text-white font-serif' : 'text-stone-900 font-serif'}`}>
                  {node.fullName}
                </h3>
                {node.location && (
                  <div className={`flex items-center gap-1.5 text-xs mt-0.5 ${isOpen ? 'text-[#E0FFC2]' : 'text-stone-500'}`}>
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{node.location}</span>
                  </div>
                )}
              </div>

              {node.verificationStatus && (
                <div className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                  node.verificationStatus === 'verified_audit_record'
                    ? isOpen ? 'bg-[#E0FFC2] text-[#064734]' : 'bg-[#E0FFC2]/60 text-[#064734]'
                    : isOpen ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-900'
                }`}>
                  {node.verificationStatus === 'verified_audit_record' ? 'Verified 15+' : 'Census Pending'}
                </div>
              )}
            </div>

            {node.note && (
              <p className={`text-xs leading-relaxed pt-1.5 border-t ${
                isOpen ? 'text-stone-200 border-white/10' : 'text-stone-600 border-stone-100'
              }`}>
                {node.note[currentLanguage]}
              </p>
            )}

            {/* Terminal node action banner when person has NO children */}
            {!hasChildren && (
              <div className={`mt-3 p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                isOpen 
                  ? 'bg-white/10 border-white/20 text-stone-100' 
                  : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[11px]">
                    No consecutive descendants currently recorded in audit register.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRecordMe();
                  }}
                  className="shrink-0 px-2.5 py-1 text-[10px] font-bold rounded bg-black text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Record Child +
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gate Footer with Toggle Indicator */}
        {hasChildren && (
          <div className={`px-4 py-2 border-t text-xs flex items-center justify-between ${
            isOpen ? 'bg-[#03241a] border-white/10 text-[#E0FFC2]' : 'bg-stone-50 border-stone-200 text-stone-600'
          }`}>
            <span className="text-[11px] font-medium">
              {isOpen ? `Showing ${childrenCount} consecutive descendants` : `${childrenCount} descendants waiting inside gate`}
            </span>
            <div className="flex items-center gap-1 font-bold text-xs">
              <span>{isOpen ? 'Close Gate' : 'Open Lineage Gate'}</span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        )}
      </div>

      {/* CONTINUOUS CONSECUTIVE DESCENDANTS: Cascading Gate Chain */}
      {isOpen && hasChildren && (
        <div className="w-full flex flex-col items-center mt-3 relative">
          {/* Trunk connector line descending from parent */}
          <div className="w-0.5 h-8 bg-[#064734] shadow-xs" />

          {/* Gate Portal Header */}
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-[#E0FFC2] text-[#064734] rounded-full border border-[#064734]/30 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consecutive Descendants of {node.fullName} (Level {node.generationLevel + 1})</span>
          </div>

          {/* Consecutive Children Nodes Grid */}
          <div className={`w-full grid gap-6 ${
            node.children && node.children.length > 1
              ? 'grid-cols-1 lg:grid-cols-2'
              : 'grid-cols-1'
          } items-start justify-items-center max-w-4xl`}>
            {node.children?.map((childNode) => (
              <LineageGateNode
                key={childNode.id}
                node={childNode}
                currentLanguage={currentLanguage}
                onSelectNode={onSelectNode}
                onOpenRecordMe={onOpenRecordMe}
                depth={depth + 1}
                initiallyOpen={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
