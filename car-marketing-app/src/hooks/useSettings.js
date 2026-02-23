import { useState, useEffect, useCallback } from 'react';
import { getSettings as fetchSettings, updateStoreRates, updateExchangeRates as updateExchangeRatesService } from '../firebase/services/settingsService';

/**
 * Hook for reading and updating global settings from Firestore /settings/global
 * Replaces the static settings.json import and localStorage overrides
 */
export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /**
   * Get effective rate for a plan + store combination
   */
  const getRate = useCallback((planKey, storeId) => {
    if (!settings) return 0;
    // Check store-specific override first
    if (storeId && settings.storeRates?.[storeId]?.[planKey] !== undefined) {
      const storeRate = settings.storeRates[storeId][planKey];
      if (storeRate !== '' && !isNaN(parseFloat(storeRate))) {
        return parseFloat(storeRate);
      }
    }
    // Fall back to global rate
    return settings.rates?.[planKey] ?? 0;
  }, [settings]);

  /**
   * Get exchange rates with MXN as base
   */
  const getExchangeRates = useCallback(() => {
    if (!settings) return { MXN: 1 };
    return { ...settings.exchangeRates, MXN: 1 };
  }, [settings]);

  /**
   * Save store-specific rate overrides
   */
  const saveStoreRates = useCallback(async (storeRates) => {
    try {
      await updateStoreRates(storeRates);
      setSettings(prev => ({ ...prev, storeRates }));
    } catch (err) {
      console.error('Error saving store rates:', err);
      throw err;
    }
  }, []);

  /**
   * Save exchange rate overrides
   */
  const saveExchangeRates = useCallback(async (exchangeRates) => {
    try {
      await updateExchangeRatesService(exchangeRates);
      setSettings(prev => ({ ...prev, exchangeRates }));
    } catch (err) {
      console.error('Error saving exchange rates:', err);
      throw err;
    }
  }, []);

  return {
    settings,
    loading,
    error,
    getRate,
    getExchangeRates,
    saveStoreRates,
    saveExchangeRates,
    refetch: loadSettings,
  };
}
