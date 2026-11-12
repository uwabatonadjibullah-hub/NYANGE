import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { DescendantSubmission } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with custom database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Error Handling according to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Validate Connection to Firestore on startup
export async function testConnection(): Promise<void> {
  const testPath = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection to Firestore verified successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firebase] Client is offline. Please check your Firebase configuration.');
    }
  }
}

// Initial connection validation trigger
testConnection();

// Authentication Helpers
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    return result.user;
  } catch (error) {
    console.error('[Firebase] Sign-in error:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('[Firebase] Sign-out error:', error);
    throw error;
  }
}

export function onAuthStatusChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Firestore Submissions API
const SUBMISSIONS_COLLECTION = 'submissions';

export async function saveSubmissionToFirestore(submission: DescendantSubmission): Promise<void> {
  const docPath = `${SUBMISSIONS_COLLECTION}/${submission.id}`;
  try {
    await setDoc(doc(db, SUBMISSIONS_COLLECTION, submission.id), submission);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function fetchSubmissionsFromFirestore(): Promise<DescendantSubmission[]> {
  try {
    const q = query(collection(db, SUBMISSIONS_COLLECTION));
    const snapshot = await getDocs(q);
    const results: DescendantSubmission[] = [];
    snapshot.forEach((docSnap) => {
      results.push(docSnap.data() as DescendantSubmission);
    });
    // Sort descending by submittedAt
    return results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, SUBMISSIONS_COLLECTION);
  }
}

export async function updateSubmissionInFirestore(
  submissionId: string, 
  updates: Partial<DescendantSubmission>
): Promise<void> {
  const docPath = `${SUBMISSIONS_COLLECTION}/${submissionId}`;
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteSubmissionFromFirestore(submissionId: string): Promise<void> {
  const docPath = `${SUBMISSIONS_COLLECTION}/${submissionId}`;
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function subscribeToSubmissions(
  onData: (submissions: DescendantSubmission[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const colRef = collection(db, SUBMISSIONS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const results: DescendantSubmission[] = [];
      snapshot.forEach((docSnap) => {
        results.push(docSnap.data() as DescendantSubmission);
      });
      results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      onData(results);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, SUBMISSIONS_COLLECTION);
    }
  );
}

// Firestore Notifications / Record Me API
const NOTIFICATIONS_COLLECTION = 'notifications';

export async function saveNotificationToFirestore(notification: Record<string, any>): Promise<void> {
  const id = notification.id || `notif-${Date.now()}`;
  const docPath = `${NOTIFICATIONS_COLLECTION}/${id}`;
  try {
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, id), {
      ...notification,
      id
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function fetchNotificationsFromFirestore(): Promise<any[]> {
  try {
    const q = query(collection(db, NOTIFICATIONS_COLLECTION));
    const snapshot = await getDocs(q);
    const results: any[] = [];
    snapshot.forEach((docSnap) => {
      results.push(docSnap.data());
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, NOTIFICATIONS_COLLECTION);
  }
}
