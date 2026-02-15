import { useState, useEffect, useCallback } from 'react';

export function useQuotes(userId, userRole) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch mock data from JSON (will be replaced with Firestore)
      let jsonQuotes = [];
      try {
        const response = await fetch('/clients.json');
        if (response.ok) jsonQuotes = await response.json();
      } catch (err) {
        console.error('Error loading clients.json:', err);
      }

      // Get localStorage data
      const localQuotes = JSON.parse(localStorage.getItem('crm_quotes') || '[]');

      // Merge — local quotes override JSON ones with same ID
      const localIds = new Set(localQuotes.map((q) => q.id));
      const filteredJson = jsonQuotes.filter((q) => !localIds.has(q.id));
      let allQuotes = [...filteredJson, ...localQuotes];

      // Role filtering: vendors see only their own
      if (userRole === 'vendor') {
        allQuotes = allQuotes.filter((q) => q.user === userId);
      }

      // Sort by date desc
      allQuotes.sort((a, b) => new Date(b.date) - new Date(a.date));

      setQuotes(allQuotes);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const saveQuote = useCallback((quoteData, editId) => {
    const savedQuotes = JSON.parse(localStorage.getItem('crm_quotes') || '[]');

    if (editId) {
      // Update existing quote
      const idx = savedQuotes.findIndex((q) => q.id === editId);
      if (idx >= 0) {
        savedQuotes[idx] = quoteData;
      } else {
        // Might be a JSON quote being edited for the first time — save to local
        savedQuotes.push(quoteData);
      }
    } else {
      savedQuotes.push(quoteData);
    }

    localStorage.setItem('crm_quotes', JSON.stringify(savedQuotes));
    // Refresh list
    fetchQuotes();
    return true;
  }, [fetchQuotes]);

  return { quotes, loading, saveQuote, refetch: fetchQuotes };
}
