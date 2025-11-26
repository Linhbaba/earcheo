import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Finding, CreateFindingRequest, UpdateFindingRequest, UploadImageRequest } from '../types/database';

const API_URL = import.meta.env.VITE_API_URL || '';

interface UseFindingsOptions {
  category?: string;
  isPublic?: boolean;
  limit?: number;
  autoFetch?: boolean;
}

export function useFindings(options: UseFindingsOptions = {}) {
  const { getAccessTokenSilently } = useAuth0();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { category, isPublic, limit = 50, autoFetch = true } = options;

  // Fetch findings
  const fetchFindings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAccessTokenSilently();
      const params = new URLSearchParams();
      
      if (category) params.append('category', category);
      if (isPublic !== undefined) params.append('isPublic', String(isPublic));
      params.append('limit', String(limit));

      const response = await fetch(`${API_URL}/api/findings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch findings');
      }

      const data = await response.json();
      setFindings(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get single finding
  const getFinding = async (id: string) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/findings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch finding');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Create finding
  const createFinding = async (data: CreateFindingRequest) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/findings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create finding');
      }

      const newFinding = await response.json();
      setFindings(prev => [newFinding, ...prev]);
      return newFinding;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Update finding
  const updateFinding = async (id: string, data: UpdateFindingRequest) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/findings/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update finding');
      }

      const updated = await response.json();
      setFindings(prev => prev.map(f => f.id === id ? updated : f));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Delete finding
  const deleteFinding = async (id: string) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/findings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete finding');
      }

      setFindings(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Upload image
  const uploadImage = async (findingId: string, file: File) => {
    try {
      setError(null);

      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/findings/${findingId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          filename: file.name,
        } as UploadImageRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const image = await response.json();
      
      // Update finding in state with new image
      setFindings(prev => prev.map(f => {
        if (f.id === findingId) {
          return {
            ...f,
            images: [...f.images, image],
          };
        }
        return f;
      }));

      return image;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Delete image
  const deleteImage = async (findingId: string, imageId: string) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/findings/${findingId}/images?imageId=${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Update finding in state
      setFindings(prev => prev.map(f => {
        if (f.id === findingId) {
          return {
            ...f,
            images: f.images.filter(img => img.id !== imageId),
          };
        }
        return f;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Load findings on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchFindings();
    }
  }, [category, isPublic, limit]);

  return {
    findings,
    loading,
    error,
    fetchFindings,
    getFinding,
    createFinding,
    updateFinding,
    deleteFinding,
    uploadImage,
    deleteImage,
  };
}

