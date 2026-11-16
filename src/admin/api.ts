import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  type WriteBatch,
} from 'firebase/firestore/lite';
import { buildSeedPersons } from '../data/seed';
import { clean } from '../lib/sanitize';
import { db } from '../lib/firebase';
import type { Person, SiteContent } from '../lib/types';
import type { AdminSession } from './auth';

/**
 * All administrator writes go through here. Every change is committed in one
 * atomic batch together with an append-only audit-log entry, and the security
 * rules re-check the administrator's role and the data shape on the server.
 */

export type ReviewCollection = 'submissions' | 'notifications' | 'messages';

function log(batch: WriteBatch, s: AdminSession, action: string, targetType: string, targetId: string, summary: string) {
  batch.set(doc(collection(db, 'auditLog')), {
    action,
    targetType,
    targetId: targetId.slice(0, 160),
    summary: summary.slice(0, 1000),
    actorUid: s.user.uid,
    actorEmail: s.email.slice(0, 200),
    at: serverTimestamp(),
  });
}

/** Firestore document data for a person (no id, only allowed fields, never undefined). */
export function personData(p: Omit<Person, 'id'>, s: AdminSession) {
  const data = clean(
    {
      fullName: p.fullName,
      kind: p.kind,
      gender: p.gender,
      parentId: p.parentId,
      parentRole: p.parentRole,
      parentLinkStatus: p.parentLinkStatus,
      otherParentName: p.otherParentName,
      status: p.status,
      birthYear: p.birthYear,
      deathYear: p.deathYear,
      location: p.location,
      note: p.note,
      sourceRef: p.sourceRef,
      branchId: p.branchId,
      descendantsStatus: p.descendantsStatus,
    },
    { fullName: 160, otherParentName: 160, birthYear: 12, deathYear: 12, location: 160, note: 2000, sourceRef: 300, branchId: 128 },
  ) as Record<string, unknown>;
  data.generation = Math.trunc(p.generation);
  if (typeof p.isLiving === 'boolean') data.isLiving = p.isLiving;
  for (const k of ['reportedCount15Plus', 'reportOrder', 'birthOrder'] as const) {
    const v = p[k];
    if (typeof v === 'number' && Number.isFinite(v)) data[k] = Math.trunc(v);
  }
  data.updatedAt = serverTimestamp();
  data.updatedBy = s.user.uid;
  return data;
}

/**
 * Create or update a person. When a person moves to another generation (new
 * parent), `descendants` carries their descendants with corrected generations so
 * the whole branch stays consistent in the same atomic write.
 */
export async function savePerson(s: AdminSession, id: string | null, p: Omit<Person, 'id'>, descendants: Person[] = []): Promise<string> {
  if (descendants.length > 400) throw Object.assign(new Error('too many'), { code: 'too-many' });
  const batch = writeBatch(db);
  const ref = id ? doc(db, 'persons', id) : doc(collection(db, 'persons'));
  batch.set(ref, personData(p, s));
  for (const d of descendants) {
    const { id: did, ...rest } = d;
    batch.set(doc(db, 'persons', did), personData(rest, s));
  }
  log(batch, s, id ? 'person.update' : 'person.create', 'person', ref.id, `${p.fullName}${descendants.length ? ` (+${descendants.length} descendants re-numbered)` : ''}`);
  await batch.commit();
  return ref.id;
}

/** Add several children under one parent in a single atomic save. */
export async function addChildren(s: AdminSession, parent: Person, children: Omit<Person, 'id'>[]): Promise<string[]> {
  const batch = writeBatch(db);
  const ids: string[] = [];
  for (const c of children) {
    const ref = doc(collection(db, 'persons'));
    ids.push(ref.id);
    batch.set(ref, personData(c, s));
  }
  log(batch, s, 'person.addChildren', 'person', parent.id, `${children.length} added under ${parent.fullName}: ${children.map((c) => c.fullName).join(', ')}`);
  await batch.commit();
  return ids;
}

export async function deletePerson(s: AdminSession, p: Person): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'persons', p.id));
  log(batch, s, 'person.delete', 'person', p.id, p.fullName);
  await batch.commit();
}

export async function countPersonsInDb(): Promise<number> {
  const snap = await getDocs(query(collection(db, 'persons'), limit(1)));
  return snap.size;
}

/** One-time import of the census-report registry (Levels 0–2) into Firestore. */
export async function importSeed(s: AdminSession): Promise<number> {
  const persons = buildSeedPersons();
  const batch = writeBatch(db);
  for (const p of persons) {
    const { id, ...rest } = p;
    batch.set(doc(db, 'persons', id), personData(rest, s));
  }
  log(batch, s, 'registry.import', 'registry', 'seed', `Imported ${persons.length} records from the preliminary census report`);
  await batch.commit();
  return persons.length;
}

export interface ReviewItem {
  id: string;
  status: string;
  createdAt?: { toDate: () => Date };
  reviewedAt?: { toDate: () => Date };
  reviewNote?: string;
  [k: string]: unknown;
}

export async function listReview(col: ReviewCollection): Promise<ReviewItem[]> {
  const snap = await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(300)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ReviewItem);
}

function reviewFields(s: AdminSession, status: string, note?: string) {
  const f: Record<string, unknown> = { status, reviewedAt: serverTimestamp(), reviewedBy: s.user.uid };
  if (note && note.trim()) f.reviewNote = note.trim().slice(0, 1000);
  return f;
}

export async function setReviewStatus(s: AdminSession, col: ReviewCollection, item: ReviewItem, status: string, note?: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, col, item.id), reviewFields(s, status, note));
  log(batch, s, `${col}.${status}`, col, item.id, `${String(item.receiptCode ?? item.id)}${note ? ` — ${note}` : ''}`);
  await batch.commit();
}

/** Approve a claim / new-member notice: create the people and mark the item approved, atomically. */
export async function approveWithPersons(
  s: AdminSession,
  col: 'submissions' | 'notifications',
  item: ReviewItem,
  persons: Omit<Person, 'id'>[],
  note?: string,
): Promise<string[]> {
  const batch = writeBatch(db);
  const ids: string[] = [];
  for (const p of persons) {
    const ref = doc(collection(db, 'persons'));
    ids.push(ref.id);
    batch.set(ref, personData(p, s));
    log(batch, s, 'person.create', 'person', ref.id, `${p.fullName} (from ${String(item.receiptCode ?? item.id)})`);
  }
  batch.update(doc(db, col, item.id), { ...reviewFields(s, 'approved', note), ...(col === 'submissions' ? { createdPersonIds: ids } : {}) });
  log(batch, s, `${col}.approved`, col, item.id, `${String(item.receiptCode ?? item.id)}: ${persons.length} added to the family tree`);
  await batch.commit();
  return ids;
}

export async function deleteReviewItem(s: AdminSession, col: ReviewCollection, item: ReviewItem) {
  const batch = writeBatch(db);
  batch.delete(doc(db, col, item.id));
  log(batch, s, `${col}.delete`, col, item.id, String(item.receiptCode ?? item.id));
  await batch.commit();
}

export async function saveContent(s: AdminSession, content: SiteContent) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'content', 'site'), { ...JSON.parse(JSON.stringify(content)), updatedAt: serverTimestamp(), updatedBy: s.user.uid });
  log(batch, s, 'content.update', 'content', 'site', 'Website content updated');
  await batch.commit();
}

export interface AdminRecord {
  uid: string;
  email: string;
  displayName?: string;
  role: 'superadmin' | 'editor' | 'reviewer';
  active: boolean;
}

export async function listAdmins(): Promise<AdminRecord[]> {
  const snap = await getDocs(collection(db, 'admins'));
  return snap.docs.map((d) => {
    const data = d.data();
    const role = data.role === 'superadmin' || data.role === 'editor' ? data.role : 'reviewer';
    return { uid: d.id, email: data.email ?? '', displayName: data.displayName, role, active: data.active !== false };
  });
}

export async function saveAdmin(s: AdminSession, a: AdminRecord) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'admins', a.uid), {
    email: a.email.trim(),
    ...(a.displayName?.trim() ? { displayName: a.displayName.trim() } : {}),
    role: a.role,
    active: a.active,
    addedAt: new Date().toISOString(),
    addedBy: s.user.uid,
  });
  log(batch, s, 'admin.save', 'admin', a.uid, `${a.email} → ${a.role}${a.active ? '' : ' (inactive)'}`);
  await batch.commit();
}

export async function removeAdmin(s: AdminSession, a: AdminRecord) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'admins', a.uid));
  log(batch, s, 'admin.remove', 'admin', a.uid, a.email);
  await batch.commit();
}

export interface AuditEntry {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  actorEmail: string;
  at?: { toDate: () => Date };
}

export async function listAudit(): Promise<AuditEntry[]> {
  const snap = await getDocs(query(collection(db, 'auditLog'), orderBy('at', 'desc'), limit(200)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditEntry, 'id'>) }));
}

