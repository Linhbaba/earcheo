import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { FeatureRequest, CreateFeatureRequest } from '../types/database';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useFeatureRequests() {
  const { getAccessTokenSilently, user } = useAuth0();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all features
  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/features`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch features');
      }

      const data = await response.json();
      setFeatures(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Fetch features error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create feature request
  const createFeature = async (data: CreateFeatureRequest) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/features`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create feature');
      }

      const newFeature = await response.json();
      setFeatures(prev => [newFeature, ...prev]);
      return newFeature;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Create feature error:', err);
      throw err;
    }
  };

  // Toggle vote
  const toggleVote = async (featureId: string) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/features?id=${featureId}&action=vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle vote');
      }

      const updated = await response.json();
      
      // Update feature in list
      setFeatures(prev => prev.map(f => f.id === featureId ? updated : f));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Toggle vote error:', err);
      throw err;
    }
  };

  // Delete feature request (only for author)
  const deleteFeature = async (featureId: string) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/features?id=${featureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete feature');
      }

      setFeatures(prev => prev.filter(f => f.id !== featureId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Delete feature error:', err);
      throw err;
    }
  };

  // Add comment to feature request
  const addComment = async (featureId: string, content: string) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/features?id=${featureId}&action=comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const updated = await response.json();
      setFeatures(prev => prev.map(f => f.id === featureId ? updated : f));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Add comment error:', err);
      throw err;
    }
  };

  // Migrate from localStorage to database (one-time migration)
  const migrateFromLocalStorage = async () => {
    const STORAGE_KEY = 'earcheo-features-v2';
    const MIGRATION_KEY = 'earcheo-features-migrated';

    // Check if already migrated
    if (localStorage.getItem(MIGRATION_KEY)) {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored || !user?.sub) return;

      const localFeatures = JSON.parse(stored);
      
      // Only migrate features created by current user (not system features)
      const userFeatures = localFeatures.filter((f: { authorId?: string }) => 
        f.authorId === user.sub && f.authorId !== 'system'
      );

      if (userFeatures.length === 0) {
        localStorage.setItem(MIGRATION_KEY, 'true');
        return;
      }

      // Create features in database
      for (const feature of userFeatures) {
        try {
          await createFeature({
            title: feature.title,
            description: feature.description || '',
          });
        } catch (err) {
          console.error('Failed to migrate feature:', feature.title, err);
        }
      }

      // Mark as migrated
      localStorage.setItem(MIGRATION_KEY, 'true');
      console.log(`Migrated ${userFeatures.length} features from localStorage`);
    } catch (err) {
      console.error('Migration error:', err);
    }
  };

  // Load features on mount
  useEffect(() => {
    fetchFeatures().then(() => {
      // After loading, attempt migration
      migrateFromLocalStorage();
    });
  }, []);

  return {
    features,
    loading,
    error,
    fetchFeatures,
    createFeature,
    toggleVote,
    deleteFeature,
    addComment,
  };
}
