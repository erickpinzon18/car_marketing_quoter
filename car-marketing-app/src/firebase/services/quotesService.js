import { db } from '../config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

const COLLECTION = 'quotes';

/**
 * Get all quotes (admin view)
 */
export async function getAllQuotes() {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get quotes by user ID (vendor view — only their own)
 */
export async function getQuotesByUser(userId) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get quotes by store ID (manager view — all quotes from their store)
 */
export async function getQuotesByStore(storeId) {
  const q = query(
    collection(db, COLLECTION),
    where('storeId', '==', storeId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Create a new quote
 */
export async function createQuote(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Update an existing quote
 */
export async function updateQuote(id, data) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a quote
 */
export async function deleteQuote(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
