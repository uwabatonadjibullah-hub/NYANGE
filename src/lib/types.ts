export type Language = 'en' | 'sw' | 'rw';

export type Gender = 'male' | 'female' | 'unknown';

/** How sure the family is about a record. "listed" = named in the 2026 preliminary report only. */
export type RecordStatus = 'listed' | 'verified' | 'unconfirmed';

/**
 * One node of the family registry. Each person descends from NYANGE RADJABU
 * through exactly one lineage parent (`parentId`). The other parent, who may
 * come from outside the family, is kept as free text (`otherParentName`).
 */
export interface Person {
  id: string;
  fullName: string;
  /** "family_section" = a heading from the census report whose individual is not yet confirmed. */
  kind: 'person' | 'family_section';
  gender: Gender;
  /** 0 = NYANGE RADJABU, 1 = children, 2 = grandchildren, ... */
  generation: number;
  parentId?: string;
  parentRole?: 'father' | 'mother' | 'unknown';
  parentLinkStatus?: 'confirmed' | 'unconfirmed';
  otherParentName?: string;
  status: RecordStatus;
  /** undefined = unknown. Living people never show birth year or location publicly. */
  isLiving?: boolean;
  birthYear?: string;
  deathYear?: string;
  location?: string;
  note?: string;
  /** Number of members aged 15+ reported for this household in the census report. */
  reportedCount15Plus?: number;
  sourceRef?: string;
  /** Row order in the source report. Used for sorting only, never shown as birth order. */
  reportOrder?: number;
  /** Only set when the family has confirmed the birth order. */
  birthOrder?: number;
  branchId?: string;
  /** "none_confirmed" is set by an administrator only. Missing records always mean "unknown". */
  descendantsStatus?: 'unknown' | 'none_confirmed';
}

export interface ChildProposal {
  fullName: string;
  gender?: Gender;
  birthYear?: string;
  otherParentName?: string;
  notes?: string;
}

export type NoticeType = 'bereavement' | 'announcement' | 'new_member';

export interface LocalizedText {
  en?: string;
  sw?: string;
  rw?: string;
}

export interface GalleryItem {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  year?: string;
  imageUrl?: string;
  credit?: string;
}

export interface DonationChannel {
  name: string;
  accountName?: string;
  number?: string;
  notes?: string;
}

export interface SiteContent {
  announcement: { active: boolean; text: LocalizedText };
  biography: LocalizedText;
  contact: { phone?: string; email?: string; whatsapp?: string; address?: string };
  donation: { enabled: boolean; intro: LocalizedText; channels: DonationChannel[] };
  gallery: GalleryItem[];
}
