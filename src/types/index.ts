/**
 * Nyange Radjabu Family Heritage Platform
 * Core Data Models & Type Definitions
 */

export type Language = 'en' | 'sw' | 'rw';

export type NavigationPage = 
  | 'home' 
  | 'family-tree' 
  | 'gallery' 
  | 'about' 
  | 'contact' 
  | 'donate'
  | 'record-me';

export interface GrandchildRecord {
  id: string;
  fullName: string;
  branchId: string;
  branchName: string;
  generationLevel: 2;
  orderNumber: number;
  reportedFamilyCount15Plus?: number; // undefined for Branch 8
  verificationStatus: 'verified_audit_record';
  location?: string;
  notes?: Record<Language, string>;
  children?: DescendantNode[];
}

export interface FamilyBranch {
  id: string;
  code: string;
  name: string;
  swahiliName: string;
  kinyarwandaName: string;
  reportedCount15Plus: number;
  status: 'reported_audit' | 'pending_verification' | 'unsubmitted';
  primaryLocation: string;
  representativeLeader?: string;
  summary: Record<Language, string>;
  lineageNotes: Record<Language, string>;
  sourceDocumentRef: string;
  grandchildrenCount: number;
  grandchildren: GrandchildRecord[];
}

export interface DescendantNode {
  id: string;
  fullName: string;
  gender: 'male' | 'female' | 'unspecified';
  generationLevel: number;
  branchId: string;
  branchName: string;
  fatherName?: string;
  motherName?: string;
  isDeceased?: boolean;
  birthYear?: string;
  location?: string;
  verificationStatus: 'verified_audit_record' | 'census_pending' | 'unverified';
  note?: Record<Language, string>;
  children?: DescendantNode[];
}

export interface FamilyMember {
  id: string;
  fullName: string;
  gender: 'male' | 'female' | 'unspecified';
  generationLevel: number; // 0: Nyange Radjabu, 1: children, 2: grandchildren, etc.
  branchId?: string;
  fatherId?: string;
  motherId?: string;
  isPatriarch?: boolean;
  birthYear?: string;
  deathYear?: string;
  isDeceased?: boolean;
  biography?: Record<Language, string>;
  location?: string;
  verificationStatus: 'verified_audit_record' | 'census_pending' | 'unverified';
  privacyLevel: 'public' | 'family_restricted';
}

export interface GalleryItem {
  id: string;
  title: Record<Language, string>;
  category: 'historical' | 'gatherings' | 'celebrations' | 'leaders' | 'events' | 'archives';
  year?: string;
  contributor?: string;
  description: Record<Language, string>;
  isArchiveDocument?: boolean;
  documentExcerpt?: string;
  placeholderType: 'document' | 'landscape' | 'gathering' | 'emblem';
}

export interface FamilyLeader {
  id: string;
  role: Record<Language, string>;
  name: string;
  status: 'active' | 'provisional_placeholder';
  responsibilities: Record<Language, string>;
  contactNotes: Record<Language, string>;
}

export interface ContactSubmission {
  id: string;
  fullName: string;
  contactInfo: string;
  branchId: string;
  category: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export type RecordMeType = 'tragedy' | 'urgent_notice' | 'new_member';

export interface RecordMeSubmission {
  id: string;
  type: RecordMeType;
  senderName: string;
  senderContact: string;
  affectedMemberName?: string;
  branchId?: string;
  fatherName?: string;
  motherName?: string;
  generationLevel?: string;
  connectionStory?: string;
  subject?: string;
  details: string;
  status: 'PENDING_VERIFICATION';
  submittedAt: string;
}

export interface GenealogyPerson {
  id: string;
  fullName: string;
  gender: 'male' | 'female' | 'unspecified';
  generationLevel: number; // 0: Patriarch, 1: Child, 2: Grandchild, 3: Great-Grandchild, 4: Great-Great-Grandchild, 5+: Consecutive
  branchId: string;
  branchName: string;
  fatherId?: string;
  motherId?: string;
  spouseName?: string;
  birthYear?: string;
  deathYear?: string;
  isDeceased?: boolean;
  isPatriarch?: boolean;
  location?: string;
  birthOrder?: number; // 1: First born, 2: Second born...
  birthOrderStatus?: 'confirmed' | 'provisional' | 'unavailable';
  verificationStatus: 'verified_audit_record' | 'census_pending' | 'unverified' | 'pending_approval' | 'approved' | 'rejected';
  biography?: Record<Language, string>;
  note?: Record<Language, string>;
  reportedFamilyCount15Plus?: number;
  orderNumber?: number;
  profileImage?: string;
  isPendingContribution?: boolean;
  contributorNotes?: string;
}

export interface ProposedChildSubmission {
  id: string;
  fullName: string;
  gender: 'male' | 'female' | 'unspecified';
  birthYear?: string;
  birthOrder?: number;
  motherName?: string;
  notes?: string;
}

export interface DescendantSubmission {
  id: string;
  parentId: string;
  parentName: string;
  parentGenerationLevel: number;
  branchId: string;
  branchName: string;
  children: ProposedChildSubmission[];
  contributorName?: string;
  contributorContact?: string;
  relationshipExplanation?: string;
  additionalNotes?: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'requires_clarification';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface CanvasLayoutNode {
  id: string;
  person: GenealogyPerson;
  x: number;
  y: number;
  width: number;
  height: number;
  isFocused: boolean;
  isSelected: boolean;
  isInDirectLineage: boolean;
  isSiblingCollateral: boolean;
  hasChildren: boolean;
  childrenCount: number;
  childrenExpanded: boolean;
  hasSiblings: boolean;
  siblingsCount: number;
  siblingsExpanded: boolean;
  hasParents: boolean;
  generationLevel: number;
  clickCycleState: number; // 0: initial, 1: both, 2: siblings, 3: descendants
  isPendingVerification?: boolean;
}

export interface CanvasConnectionLine {
  id: string;
  fromId: string;
  toId: string;
  type: 'parent-child' | 'sibling' | 'lineage';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  midY: number;
  isDirectLineage: boolean;
  isPending?: boolean;
}
