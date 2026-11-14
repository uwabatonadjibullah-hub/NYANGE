import type { Person } from '../lib/types';

/**
 * Initial registry transcribed from the family's preliminary census report:
 *   "RIPOTI YA IDADI YA FAMILIA ZA BABU NYANGE RAJABU — TOLEO LA UKAGUZI — Miaka 15+"
 *
 * Rules applied (see README, section 5):
 *  - Names are kept exactly as transcribed.
 *  - The 8 report sections are stored as "family_section" records whose link to
 *    NYANGE RADJABU is "unconfirmed" until the family confirms each individual.
 *  - No gender, birth order, location or verification is invented.
 *  - Missing per-household counts stay undefined (never zero).
 *
 * This file is only used (1) as a fallback before the registry is imported into
 * Firestore and (2) by the admin "Import initial registry" action.
 */

export const ROOT_ID = 'nr-root-0';
export const REPORT_TITLE = 'RIPOTI YA IDADI YA FAMILIA ZA BABU NYANGE RAJABU — TOLEO LA UKAGUZI — Miaka 15+';
export const REPORTED_TOTAL_15_PLUS = 398;
export const PENDING_FAMILIES_COUNT = 7;

export interface ReportSection {
  id: string;
  name: string;
  reportedCount15Plus: number;
  /** [name as written in the report, household count aged 15+ or null when not given] */
  households: [string, number | null][];
}

export const REPORT_SECTIONS: ReportSection[] = [
  {
    id: 'branch-kwiriha', name: 'Kwiriha Sudi Rajabu Family', reportedCount15Plus: 32,
    households: [['Rehema Sudi', 10], ['Wamariya', 3], ['Katitanga Ali', 2], ['Kibogora Hassan', 4], ['Huseni Sudi', 5], ['Kalindi Ahmed', 3], ['Nyange Djuma', 3], ['Uwimana Hawa', 2]],
  },
  {
    id: 'branch-mselem', name: 'Mselem Rajabu Family', reportedCount15Plus: 116,
    households: [['Bizimungu Saidi', 23], ['Sofia Mselem', 6], ['Idrisa Mselem', 6], ['Issa Mselem', 4], ['Asha Mselem', 7], ['Zena Mselem', 6], ['Kayitsinga Abdallah Mselem', 12], ['Nizari Mselem', 7], ['Mahsein Mselem', 6], ['Johari Mselem', 5], ['Hawa Mselem', 4], ['Hidaya Mselem', 7], ['Adam Mselem', 3], ['Madina Mselem', 5], ['Africa Mselem', 4], ['Selemani Mselem', 1], ['Kanyange Z Mselem', 5], ['Qulthum Mselem', 4], ['Hajji N Mselem', 1], ['Khuzaima Mselem', 4], ['Abdou Mselem', 1], ['Mariam Mselem', 4], ['Mansour Mselem', 1]],
  },
  {
    id: 'branch-mama-omari', name: 'Mama Omari Rajabu Family', reportedCount15Plus: 8,
    households: [['Musa', 5], ['Issa', 1], ['Amani', 1], ['Omari Kijiwe', 1]],
  },
  {
    id: 'branch-mariam', name: 'Mariam Rajabu Family', reportedCount15Plus: 79,
    households: [['Pili (Mama Mariam)', 8], ['Baraka Asuman', 8], ['Djuma Askani', 5], ['Idrissa Mwinyi', 4], ['Rukia Kibibi', 9], ['Banana Yussuf', 6], ['My Dear', 6], ['Rangwida Zahra', 2], ['Hawa', 5], ['Swaleh', 4], ['Haliima', 5], ['Aisha', 1], ['Farida', 4], ['Sania', 4], ['Dada Khadidja', 4], ['Salama Congo', 3]],
  },
  {
    id: 'branch-hamisi', name: 'Hamisi Rajabu Family', reportedCount15Plus: 18,
    households: [['Ismail Hamisi', 3], ['Mariamu Faina', 3], ['Zuberi Hamisi', 1], ['Rajabu Hamisi', 2], ['Saidi Hamisi', 1], ['Ramadhani Hamisi', 1], ['Usmani Hamisi', 1], ['Daudi Hamisi', 1], ['Kagimbandabo Hamisi', 1], ['Asiya Hamisi', 4]],
  },
  {
    id: 'branch-bagaragaza', name: 'Bagaragaza Saeed Miraji Family', reportedCount15Plus: 31,
    households: [['F/ Marhum Sh. RADJAB Saééd', 4], ['F/ Marhum AZIZA Saééd', 5], ['F/ Marhum BAZARA SEREKO', 6], ['F/ IDRISSA SEREKO', 7], ['F/ KAYIGEMA SAJAD', 4], ['F/ DJALIA Saééd', 4], ['HASSAN Sééd', 1]],
  },
  {
    id: 'branch-hussein', name: 'Hussein Rajabu Family', reportedCount15Plus: 6,
    households: [['Nyirarukundo Madina', 1], ['Ngabonziza Sadam', 1], ['Nshuti Hadjara', 1], ['Mutetiwabo Shamim', 1], ['Mukanyarwaya Afsa', 1], ['Achoura Hussein', 1]],
  },
  {
    id: 'branch-mugunda-tausi', name: 'Mugunda Rashid & Nyiramukarani Tausi Family', reportedCount15Plus: 108,
    households: [['Juma RASHID', null], ['Zabibu NYIRAMAGAJA', null], ['Fatuma KAMANYANA', null], ['Salima NYIRABUGINGO', null], ['Shani MUHUTU', null], ['Maisala KABAGENI', null], ['Halidi NSENGIYUMVA', null], ['Zubeda NIWEMUGORE', null]],
  },
];

const householdIdPrefix: Record<string, string> = {
  'branch-kwiriha': 'gc-kwiriha',
  'branch-mselem': 'gc-mselem',
  'branch-mama-omari': 'gc-mama-omari',
  'branch-mariam': 'gc-mariam',
  'branch-hamisi': 'gc-hamisi',
  'branch-bagaragaza': 'gc-bagaragaza',
  'branch-hussein': 'gc-hussein',
  'branch-mugunda-tausi': 'gc-mugunda',
};

export function buildSeedPersons(): Person[] {
  const persons: Person[] = [
    {
      id: ROOT_ID,
      fullName: 'NYANGE RADJABU',
      kind: 'person',
      gender: 'male',
      generation: 0,
      status: 'verified',
      isLiving: false,
      location: 'Kamembe, Rwanda; Burundi',
      branchId: 'root',
    },
  ];
  REPORT_SECTIONS.forEach((section, sIdx) => {
    persons.push({
      id: section.id,
      fullName: section.name,
      kind: 'family_section',
      gender: 'unknown',
      generation: 1,
      parentId: ROOT_ID,
      parentRole: 'unknown',
      parentLinkStatus: 'unconfirmed',
      status: 'listed',
      reportedCount15Plus: section.reportedCount15Plus,
      reportOrder: sIdx + 1,
      sourceRef: `Preliminary report (Miaka 15+), section ${sIdx + 1}`,
      branchId: section.id,
    });
    section.households.forEach(([name, count], hIdx) => {
      const p: Person = {
        id: `${householdIdPrefix[section.id]}-${hIdx + 1}`,
        fullName: name,
        kind: 'person',
        gender: 'unknown',
        generation: 2,
        parentId: section.id,
        parentRole: 'unknown',
        parentLinkStatus: 'unconfirmed',
        status: 'listed',
        reportOrder: hIdx + 1,
        sourceRef: `Preliminary report (Miaka 15+), section ${sIdx + 1}, row ${hIdx + 1}`,
        branchId: section.id,
      };
      if (count !== null) p.reportedCount15Plus = count;
      persons.push(p);
    });
  });
  return persons;
}
