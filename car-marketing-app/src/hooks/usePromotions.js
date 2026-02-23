import { useState, useEffect, useCallback } from 'react';
import {
  getAllPromotions,
  getActivePromotions,
  createPromotion as createPromotionService,
  updatePromotion as updatePromotionService,
  deletePromotion as deletePromotionService,
} from '../firebase/services/promotionsService';

/**
 * Hook for CRUD operations on /promotions collection
 * Admin only: full CRUD. Others: read active promotions only.
 */
export function usePromotions(onlyActive = false) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = onlyActive
        ? await getActivePromotions()
        : await getAllPromotions();
      setPromotions(data);
    } catch (err) {
      console.error('Error loading promotions:', err);
    } finally {
      setLoading(false);
    }
  }, [onlyActive]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const addPromotion = useCallback(async (data) => {
    try {
      const id = await createPromotionService(data);
      setPromotions(prev => [...prev, { id, ...data }]);
      return id;
    } catch (err) {
      console.error('Error creating promotion:', err);
      throw err;
    }
  }, []);

  const editPromotion = useCallback(async (id, data) => {
    try {
      await updatePromotionService(id, data);
      setPromotions(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    } catch (err) {
      console.error('Error updating promotion:', err);
      throw err;
    }
  }, []);

  const removePromotion = useCallback(async (id) => {
    try {
      await deletePromotionService(id);
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting promotion:', err);
      throw err;
    }
  }, []);

  return {
    promotions,
    loading,
    addPromotion,
    editPromotion,
    removePromotion,
    refetch: loadPromotions,
  };
}
