import { db } from '../config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

const COLLECTION = 'users';

/**
 * Get user document by Firebase Auth UID
 */
export async function getUserById(uid) {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get users belonging to a specific store (manager view)
 */
export async function getUsersByStore(storeId) {
  const q = query(collection(db, COLLECTION), where('storeId', '==', storeId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Create user document (ID = Firebase Auth UID)
 */
export async function createUser(uid, data) {
  await setDoc(doc(db, COLLECTION, uid), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update user document
 */
export async function updateUser(uid, data) {
  await updateDoc(doc(db, COLLECTION, uid), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete user document
 */
export async function deleteUser(uid) {
  await deleteDoc(doc(db, COLLECTION, uid));
}
