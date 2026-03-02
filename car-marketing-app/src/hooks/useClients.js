import { useState, useEffect, useCallback } from 'react';
import {
  getAllClients,
  searchClients as searchClientsService,
  createClient as createClientService,
  updateClient as updateClientService,
} from '../firebase/services/clientsService';

/**
 * Hook for reading and searching clients from /clients collection
 * All vendors can search across all stores' clients
 */
export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllClients();
      setClients(data);
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const searchClients = useCallback(async (term) => {
    if (!term || term.length < 2) return clients;
    try {
      return await searchClientsService(term);
    } catch (err) {
      console.error('Error searching clients:', err);
      return [];
    }
  }, [clients]);

  const addClient = useCallback(async (data) => {
    try {
      const id = await createClientService(data);
      const newClient = { id, ...data };
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  }, []);

  const updateClient = useCallback(async (id, data) => {
    try {
      await updateClientService(id, data);
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  }, []);

  return { clients, loading, searchClients, addClient, updateClient, refetch: loadClients };
}
