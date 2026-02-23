import { useState, useEffect, useCallback } from 'react';
import {
  getAllAgencies,
  createAgency as createAgencyService,
  updateAgency as updateAgencyService,
  deleteAgency as deleteAgencyService,
} from '../firebase/services/agenciesService';

/**
 * Hook for CRUD operations on /agencies collection
 */
export function useAgencies() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAgencies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllAgencies();
      setAgencies(data);
    } catch (err) {
      console.error('Error loading agencies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgencies();
  }, [loadAgencies]);

  const agenciesMap = agencies.reduce((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {});

  const addAgency = useCallback(async (data) => {
    try {
      const id = await createAgencyService(data);
      setAgencies(prev => [...prev, { id, ...data }]);
      return id;
    } catch (err) {
      console.error('Error creating agency:', err);
      throw err;
    }
  }, []);

  const editAgency = useCallback(async (id, data) => {
    try {
      await updateAgencyService(id, data);
      setAgencies(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    } catch (err) {
      console.error('Error updating agency:', err);
      throw err;
    }
  }, []);

  const removeAgency = useCallback(async (id) => {
    try {
      await deleteAgencyService(id);
      setAgencies(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting agency:', err);
      throw err;
    }
  }, []);

  return {
    agencies,
    agenciesMap,
    loading,
    addAgency,
    editAgency,
    removeAgency,
    refetch: loadAgencies,
  };
}
