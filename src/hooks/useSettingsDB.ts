import { useState, useCallback } from 'react';
import { LocaListDB } from '../db/LocaListDB';
import { Setting } from '../models/Setting';

const locaListDB = new LocaListDB();

export const useSettingsDB = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allSettings = await locaListDB.getAllSettings();
      setSettings(allSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSetting = useCallback(async (setting: Setting) => {
    setLoading(true);
    setError(null);
    try {
      await locaListDB.saveSetting(setting);
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setting');
    } finally {
      setLoading(false);
    }
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    saveSetting,
  };
};