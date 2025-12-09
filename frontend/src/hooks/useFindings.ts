import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const queryClient = useQueryClient();

  const { category, isPublic, limit = 50, autoFetch = true } = options;

  // Query key includes options for proper caching
  const queryKey = ['findings', { category, isPublic, limit }];

  // Fetch findings with React Query
  const { 
    data: findings = [], 
    isLoading: loading, 
    error: queryError,
    refetch: fetchFindings 
  } = useQuery<Finding[]>({
    queryKey,
    queryFn: async () => {
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

      return await response.json();
    },
    enabled: isAuthenticated && autoFetch,
    staleTime: 2 * 60 * 1000, // 2 minuty
    gcTime: 10 * 60 * 1000, // 10 minut v cache
  });

  // Get single finding
  const getFinding = async (id: string) => {
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
  };

  // Create finding mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateFindingRequest) => {
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

      return await response.json();
    },
    onSuccess: (newFinding) => {
      // Add to cache
      queryClient.setQueryData<Finding[]>(queryKey, (old = []) => [newFinding, ...old]);
    },
  });

  // Update finding mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFindingRequest }) => {
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

      return await response.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Finding[]>(queryKey, (old = []) => 
        old.map(f => f.id === updated.id ? updated : f)
      );
    },
  });

  // Delete finding mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
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

      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Finding[]>(queryKey, (old = []) => 
        old.filter(f => f.id !== deletedId)
      );
    },
  });

  // Upload image
  const uploadImage = async (findingId: string, file: File) => {
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
    
    // Update finding in cache with new image
    queryClient.setQueryData<Finding[]>(queryKey, (old = []) => 
      old.map(f => {
        if (f.id === findingId) {
          return { ...f, images: [...f.images, image] };
        }
        return f;
      })
    );

    return image;
  };

  // Delete image
  const deleteImage = async (findingId: string, imageId: string) => {
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

    // Update finding in cache
    queryClient.setQueryData<Finding[]>(queryKey, (old = []) => 
      old.map(f => {
        if (f.id === findingId) {
          return { ...f, images: f.images.filter(img => img.id !== imageId) };
        }
        return f;
      })
    );
  };

  const error = queryError ? (queryError as Error).message : null;

  return {
    findings,
    loading,
    error,
    fetchFindings,
    getFinding,
    createFinding: (data: CreateFindingRequest) => createMutation.mutateAsync(data),
    updateFinding: (id: string, data: UpdateFindingRequest) => updateMutation.mutateAsync({ id, data }),
    deleteFinding: (id: string) => deleteMutation.mutateAsync(id),
    uploadImage,
    deleteImage,
  };
}
