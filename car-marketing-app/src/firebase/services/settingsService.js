import { db } from '../config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const DOC_PATH = 'settings/global';

/**
 * Get global settings (rates, exchangeRates, currencies, storeRates)
 */
export async function getSettings() {
  const snap = await getDoc(doc(db, DOC_PATH));
  if (!snap.exists()) return null;
  return snap.data();
}

/**
 * Set (or replace) the entire settings document
 */
export async function setSettings(data) {
  await setDoc(doc(db, DOC_PATH), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Partial update to settings
 */
export async function updateSettings(data) {
  await updateDoc(doc(db, DOC_PATH), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update only rates
 */
export async function updateRates(rates) {
  await updateDoc(doc(db, DOC_PATH), {
    rates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update only store-specific rate overrides
 */
export async function updateStoreRates(storeRates) {
  await updateDoc(doc(db, DOC_PATH), {
    storeRates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update only exchange rates
 */
export async function updateExchangeRates(exchangeRates) {
  await updateDoc(doc(db, DOC_PATH), {
    exchangeRates,
    updatedAt: new Date().toISOString(),
  });
}
