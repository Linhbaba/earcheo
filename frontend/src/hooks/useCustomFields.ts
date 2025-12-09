import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { CustomField, CreateCustomFieldRequest, UpdateCustomFieldRequest } from '../types/database';

const API_URL = import.meta.env.VITE_API_URL || '';

interface UseCustomFieldsOptions {
  autoFetch?: boolean;
}

export function useCustomFields(options: UseCustomFieldsOptions = {}) {
  const { getAccessTokenSilently } = useAuth0();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { autoFetch = true } = options;

  // Fetch all custom fields
  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/custom-fields`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch custom fields');
      }

      const data = await response.json();
      setCustomFields(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get single custom field
  const getCustomField = async (id: string) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/custom-fields/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch custom field');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Create custom field
  const createCustomField = async (data: CreateCustomFieldRequest) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/custom-fields`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create custom field');
      }

      const newField = await response.json();
      setCustomFields(prev => [...prev, newField]);
      return newField;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Update custom field
  const updateCustomField = async (id: string, data: UpdateCustomFieldRequest) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/custom-fields/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update custom field');
      }

      const updated = await response.json();
      setCustomFields(prev => prev.map(f => f.id === id ? updated : f));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Delete custom field
  const deleteCustomField = async (id: string) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/custom-fields/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete custom field');
      }

      setCustomFields(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Reorder custom fields
  const reorderCustomFields = async (orderedIds: string[]) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/custom-fields`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderedIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder custom fields');
      }

      const reordered = await response.json();
      setCustomFields(reordered);
      return reordered;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Load custom fields on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchCustomFields();
    }
  }, []);

  return {
    customFields,
    loading,
    error,
    fetchCustomFields,
    getCustomField,
    createCustomField,
    updateCustomField,
    deleteCustomField,
    reorderCustomFields,
  };
}

