/**
 * ARCHIVED GENERATIONS BACKUP & REVERSIBLE MIGRATION RECORD
 * Preserves previously created Level 3, Level 4, and Level 5 genealogical records
 * that have been cleared from active verified genealogy per Project Governance instructions.
 *
 * Current Verified Family Tree Scope:
 * - Level 0: NYANGE RADJABU (Patriarch)
 * - Level 1: Sons and Daughters (8 Documented Branches)
 * - Level 2: 82 Named Grandchildren from Official Audit PDF
 *
 * The records below are preserved for future reactivation when field census submissions
 * and elder council verification are officially completed.
 */

import { GenealogyPerson, DescendantSubmission } from '../types';

export const ARCHIVED_LEVEL_3_TO_5_RECORDS: GenealogyPerson[] = [
  // Level 3 ancestors under Bizimungu Saidi (Row 1 of Mselem Branch)
  {
    id: 'mem-uwabato-grandfather',
    fullName: 'Al-Hajj Uwabato Mselem',
    gender: 'male',
    generationLevel: 3,
    branchId: 'branch-mselem',
    branchName: 'Mselem Rajabu Family',
    fatherId: 'gc-mselem-1',
    birthOrder: 1,
    birthOrderStatus: 'confirmed',
    location: 'Kamembe, Rwanda',
    verificationStatus: 'unverified',
    note: {
      en: 'Archived Level 3 record. Preserved for future census verification.',
      sw: 'Kumbukumbu ya ngazi ya 3 iliyohifadhiwa kwa uthibitisho wa baadaye.',
      rw: 'Inyandiko y’urwego rwa 3 yabitswe kugira ngo izemeze mu gihe kiri imbere.'
    }
  },
  {
    id: 'mem-uwabato-gf-brother-1',
    fullName: 'Shaban Uwabato Mselem',
    gender: 'male',
    generationLevel: 3,
    branchId: 'branch-mselem',
    branchName: 'Mselem Rajabu Family',
    fatherId: 'gc-mselem-1',
    birthOrder: 2,
    birthOrderStatus: 'confirmed',
    location: 'Kamembe, Rwanda / Bukavu',
    verificationStatus: 'unverified'
  },
  {
    id: 'mem-uwabato-gf-sister-1',
    fullName: 'Khadidja Uwabato Mselem',
    gender: 'female',
    generationLevel: 3,
    branchId: 'branch-mselem',
    branchName: 'Mselem Rajabu Family',
    fatherId: 'gc-mselem-1',
    birthOrder: 3,
    birthOrderStatus: 'confirmed',
    location: 'Bujumbura, Burundi',
    verificationStatus: 'unverified'
  },

  // Level 4 ancestors
  {
    id: 'mem-uwabato-father',
    fullName: 'Uwabato Rajabu',
    gender: 'male',
    generationLevel: 4,
    branchId: 'branch-mselem',
    branchName: 'Mselem Rajabu Family',
    fatherId: 'mem-uwabato-grandfather',
    birthOrder: 1,
    birthOrderStatus: 'confirmed',
    location: 'Kamembe, Rwanda / Kigali',
    verificationStatus: 'unverified'
  },
  {
    id: 'mem-uwabato-father-sister',
    fullName: 'Amina Uwabato Rajabu',
    gender: 'female',
    generationLevel: 4,
    branchId: 'branch-mselem',
    branchName: 'Mselem Rajabu Family',
    fatherId: 'mem-uwabato-grandfather',
    birthOrder: 2,
    birthOrderStatus: 'confirmed',
    location: 'Kamembe, Rwanda',
    verificationStatus: 'unverified'
  },
  {
    id: 'mem-gf-brother-child-1',
    fullName: 'Rashid Shaban Uwabato',
    gender: 'male',
    generationLevel: 4,
    branchId: 'branch-mselem',
    branchName: 'Mselem Rajabu Family',
    fatherId: 'mem-uwabato-gf-brother-1',
    birthOrder: 1,
    birthOrderStatus: 'confirmed',
    location: 'Bukavu, DR Congo / Kamembe',
    verificationStatus: 'unverified'
  },
  {
    id: 'mem-gf-brother-child-2',
    fullName: 'Zainab Shaban Uwabato',
    gender: 'female',
    generationLevel: 4,
    branchId: 'branch-mselem',
    branchName: 'Mselem Rajabu Family',
    fatherId: 'mem-uwabato-gf-brother-1',
    birthOrder: 2,
    birthOrderStatus: 'confirmed',
    location: 'Kamembe, Rwanda',
    verificationStatus: 'unverified'
  },

  // Level 5 descendants
  {
    id: 'mem-nadjibullah-uwabato',
    fullName: 'Nadjibullah UWABATO',
    gender: 'male',
    generationLevel: 5,
    branchId: 'branch-mselem',
    branchName: 'Mselem Rajabu Family',
    fatherId: 'mem-uwabato-father',
    birthOrder: 1,
    birthOrderStatus: 'confirmed',
    location: 'Kigali, Rwanda / Kamembe',
    verificationStatus: 'unverified'
  },
  {
    id: 'mem-nadjibullah-sibling-1',
    fullName: 'Bilal Uwabato',
    gender: 'male',
    generationLevel: 5,
    branchId: 'branch-mselem',
    branchName: 'Mselem Rajabu Family',
    fatherId: 'mem-uwabato-father',
    birthOrder: 2,
    birthOrderStatus: 'confirmed',
    location: 'Kigali, Rwanda',
    verificationStatus: 'unverified'
  },
  {
    id: 'mem-gf-brother-grandchild-1',
    fullName: 'Hamza Rashid Shaban',
    gender: 'male',
    generationLevel: 5,
    branchId: 'branch-mselem',
    branchName: 'Mselem Rajabu Family',
    fatherId: 'mem-gf-brother-child-1',
    birthOrder: 1,
    birthOrderStatus: 'provisional',
    location: 'Kigali, Rwanda',
    verificationStatus: 'unverified'
  }
];

export const ARCHIVED_SAMPLE_SUBMISSION: DescendantSubmission = {
  id: 'sub-sample-001',
  parentId: 'gc-kwiriha-4',
  parentName: 'Kibogora Hassan',
  parentGenerationLevel: 2,
  branchId: 'branch-kwiriha',
  branchName: 'Kwiriha Sudi Rajabu Family',
  children: [
    {
      id: 'prop-kibogora-1',
      fullName: 'Hassan Kibogora Jr.',
      gender: 'male',
      birthYear: '1998',
      birthOrder: 1,
      notes: 'First-born son residing in Kamembe'
    },
    {
      id: 'prop-kibogora-2',
      fullName: 'Fatuma Kibogora Hassan',
      gender: 'female',
      birthYear: '2001',
      birthOrder: 2,
      notes: 'Second-born daughter'
    }
  ],
  contributorName: 'Family Archival Contributor',
  contributorContact: 'confidential@family.org',
  relationshipExplanation: 'Recorded during field census in Kamembe sector',
  additionalNotes: 'Preserved in archive',
  status: 'pending_approval',
  submittedAt: new Date().toISOString()
};
