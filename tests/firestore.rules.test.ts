import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;

const google = (uid: string, email = `${uid}@example.com`) => env.authenticatedContext(uid, { email, email_verified: true, firebase: { sign_in_provider: 'google.com' } } as never).firestore();
const anon = () => env.unauthenticatedContext().firestore();

const notice = (over: Record<string, unknown> = {}) => ({
  type: 'bereavement', senderName: 'Amina', senderContact: '+250788000000', personName: 'Someone', details: 'Details',
  consent: true, status: 'pending', receiptCode: 'NR-NOT-ABC234', language: 'en', createdAt: serverTimestamp(), ...over,
});
const claim = (over: Record<string, unknown> = {}) => ({
  parentId: 'gc-kwiriha-1', parentName: 'Rehema Sudi', parentGeneration: 2, children: [{ fullName: 'Child One', gender: 'female' }],
  contributorName: 'Amina', contributorContact: 'amina@example.com', consent: true, status: 'pending', receiptCode: 'NR-DES-ABC234',
  language: 'sw', createdAt: serverTimestamp(), ...over,
});
const message = (over: Record<string, unknown> = {}) => ({
  fullName: 'Amina', contact: 'amina@example.com', category: 'general', subject: 'Hello', message: 'A message here',
  consent: true, status: 'pending', receiptCode: 'NR-MSG-ABC234', language: 'rw', createdAt: serverTimestamp(), ...over,
});
const person = (uid: string, over: Record<string, unknown> = {}) => ({
  fullName: 'New Person', kind: 'person', gender: 'unknown', generation: 3, parentId: 'gc-kwiriha-1', status: 'verified',
  updatedAt: serverTimestamp(), updatedBy: uid, ...over,
});

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-nyange',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
afterAll(() => env?.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'admins', 'super'), { email: 'super@example.com', role: 'superadmin', active: true });
    await setDoc(doc(db, 'admins', 'editor'), { email: 'editor@example.com', role: 'editor', active: true });
    await setDoc(doc(db, 'admins', 'reviewer'), { email: 'reviewer@example.com', role: 'reviewer', active: true });
    await setDoc(doc(db, 'admins', 'legacy'), { email: 'legacy@example.com', role: 'council_reviewer' });
    await setDoc(doc(db, 'admins', 'retired'), { email: 'retired@example.com', role: 'editor', active: false });
    await setDoc(doc(db, 'persons', 'gc-kwiriha-1'), { fullName: 'Rehema Sudi', kind: 'person', gender: 'unknown', generation: 2, status: 'listed' });
    await setDoc(doc(db, 'content', 'site'), { biography: { en: 'Bio' } });
    await setDoc(doc(db, 'content', 'secret'), { x: 1 });
    await setDoc(doc(db, 'notifications', 'n1'), { ...notice(), createdAt: Timestamp.now() });
    await setDoc(doc(db, 'submissions', 's1'), { ...claim(), createdAt: Timestamp.now() });
    await setDoc(doc(db, 'messages', 'm1'), { ...message(), createdAt: Timestamp.now() });
  });
});

describe('public visitors', () => {
  it('can read the family registry and site content only', async () => {
    await assertSucceeds(getDocs(collection(anon(), 'persons')));
    await assertSucceeds(getDoc(doc(anon(), 'content', 'site')));
    await assertFails(getDoc(doc(anon(), 'content', 'secret')));
  });

  it('cannot read any submitted personal data, even by ID', async () => {
    for (const p of ['notifications/n1', 'submissions/s1', 'messages/m1', 'admins/super', 'auditLog/x']) {
      await assertFails(getDoc(doc(anon(), p)));
    }
    await assertFails(getDocs(collection(anon(), 'notifications')));
  });

  it('can send valid Record Me notices, claims and messages', async () => {
    await assertSucceeds(addDoc(collection(anon(), 'notifications'), notice()));
    await assertSucceeds(addDoc(collection(anon(), 'submissions'), claim()));
    await assertSucceeds(addDoc(collection(anon(), 'messages'), message()));
    await assertSucceeds(addDoc(collection(anon(), 'messages'), message({ language: 'fr' })));
  });

  it('cannot send malformed or forged submissions', async () => {
    const db = anon();
    await assertFails(addDoc(collection(db, 'notifications'), notice({ consent: false })));
    await assertFails(addDoc(collection(db, 'notifications'), notice({ status: 'approved' })));
    await assertFails(addDoc(collection(db, 'notifications'), notice({ receiptId: 'x' })));
    await assertFails(addDoc(collection(db, 'notifications'), notice({ receiptCode: 'NR-TRA-123' })));
    await assertFails(addDoc(collection(db, 'notifications'), notice({ createdAt: Timestamp.fromDate(new Date(2020, 1, 1)) })));
    await assertFails(addDoc(collection(db, 'notifications'), notice({ details: 'x'.repeat(3001) })));
    await assertFails(addDoc(collection(db, 'submissions'), claim({ children: [] })));
    await assertFails(addDoc(collection(db, 'submissions'), claim({ children: [{ fullName: 'A', isAdmin: true }] })));
    await assertFails(addDoc(collection(db, 'submissions'), claim({ children: Array.from({ length: 11 }, () => ({ fullName: 'A' })) })));
    await assertFails(addDoc(collection(db, 'submissions'), claim({ children: [{ fullName: 'A' }, { fullName: '' }] })));
    await assertFails(addDoc(collection(db, 'messages'), message({ category: 'spam' })));
    await assertFails(addDoc(collection(db, 'messages'), message({ language: 'de' })));
  });

  it('cannot edit the family tree, content, or review decisions', async () => {
    const db = anon();
    await assertFails(setDoc(doc(db, 'persons', 'x'), person('anon')));
    await assertFails(setDoc(doc(db, 'content', 'site'), { biography: {} }));
    await assertFails(updateDoc(doc(db, 'submissions', 's1'), { status: 'approved' }));
    await assertFails(setDoc(doc(db, 'admins', 'me'), { email: 'a@b.c', role: 'superadmin', active: true, addedBy: 'me' }));
  });
});

describe('signed-in people who are not administrators', () => {
  it('get no extra access', async () => {
    const db = google('stranger');
    await assertFails(getDoc(doc(db, 'notifications', 'n1')));
    await assertFails(getDocs(collection(db, 'admins')));
    await assertFails(setDoc(doc(db, 'persons', 'x'), person('stranger')));
    await assertSucceeds(getDoc(doc(db, 'admins', 'stranger'))); // may check their own (missing) record
  });

  it('inactive admins and non-Google sign-ins are refused', async () => {
    await assertFails(getDoc(doc(google('retired'), 'notifications', 'n1')));
    const password = env.authenticatedContext('editor', { email: 'editor@example.com', email_verified: true, firebase: { sign_in_provider: 'password' } } as never).firestore();
    await assertFails(getDoc(doc(password, 'notifications', 'n1')));
    const unverified = env.authenticatedContext('editor', { email: 'editor@example.com', email_verified: false, firebase: { sign_in_provider: 'google.com' } } as never).firestore();
    await assertFails(getDoc(doc(unverified, 'notifications', 'n1')));
  });
});

describe('reviewers', () => {
  it('can read and decide, but only change review fields', async () => {
    for (const uid of ['reviewer', 'legacy']) {
      const db = google(uid);
      await assertSucceeds(getDoc(doc(db, 'notifications', 'n1')));
      await assertSucceeds(updateDoc(doc(db, 'notifications', 'n1'), { status: 'acknowledged', reviewedAt: serverTimestamp(), reviewedBy: uid }));
      await assertFails(updateDoc(doc(db, 'notifications', 'n1'), { details: 'changed', reviewedAt: serverTimestamp(), reviewedBy: uid, status: 'archived' }));
      await assertFails(updateDoc(doc(db, 'submissions', 's1'), { status: 'approved', reviewedAt: serverTimestamp(), reviewedBy: 'someone-else' }));
    }
  });

  it('cannot edit the registry, content or delete submissions', async () => {
    const db = google('reviewer');
    await assertFails(setDoc(doc(db, 'persons', 'x'), person('reviewer')));
    await assertFails(setDoc(doc(db, 'content', 'site'), { updatedAt: serverTimestamp(), updatedBy: 'reviewer' }));
    await assertFails(deleteDoc(doc(db, 'submissions', 's1')));
  });
});

describe('editors', () => {
  it('can add valid people and edit content', async () => {
    const db = google('editor');
    await assertSucceeds(setDoc(doc(db, 'persons', 'p1'), person('editor')));
    await assertSucceeds(setDoc(doc(db, 'content', 'site'), { biography: { en: 'x' }, gallery: [], updatedAt: serverTimestamp(), updatedBy: 'editor' }));
  });

  it('cannot write invalid people or spoof the author', async () => {
    const db = google('editor');
    await assertFails(setDoc(doc(db, 'persons', 'p2'), person('editor', { gender: 'other' })));
    await assertFails(setDoc(doc(db, 'persons', 'p2'), person('editor', { generation: 2.5 })));
    await assertFails(setDoc(doc(db, 'persons', 'p2'), person('editor', { secret: 1 })));
    await assertFails(setDoc(doc(db, 'persons', 'p2'), person('editor', { updatedBy: 'super' })));
    await assertFails(setDoc(doc(db, 'content', 'other'), { updatedAt: serverTimestamp(), updatedBy: 'editor' }));
  });

  it('cannot manage administrators', async () => {
    await assertFails(setDoc(doc(google('editor'), 'admins', 'editor'), { email: 'editor@example.com', role: 'superadmin', active: true, addedBy: 'editor' }));
  });
});

describe('superadmins', () => {
  it('can add, change and remove other administrators', async () => {
    const db = google('super');
    await assertSucceeds(setDoc(doc(db, 'admins', 'newone'), { email: 'new@example.com', role: 'reviewer', active: true, addedBy: 'super' }));
    await assertSucceeds(getDocs(collection(db, 'admins')));
    await assertSucceeds(deleteDoc(doc(db, 'admins', 'newone')));
    await assertSucceeds(deleteDoc(doc(db, 'submissions', 's1')));
  });

  it('cannot lock themselves out', async () => {
    const db = google('super');
    await assertFails(setDoc(doc(db, 'admins', 'super'), { email: 'super@example.com', role: 'editor', active: true, addedBy: 'super' }));
    await assertFails(deleteDoc(doc(db, 'admins', 'super')));
  });
});

describe('audit log', () => {
  it('is append-only and cannot be forged', async () => {
    const db = google('editor');
    const entry = { action: 'person.update', targetType: 'person', targetId: 'p1', summary: 'x', actorUid: 'editor', actorEmail: 'editor@example.com', at: serverTimestamp() };
    await assertSucceeds(setDoc(doc(db, 'auditLog', 'a1'), entry));
    await assertFails(setDoc(doc(db, 'auditLog', 'a2'), { ...entry, actorUid: 'super' }));
    await assertFails(updateDoc(doc(db, 'auditLog', 'a1'), { summary: 'changed' }));
    await assertFails(deleteDoc(doc(google('super'), 'auditLog', 'a1')));
    await assertFails(setDoc(doc(anon(), 'auditLog', 'a3'), entry));
  });
});
