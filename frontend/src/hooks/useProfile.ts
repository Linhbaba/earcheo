import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import type { User, UpdateProfileRequest, CreateProfileRequest } from '../types/database';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useProfile() {
  const { getAccessTokenSilently, user: auth0User, isAuthenticated } = useAuth0();
  const queryClient = useQueryClient();

  // Fetch profile with React Query - shared cache across all components
  const { 
    data: profile, 
    isLoading: loading, 
    error: queryError,
    refetch: fetchProfile 
  } = useQuery<User | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        // Profile doesn't exist yet - create it
        if (!auth0User?.email) {
          throw new Error('User email is required for profile creation');
        }
        
        const createResponse = await fetch(`${API_URL}/api/profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: auth0User.email,
            nickname: auth0User.nickname,
            avatarUrl: auth0User.picture,
          } as CreateProfileRequest),
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create profile');
        }

        return await createResponse.json();
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minut - nebude refetchovat
    gcTime: 30 * 60 * 1000, // 30 minut v cache
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      console.log('[useProfile] Updating profile with:', data);
      
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[useProfile] Update failed:', response.status, errorText);
        throw new Error('Failed to update profile');
      }

      const updated = await response.json();
      console.log('[useProfile] Profile updated:', updated);
      return updated;
    },
    onSuccess: (data) => {
      // Update cache after successful mutation
      queryClient.setQueryData(['profile'], data);
    },
  });

  const updateProfile = async (data: UpdateProfileRequest) => {
    return updateMutation.mutateAsync(data);
  };

  const error = queryError ? (queryError as Error).message : null;

  return {
    profile: profile ?? null,
    loading,
    error,
    fetchProfile,
    updateProfile,
  };
}
