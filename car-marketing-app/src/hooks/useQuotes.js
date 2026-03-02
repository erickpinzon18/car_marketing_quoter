import { useState, useEffect, useCallback } from 'react';
import {
  getAllQuotes,
  getQuotesByUser,
  getQuotesByStore,
  createQuote,
  updateQuote,
} from '../firebase/services/quotesService';

/**
 * Hook for reading and writing quotes from Firestore /quotes collection
 * Role-based filtering:
 *  - admin: all quotes
 *  - manager: quotes from their store (storeId)
 *  - vendor: only their own quotes (userId)
 */
export function useQuotes(userId, userRole, storeId) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    // If we're not an admin and we have no userId, abort.
    // (Admins might pass null userId just to get the global stats)
    if (!userId && userRole !== 'admin') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let data = [];
      switch (userRole) {
        case 'admin':
          data = await getAllQuotes();
          break;
        case 'manager':
          data = storeId ? await getQuotesByStore(storeId) : await getAllQuotes();
          break;
        case 'vendor':
          data = await getQuotesByUser(userId);
          break;
        default:
          data = [];
      }

      // Sort by date desc (Firestore already orders by createdAt desc, but ensure)
      data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setQuotes(data);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole, storeId]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const updateQuoteStatus = useCallback(async (quoteId, newStatus) => {
    try {
      await updateQuote(quoteId, { status: newStatus });
      await fetchQuotes();
      return true;
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  }, [fetchQuotes]);

  const saveQuote = useCallback(async (quoteData, editId) => {
    try {
      if (editId) {
        await updateQuote(editId, quoteData);
      } else {
        const newId = await createQuote(quoteData);
        quoteData.id = newId;
      }
      // Refresh list
      await fetchQuotes();
      return true;
    } catch (err) {
      console.error('Error saving quote:', err);
      throw err;
    }
  }, [fetchQuotes]);

  return { quotes, loading, saveQuote, updateQuoteStatus, refetch: fetchQuotes };
}
