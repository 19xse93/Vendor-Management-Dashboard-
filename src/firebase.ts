import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs,
  query
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { CompanyDocument, ComplianceCheck } from './types';

// Initialize Firebase with the provisioned configuration parameters
const appInstance = initializeApp(firebaseConfig);
const dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
const authInstance = getAuth(appInstance);
const firebaseConfigured = true;

console.log("Firebase initialized successfully with project ID:", firebaseConfig.projectId);

export const isFirebaseConfigured = () => firebaseConfigured;
export const db = dbInstance;
export const auth = authInstance;

// Connection validation to ensure Firestore is reachable
export async function testConnection() {
  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
    console.log("Firestore connection verified successfully");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.", error);
    }
  }
}

// SECURE ERROR HANDLER (Mandated by Section 3 of Firebase Guidelines)
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid || 'guest-sandbox',
      email: authInstance?.currentUser?.email || 'guest@elev8.com',
      emailVerified: authInstance?.currentUser?.emailVerified || false,
      isAnonymous: authInstance?.currentUser?.isAnonymous || false,
      tenantId: authInstance?.currentUser?.tenantId || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Hardened Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- SECURE PERSISTENCE OPERATIONS ---

// Save User Profile to Firestore
export async function saveUserProfile(userId: string, email: string, role: string, fullName: string) {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(dbInstance, 'users', userId);
    await setDoc(userDocRef, {
      userId,
      email,
      role,
      fullName,
      createdAt: new Date().toISOString()
    });
    console.log("User profile saved securely to Firestore:", userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 1. Company Documents Operations
export async function fetchCompanyDocuments(): Promise<CompanyDocument[]> {
  try {
    const q = query(collection(dbInstance, 'company_documents'));
    const querySnapshot = await getDocs(q);
    const documents: CompanyDocument[] = [];
    querySnapshot.forEach((doc) => {
      documents.push(doc.data() as CompanyDocument);
    });
    return documents;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'company_documents');
    return [];
  }
}

export async function uploadCompanyDocumentToFirestore(document: CompanyDocument) {
  const path = `company_documents/${document.id}`;
  try {
    const sanitizedDocument = { ...document };
    if (sanitizedDocument.fileData && sanitizedDocument.fileData.length > 500000) {
      console.warn(`File data for document ${document.id} exceeds Firestore safe limits (~500KB). Truncating to stay within 1MB document limit.`);
      sanitizedDocument.fileData = sanitizedDocument.fileData.substring(0, 100000) + "... [Truncated to fit Firebase Document 1MB Limit]";
    }
    await setDoc(doc(dbInstance, 'company_documents', document.id), sanitizedDocument);
    console.log("Uploaded subsidiary certificate locked into Firestore:", document.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCompanyDocumentFromFirestore(docId: string) {
  const path = `company_documents/${docId}`;
  try {
    await deleteDoc(doc(dbInstance, 'company_documents', docId));
    console.log("Document record purged from Firestore:", docId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 2. Compliance Audits Operations
export async function fetchComplianceChecks(): Promise<ComplianceCheck[]> {
  try {
    const q = query(collection(dbInstance, 'compliance_checks'));
    const querySnapshot = await getDocs(q);
    const checks: ComplianceCheck[] = [];
    querySnapshot.forEach((doc) => {
      checks.push(doc.data() as ComplianceCheck);
    });
    return checks;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'compliance_checks');
    return [];
  }
}

export async function saveComplianceCheckToFirestore(check: ComplianceCheck) {
  const path = `compliance_checks/${check.id}`;
  try {
    const sanitizedCheck = { ...check };
    if (sanitizedCheck.fileData && sanitizedCheck.fileData.length > 500000) {
      console.warn(`File data for check ${check.id} exceeds Firestore safe limits (~500KB). Truncating to stay within 1MB document limit.`);
      sanitizedCheck.fileData = sanitizedCheck.fileData.substring(0, 100000) + "... [Truncated to fit Firebase Document 1MB Limit]";
    }
    await setDoc(doc(dbInstance, 'compliance_checks', check.id), sanitizedCheck);
    console.log("Compliance audit checklist committed to Firestore:", check.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteComplianceCheckFromFirestore(checkId: string) {
  const path = `compliance_checks/${checkId}`;
  try {
    await deleteDoc(doc(dbInstance, 'compliance_checks', checkId));
    console.log("Compliance check record purged from Firestore:", checkId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
