import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Equipment, CreateEquipmentRequest, UpdateEquipmentRequest } from '../types/database';

const API_URL = import.meta.env.VITE_API_URL || '';

interface UseEquipmentOptions {
  autoFetch?: boolean;
}

export function useEquipment(options: UseEquipmentOptions = {}) {
  const { autoFetch = true } = options;
  const { getAccessTokenSilently } = useAuth0();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all user's equipment
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/equipment`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }

      const data = await response.json();
      setEquipment(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Fetch equipment error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create equipment
  const createEquipment = async (data: CreateEquipmentRequest) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/equipment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create equipment');
      }

      const newEquipment = await response.json();
      setEquipment(prev => [newEquipment, ...prev]);
      return newEquipment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Create equipment error:', err);
      throw err;
    }
  };

  // Update equipment
  const updateEquipment = async (id: string, data: UpdateEquipmentRequest) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/equipment/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update equipment');
      }

      const updated = await response.json();
      setEquipment(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Update equipment error:', err);
      throw err;
    }
  };

  // Delete equipment
  const deleteEquipment = async (id: string) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/equipment/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete equipment');
      }

      setEquipment(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Delete equipment error:', err);
      throw err;
    }
  };

  // Load equipment on mount (if autoFetch enabled)
  useEffect(() => {
    if (autoFetch) {
      fetchEquipment();
    }
  }, [autoFetch]);

  return {
    equipment,
    loading,
    error,
    fetchEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  };
}
