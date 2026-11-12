import { GenealogyPerson, DescendantSubmission, ProposedChildSubmission, Language } from '../types';
import { ALL_GRANDCHILDREN } from './grandchildrenData';
import { FAMILY_BRANCHES, PATRIARCH_INFO } from './familyData';
import { 
  saveSubmissionToFirestore, 
  updateSubmissionInFirestore, 
  deleteSubmissionFromFirestore, 
  subscribeToSubmissions 
} from '../firebase';

/**
 * AUTHORITATIVE THREE-GENERATION FOUNDATION AND EXTENDED RELATIONAL DATABASE
 * Level 0: NYANGE RADJABU (Patriarch)
 * Level 1: Sons and Daughters (8 Documented Sections + 7 Pending)
 * Level 2: 82 Named Grandchildren from Official Audit PDF
 * Level 3+: Verified consecutive descendants (including Bizimungu Saidi's lineage)
 * Plus dynamic community census submissions with pending approval & yellow border styling
 */

export const ROOT_PATRIARCH_ID = 'nr-root-0';

// Initialize Level 0 Patriarch
const patriarchRecord: GenealogyPerson = {
  id: ROOT_PATRIARCH_ID,
  fullName: 'NYANGE RADJABU',
  gender: 'male',
  generationLevel: 0,
  branchId: 'patriarch-root',
  branchName: 'Original Family Patriarch',
  isPatriarch: true,
  isDeceased: true,
  birthOrder: 1,
  birthOrderStatus: 'confirmed',
  location: 'Kamembe, Rwanda & Burundi',
  verificationStatus: 'verified_audit_record',
  biography: PATRIARCH_INFO.biography,
  note: {
    en: 'Level 0 Lineage Patriarch. Root founder of all family branches.',
    sw: 'Babu wa Nasaba Ngazi ya 0. Mwanzilishi wa familia zote.',
    rw: 'Umukurambere w’Igisekuru ku rwego rwa 0. Inkomoko y’imiryango yose.'
  }
};

// Level 1 Sons and Daughters (8 Documented Sections)
const level1Records: GenealogyPerson[] = FAMILY_BRANCHES.map((b, idx) => ({
  id: b.id,
  fullName: b.name,
  gender: b.id.includes('mariam') || b.id.includes('mama-omari') ? 'female' : 'male',
  generationLevel: 1,
  branchId: b.id,
  branchName: b.name,
  fatherId: ROOT_PATRIARCH_ID,
  location: b.primaryLocation,
  verificationStatus: 'verified_audit_record',
  reportedFamilyCount15Plus: b.reportedCount15Plus,
  orderNumber: parseInt(b.code.replace('BR-', ''), 10),
  birthOrder: idx + 1,
  birthOrderStatus: 'provisional',
  note: {
    en: `Level 1 child branch of Babu Nyange Radjabu. ${b.reportedCount15Plus} recorded members aged 15+.`,
    sw: `Tawi la ngazi ya 1 la mtoto wa Babu Nyange Radjabu. Wanachama ${b.reportedCount15Plus} waliorekodiwa wenye miaka 15+.`,
    rw: `Igice cyo ku rwego rwa 1 cy’umwana wa Babu Nyange Radjabu. Abanyamuryango ${b.reportedCount15Plus} bafite imyaka 15+.`
  }
}));

// Level 2 Grandchildren (All 82 Documented Entries from PDF)
const level2Records: GenealogyPerson[] = ALL_GRANDCHILDREN.map((gc) => ({
  id: gc.id,
  fullName: gc.fullName,
  gender: 'unspecified',
  generationLevel: 2,
  branchId: gc.branchId,
  branchName: gc.branchName,
  fatherId: gc.branchId.includes('mariam') || gc.branchId.includes('mama-omari') ? undefined : gc.branchId,
  motherId: gc.branchId.includes('mariam') || gc.branchId.includes('mama-omari') ? gc.branchId : undefined,
  reportedFamilyCount15Plus: gc.reportedFamilyCount15Plus,
  orderNumber: gc.orderNumber,
  birthOrder: gc.orderNumber,
  birthOrderStatus: 'provisional',
  verificationStatus: 'verified_audit_record',
  location: gc.location || 'Kamembe, Rwanda',
  note: {
    en: `Level 2 grandchild of Babu Nyange Radjabu, registered in official audit section ${gc.branchName}.`,
    sw: `Mjukuu ngazi ya 2 wa Babu Nyange Radjabu, aliyesajiliwa katika ukaguzi rasmi wa ${gc.branchName}.`,
    rw: `Umwuzukuru ku rwego rwa 2 wa Babu Nyange Radjabu, wanditse mu gice cya ${gc.branchName}.`
  }
}));

// Base static verified family members (Strictly Level 0 to Level 2 per Project Scope)
// Level 0: 1 Patriarch (NYANGE RADJABU)
// Level 1: 8 Documented Sons & Daughters
// Level 2: 82 Named Grandchildren from Official Audit PDF
export const BASE_STATIC_PERSONS: GenealogyPerson[] = [
  patriarchRecord,
  ...level1Records,
  ...level2Records
];

// ----------------------------------------------------------------------
// COMMUNITY SUBMISSIONS & PENDING WORKFLOW MANAGEMENT (LOCALSTORAGE)
// ----------------------------------------------------------------------

const COMMUNITY_SUBMISSIONS_KEY = 'nyange_community_census_submissions_v3';

export const getCommunitySubmissions = (): DescendantSubmission[] => {
  try {
    const raw = localStorage.getItem(COMMUNITY_SUBMISSIONS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveCommunitySubmissions = (submissions: DescendantSubmission[]): void => {
  try {
    localStorage.setItem(COMMUNITY_SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch {
    // ignore storage error
  }
};

export const addCommunitySubmission = (
  data: Omit<DescendantSubmission, 'id' | 'status' | 'submittedAt'>
): DescendantSubmission => {
  const submissions = getCommunitySubmissions();
  const newSub: DescendantSubmission = {
    ...data,
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending_approval',
    submittedAt: new Date().toISOString()
  };
  submissions.unshift(newSub);
  saveCommunitySubmissions(submissions);

  // Sync to Firestore cloud database
  saveSubmissionToFirestore(newSub).catch((err) => {
    console.warn('[Firebase] Background sync warning:', err);
  });

  return newSub;
};

export const approveCommunitySubmission = (
  submissionId: string,
  reviewedBy: string = 'Family Archival Council'
): boolean => {
  const submissions = getCommunitySubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index === -1) return false;

  const now = new Date().toISOString();
  submissions[index].status = 'approved';
  submissions[index].reviewedAt = now;
  submissions[index].reviewedBy = reviewedBy;
  saveCommunitySubmissions(submissions);

  // Sync approval to Firestore
  updateSubmissionInFirestore(submissionId, {
    status: 'approved',
    reviewedAt: now,
    reviewedBy: reviewedBy
  }).catch((err) => {
    console.warn('[Firebase] Background approval sync warning:', err);
  });

  return true;
};

export const rejectCommunitySubmission = (
  submissionId: string,
  reviewedBy: string = 'Family Archival Council'
): boolean => {
  const submissions = getCommunitySubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index === -1) return false;

  const now = new Date().toISOString();
  submissions[index].status = 'rejected';
  submissions[index].reviewedAt = now;
  submissions[index].reviewedBy = reviewedBy;
  saveCommunitySubmissions(submissions);

  // Sync rejection to Firestore
  updateSubmissionInFirestore(submissionId, {
    status: 'rejected',
    reviewedAt: now,
    reviewedBy: reviewedBy
  }).catch((err) => {
    console.warn('[Firebase] Background rejection sync warning:', err);
  });

  return true;
};

export const deleteCommunitySubmission = (submissionId: string): void => {
  const submissions = getCommunitySubmissions();
  const filtered = submissions.filter((s) => s.id !== submissionId);
  saveCommunitySubmissions(filtered);

  // Sync deletion to Firestore
  deleteSubmissionFromFirestore(submissionId).catch((err) => {
    console.warn('[Firebase] Background deletion sync warning:', err);
  });
};

// Real-time synchronization listener with Firestore database
if (typeof window !== 'undefined') {
  try {
    subscribeToSubmissions(
      (remoteSubs) => {
        if (Array.isArray(remoteSubs) && remoteSubs.length > 0) {
          saveCommunitySubmissions(remoteSubs);
          window.dispatchEvent(new CustomEvent('nyange-submissions-updated'));
        }
      },
      (err) => {
        console.warn('[Firebase] Remote subscription listener note:', err);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Initialization subscriber note:', err);
  }
}

export const getPendingSubmissionsCount = (): number => {
  return getCommunitySubmissions().filter((s) => s.status === 'pending_approval').length;
};

/**
 * Combines approved static records with community submissions (pending or approved)
 */
export const getAllGenealogyPersons = (): GenealogyPerson[] => {
  const basePersons = [...BASE_STATIC_PERSONS];
  const submissions = getCommunitySubmissions();

  submissions.forEach((sub) => {
    // Only show pending or approved submissions (exclude rejected)
    if (sub.status === 'rejected') return;

    const isPending = sub.status === 'pending_approval';

    sub.children.forEach((child, childIdx) => {
      const personId = `comm-${sub.id}-${child.id || childIdx}`;
      // Do not duplicate if already present
      if (basePersons.some((p) => p.id === personId)) return;

      basePersons.push({
        id: personId,
        fullName: child.fullName,
        gender: child.gender || 'unspecified',
        generationLevel: sub.parentGenerationLevel + 1,
        branchId: sub.branchId,
        branchName: sub.branchName,
        fatherId: sub.parentId,
        birthYear: child.birthYear,
        birthOrder: child.birthOrder || childIdx + 1,
        birthOrderStatus: child.birthOrder ? 'confirmed' : 'provisional',
        verificationStatus: isPending ? 'pending_approval' : 'verified_audit_record',
        isPendingContribution: isPending,
        contributorNotes: child.notes || sub.additionalNotes,
        note: {
          en: isPending
            ? `Proposed descendant of ${sub.parentName}. [PENDING VERIFICATION - Awaiting Council Approval]`
            : `Verified descendant of ${sub.parentName} approved into official registry.`,
          sw: isPending
            ? `Mzao anayependekezwa wa ${sub.parentName}. [INASUBIRI UKAGUZI - Haijathibitishwa rasmi]`
            : `Mzao aliyethibitishwa wa ${sub.parentName}.`,
          rw: isPending
            ? `Umunyamuryango watanzwe ukomoka kuri ${sub.parentName}. [BITEGEREJE KWEMEZWA]`
            : `Umukomokambere wemejwe ukomoka kuri ${sub.parentName}.`
        }
      });
    });
  });

  return basePersons;
};

// ----------------------------------------------------------------------
// GRAPH RELATIONSHIP RESOLUTION UTILITIES
// ----------------------------------------------------------------------

export const getPersonById = (id: string): GenealogyPerson | undefined => {
  const all = getAllGenealogyPersons();
  return all.find((p) => p.id === id);
};

export const getParents = (id: string): { father?: GenealogyPerson; mother?: GenealogyPerson } => {
  const person = getPersonById(id);
  if (!person) return {};
  const father = person.fatherId ? getPersonById(person.fatherId) : undefined;
  const mother = person.motherId ? getPersonById(person.motherId) : undefined;
  return { father, mother };
};

export const getChildren = (id: string): GenealogyPerson[] => {
  const all = getAllGenealogyPersons();
  return all.filter((p) => p.fatherId === id || p.motherId === id);
};

export const getSiblings = (id: string): GenealogyPerson[] => {
  const person = getPersonById(id);
  if (!person) return [];
  const all = getAllGenealogyPersons();

  return all
    .filter((p) => {
      if (p.id === id) return false;
      const sharesFather = person.fatherId && p.fatherId && p.fatherId === person.fatherId;
      const sharesMother = person.motherId && p.motherId && p.motherId === person.motherId;
      return Boolean(sharesFather || sharesMother);
    })
    .sort((a, b) => {
      // Sort by confirmed/provisional birth order
      const orderA = a.birthOrder ?? a.orderNumber ?? 999;
      const orderB = b.birthOrder ?? b.orderNumber ?? 999;
      return orderA - orderB;
    });
};

/**
 * Returns ascending chain of direct ancestors back to Level 0 NYANGE RADJABU
 */
export const getDirectLineageAncestors = (id: string): GenealogyPerson[] => {
  const ancestors: GenealogyPerson[] = [];
  let current = getPersonById(id);

  while (current) {
    ancestors.unshift(current);
    if (current.id === ROOT_PATRIARCH_ID) break;

    const parentId = current.fatherId || current.motherId;
    if (!parentId) break;
    current = getPersonById(parentId);
  }

  return ancestors;
};

/**
 * Calculates relationship title relative to the focused person
 */
export const getRelationshipToFocused = (
  target: GenealogyPerson,
  focused: GenealogyPerson
): string => {
  if (target.id === focused.id) return 'Self (Focused)';
  if (target.id === ROOT_PATRIARCH_ID) return 'Original Patriarch';

  if (focused.fatherId === target.id) return 'Father';
  if (focused.motherId === target.id) return 'Mother';

  if (target.fatherId === focused.id || target.motherId === focused.id) {
    return target.gender === 'female' ? 'Daughter' : target.gender === 'male' ? 'Son' : 'Child';
  }

  const siblings = getSiblings(focused.id);
  if (siblings.some((s) => s.id === target.id)) {
    return target.gender === 'female' ? 'Sister' : target.gender === 'male' ? 'Brother' : 'Sibling';
  }

  const ancestors = getDirectLineageAncestors(focused.id);
  const ancestorIndex = ancestors.findIndex((a) => a.id === target.id);
  if (ancestorIndex !== -1) {
    const diff = focused.generationLevel - target.generationLevel;
    if (diff === 1) return target.gender === 'female' ? 'Mother' : 'Father';
    if (diff === 2) return target.gender === 'female' ? 'Grandmother' : 'Grandfather';
    if (diff === 3) return 'Great-Grandparent';
    if (diff === 4) return 'Great-Great-Grandparent';
    return `Direct Ancestor (L${target.generationLevel})`;
  }

  if (target.generationLevel > focused.generationLevel) {
    const diff = target.generationLevel - focused.generationLevel;
    if (diff === 1) return target.gender === 'female' ? 'Daughter' : 'Son';
    if (diff === 2) return 'Grandchild';
    if (diff === 3) return 'Great-Grandchild';
    return `Descendant (L${target.generationLevel})`;
  }

  for (const anc of ancestors) {
    const ancSiblings = getSiblings(anc.id);
    if (ancSiblings.some((s) => s.id === target.id)) {
      if (anc.generationLevel === focused.generationLevel - 1) {
        return target.gender === 'female' ? 'Paternal Aunt' : 'Paternal Uncle';
      }
      if (anc.generationLevel === focused.generationLevel - 2) {
        return target.gender === 'female' ? 'Great-Aunt' : 'Great-Uncle';
      }
      return `Collateral Ancestor (L${target.generationLevel})`;
    }
  }

  if (target.generationLevel === focused.generationLevel) {
    return 'Cousin (Same Generation)';
  }

  return `Extended Lineage (L${target.generationLevel})`;
};

/**
 * Universal search covering all persons including pending contributions
 */
export const searchGenealogyPersons = (
  query: string,
  branchFilter: string = 'all',
  generationFilter: string = 'all'
): GenealogyPerson[] => {
  const cleanQ = query.trim().toLowerCase();
  const all = getAllGenealogyPersons();

  return all.filter((p) => {
    const matchesQuery =
      cleanQ === '' ||
      p.fullName.toLowerCase().includes(cleanQ) ||
      p.branchName.toLowerCase().includes(cleanQ) ||
      (p.location && p.location.toLowerCase().includes(cleanQ));

    const matchesBranch = branchFilter === 'all' || p.branchId === branchFilter;
    const matchesGen =
      generationFilter === 'all' || p.generationLevel.toString() === generationFilter;

    return matchesQuery && matchesBranch && matchesGen;
  });
};
