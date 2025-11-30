import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { MapSetup, MapSetupConfig } from '../types/database';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useMapSetups() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [setups, setSetups] = useState<MapSetup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSetups = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/map-setups`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        // Tiše selhání pokud endpoint ještě není nasazený
        if (response.status === 404) {
          setSetups([]);
          return;
        }
        throw new Error('Failed to fetch setups');
      }
      
      const data = await response.json();
      setSetups(data);
    } catch (err) {
      // Tiše selhání při síťových chybách
      console.warn('Map setups fetch failed:', err);
      setSetups([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  const createSetup = useCallback(async (name: string, config: MapSetupConfig) => {
    try {
      setError(null);
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/map-setups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, config }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create setup');
      }

      const newSetup = await response.json();
      setSetups(prev => [newSetup, ...prev]);
      return newSetup;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  }, [getAccessTokenSilently]);

  const updateSetup = useCallback(async (id: string, data: { name?: string; config?: MapSetupConfig }) => {
    try {
      setError(null);
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/map-setups/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update setup');

      const updated = await response.json();
      setSetups(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [getAccessTokenSilently]);

  const deleteSetup = useCallback(async (id: string) => {
    try {
      setError(null);
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/map-setups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete setup');

      setSetups(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchSetups();
  }, [fetchSetups]);

  return {
    setups,
    loading,
    error,
    createSetup,
    updateSetup,
    deleteSetup,
    refetch: fetchSetups,
  };
}

