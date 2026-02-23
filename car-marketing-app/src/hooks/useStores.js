import { useState, useEffect, useCallback } from 'react';
import {
  getAllStores,
  createStore as createStoreService,
  updateStore as updateStoreService,
  deleteStore as deleteStoreService,
} from '../firebase/services/storesService';

/**
 * Hook for CRUD operations on /stores collection
 * Replaces the static STORES import from users.js
 */
export function useStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllStores();
      setStores(data);
    } catch (err) {
      console.error('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  /**
   * Get a stores map { id: { name, city, ... } } for backward compatibility
   */
  const storesMap = stores.reduce((acc, store) => {
    acc[store.id] = store;
    return acc;
  }, {});

  const addStore = useCallback(async (data) => {
    try {
      const id = await createStoreService(data);
      setStores(prev => [...prev, { id, ...data }]);
      return id;
    } catch (err) {
      console.error('Error creating store:', err);
      throw err;
    }
  }, []);

  const editStore = useCallback(async (id, data) => {
    try {
      await updateStoreService(id, data);
      setStores(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    } catch (err) {
      console.error('Error updating store:', err);
      throw err;
    }
  }, []);

  const removeStore = useCallback(async (id) => {
    try {
      await deleteStoreService(id);
      setStores(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting store:', err);
      throw err;
    }
  }, []);

  return {
    stores,
    storesMap,
    loading,
    addStore,
    editStore,
    removeStore,
    refetch: loadStores,
  };
}
