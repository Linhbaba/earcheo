import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Sector, CreateSectorRequest, UpdateSectorRequest } from '../types/database';

const API_URL = import.meta.env.VITE_API_URL || '';

interface UseSectorsOptions {
  autoFetch?: boolean;
}

export function useSectors(options: UseSectorsOptions = {}) {
  const { autoFetch = true } = options;
  const { getAccessTokenSilently } = useAuth0();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all sectors
  const fetchSectors = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/sectors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sectors');
      }

      const data = await response.json();
      setSectors(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Fetch sectors error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get single sector
  const getSector = async (id: string) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/sectors/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sector');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Create sector
  const createSector = async (data: CreateSectorRequest) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/sectors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sector');
      }

      const newSector = await response.json();
      setSectors(prev => [newSector, ...prev]);
      return newSector;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Create sector error:', err);
      throw err;
    }
  };

  // Update sector
  const updateSector = async (id: string, data: UpdateSectorRequest) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/sectors/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update sector');
      }

      const updated = await response.json();
      setSectors(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Update sector error:', err);
      throw err;
    }
  };

  // Delete sector
  const deleteSector = async (id: string) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/sectors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete sector');
      }

      setSectors(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Delete sector error:', err);
      throw err;
    }
  };

  // Load sectors on mount if autoFetch enabled
  useEffect(() => {
    if (autoFetch) {
      fetchSectors();
    }
  }, [autoFetch]);

  return {
    sectors,
    loading,
    error,
    fetchSectors,
    getSector,
    createSector,
    updateSector,
    deleteSector,
  };
}

