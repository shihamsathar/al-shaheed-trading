/**
 * Al Shaheed Trading and Equipment Co.
 * Server-Side Firestore Database Connection & Persistence Sync
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "thinking-arcanum-bf6jr",
  appId: "1:53423506288:web:d9d0264b59635348efc5b5",
  apiKey: "AIzaSyC_FGNs5MLce9ow85aNZOF0IeW_odDOtTs",
  authDomain: "thinking-arcanum-bf6jr.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-alshaheedrecycli-7c16bc9f-5cb7-425d-945e-52c57377d1bd",
  storageBucket: "thinking-arcanum-bf6jr.firebasestorage.app",
  messagingSenderId: "53423506288",
};

let firestoreInstance: Firestore | null = null;

export function getFirestoreDb(): Firestore {
  if (!firestoreInstance) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
  return firestoreInstance;
}

// Generic safe Firestore fetch collection
export async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const db = getFirestoreDb();
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const list: T[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as T);
    });
    return list;
  } catch (err) {
    console.warn(`[Firestore] Error fetching collection ${collectionName}:`, err);
    return [];
  }
}

// Generic safe Firestore save doc
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> {
  try {
    const db = getFirestoreDb();
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn(`[Firestore] Error saving document to ${collectionName}/${data.id}:`, err);
  }
}

// Generic safe Firestore delete doc
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const db = getFirestoreDb();
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`[Firestore] Error deleting document from ${collectionName}/${id}:`, err);
  }
}

// Safe find user in Firestore by username or email
export async function findUserInFirestore(identifier: string): Promise<any | null> {
  try {
    const db = getFirestoreDb();
    const cleanId = identifier.trim().toLowerCase();
    
    // First try direct doc get if cleanId is user id
    const docRef = doc(db, 'users', identifier);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }

    // Otherwise fetch all users and match
    const users = await fetchCollection<any>('users');
    const matched = users.find((u) => {
      const emailMatch = u.email && u.email.toLowerCase() === cleanId;
      const usernameMatch = u.username && u.username.toLowerCase() === cleanId;
      const nameMatch = u.name && u.name.toLowerCase() === cleanId;
      const companyMatch = u.companyName && u.companyName.toLowerCase() === cleanId;
      return emailMatch || usernameMatch || nameMatch || companyMatch;
    });

    return matched || null;
  } catch (err) {
    console.warn('[Firestore] Error finding user:', err);
    return null;
  }
}
