import { addDoc, collection, serverTimestamp } from 'firebase/firestore/lite';
import { db } from './firebase';
import { clean, makeReceipt } from './sanitize';
import type { ChildProposal, Language, NoticeType } from './types';

/**
 * Public submissions. Each function resolves only after Firestore has accepted
 * the write, so the visitor sees a receipt only for data that was really saved.
 * Documents receive random IDs; the receipt code is a separate field and cannot
 * be used to read anything back.
 */

const MIN_INTERVAL_MS = 20_000;
let lastSubmit = 0;

function throttle() {
  const now = Date.now();
  if (now - lastSubmit < MIN_INTERVAL_MS) throw new SubmitError('too_fast');
  lastSubmit = now;
}

export class SubmitError extends Error {
  constructor(public code: 'too_fast' | 'offline' | 'rejected' | 'unknown') {
    super(code);
  }
}

function mapError(e: unknown): SubmitError {
  if (e instanceof SubmitError) return e;
  const code = (e as { code?: string })?.code ?? '';
  if (code === 'permission-denied' || code === 'invalid-argument') return new SubmitError('rejected');
  if (code === 'unavailable' || (typeof navigator !== 'undefined' && !navigator.onLine)) return new SubmitError('offline');
  return new SubmitError('unknown');
}

async function save(path: string, data: Record<string, unknown>): Promise<void> {
  try {
    // Firestore Lite resolves only once the server has accepted the write.
    await Promise.race([
      addDoc(collection(db, path), data),
      new Promise((_, reject) => setTimeout(() => reject(new SubmitError('offline')), 20_000)),
    ]);
  } catch (e) {
    lastSubmit = 0;
    throw mapError(e);
  }
}

export interface NoticeInput {
  type: NoticeType;
  senderName: string;
  senderContact: string;
  personName?: string;
  branchId?: string;
  fatherName?: string;
  motherName?: string;
  generation?: string;
  connection?: string;
  subject?: string;
  details: string;
}

export async function submitNotice(input: NoticeInput, language: Language): Promise<string> {
  throttle();
  const receiptCode = makeReceipt('NOT');
  const fields = clean(input, {
    senderName: 120, senderContact: 160, personName: 160, branchId: 128, fatherName: 160,
    motherName: 160, generation: 20, connection: 2000, subject: 200, details: 3000,
  });
  await save('notifications', { ...fields, consent: true, status: 'pending', receiptCode, language, createdAt: serverTimestamp() });
  return receiptCode;
}

export interface DescendantClaimInput {
  parentId: string;
  parentName: string;
  parentGeneration: number;
  children: ChildProposal[];
  contributorName: string;
  contributorContact: string;
  relationship?: string;
  notes?: string;
}

export async function submitDescendantClaim(input: DescendantClaimInput, language: Language): Promise<string> {
  throttle();
  const receiptCode = makeReceipt('DES');
  const children = input.children
    .map((c) => clean({ ...c }, { fullName: 120, birthYear: 12, otherParentName: 120, notes: 500 }))
    .filter((c) => c.fullName)
    .slice(0, 10);
  const fields = clean(
    { parentId: input.parentId, parentName: input.parentName, contributorName: input.contributorName, contributorContact: input.contributorContact, relationship: input.relationship, notes: input.notes },
    { parentName: 160, contributorName: 120, contributorContact: 160, relationship: 500, notes: 2000 },
  );
  await save('submissions', {
    ...fields,
    parentGeneration: input.parentGeneration,
    children,
    consent: true,
    status: 'pending',
    receiptCode,
    language,
    createdAt: serverTimestamp(),
  });
  return receiptCode;
}

export interface MessageInput {
  fullName: string;
  contact: string;
  category: 'general' | 'correction' | 'history' | 'photos' | 'other';
  branchId?: string;
  subject: string;
  message: string;
}

export async function submitMessage(input: MessageInput, language: Language): Promise<string> {
  throttle();
  const receiptCode = makeReceipt('MSG');
  const fields = clean(input, { fullName: 120, contact: 160, branchId: 128, subject: 200, message: 4000 });
  await save('messages', { ...fields, consent: true, status: 'pending', receiptCode, language, createdAt: serverTimestamp() });
  return receiptCode;
}
