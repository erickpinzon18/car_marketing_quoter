import { db } from '../config';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const COLLECTION = 'agencies';

/**
 * Get all agencies
 */
export async function getAllAgencies() {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Create a new agency
 */
export async function createAgency(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Update agency
 */
export async function updateAgency(id, data) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete agency
 */
export async function deleteAgency(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
