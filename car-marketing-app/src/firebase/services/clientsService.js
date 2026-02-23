import { db } from '../config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

const COLLECTION = 'clients';

/**
 * Get all clients (for vendor cross-store search)
 */
export async function getAllClients() {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get client by ID
 */
export async function getClientById(id) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Search clients by name, email, or phone (client-side filter)
 * Firestore doesn't support full-text search natively,
 * so we fetch all and filter. For large datasets, consider Algolia/Typesense.
 */
export async function searchClients(term) {
  const all = await getAllClients();
  const lower = term.toLowerCase();
  return all.filter(
    (c) =>
      c.name?.toLowerCase().includes(lower) ||
      c.email?.toLowerCase().includes(lower) ||
      c.phone?.includes(term)
  );
}

/**
 * Create a new client
 */
export async function createClient(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Update client
 */
export async function updateClient(id, data) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}
