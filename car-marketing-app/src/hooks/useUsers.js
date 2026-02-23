import { useState, useEffect, useCallback } from 'react';
import {
  getAllUsers,
  getUsersByStore,
} from '../firebase/services/usersService';

/**
 * Hook for reading users from /users collection
 * Replaces the static USERS array import from users.js
 */
export function useUsers(storeId = null) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = storeId
        ? await getUsersByStore(storeId)
        : await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, loading, refetch: loadUsers };
}
