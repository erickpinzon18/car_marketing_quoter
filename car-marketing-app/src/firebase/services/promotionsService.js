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
} from 'firebase/firestore';

const COLLECTION = 'promotions';

/**
 * Get all promotions
 */
export async function getAllPromotions() {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get active promotions (endDate >= now)
 */
export async function getActivePromotions() {
  const now = new Date().toISOString();
  const q = query(
    collection(db, COLLECTION),
    where('endDate', '>=', now)
  );
  const snap = await getDocs(q);
  // Also filter initDate <= now on client side (Firestore only allows one inequality)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.initDate <= now);
}

/**
 * Get promotions by plan ID
 */
export async function getPromotionsByPlan(planId) {
  const all = await getAllPromotions();
  return all.filter(
    (p) => p.planId === 'all' || (Array.isArray(p.planId) && p.planId.includes(planId))
  );
}

/**
 * Create a new promotion
 */
export async function createPromotion(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Update promotion
 */
export async function updatePromotion(id, data) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete promotion
 */
export async function deletePromotion(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
