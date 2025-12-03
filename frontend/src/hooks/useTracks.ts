import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Track, TrackStatus, GeoJSONLineString } from '../types/database';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useTracks() {
  const { getAccessTokenSilently } = useAuth0();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tracks for a sector
  const fetchTracks = async (sectorId: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/tracks?sectorId=${sectorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }

      const data = await response.json();
      setTracks(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Fetch tracks error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create tracks (bulk - replaces existing)
  const createTracks = async (
    sectorId: string,
    trackData: Array<{ geometry: GeoJSONLineString; order: number }>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectorId,
          tracks: trackData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tracks');
      }

      const newTracks = await response.json();
      setTracks(newTracks);
      return newTracks;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Create tracks error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update track status
  const updateTrackStatus = async (trackId: string, status: TrackStatus) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/tracks/${trackId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update track');
      }

      const updated = await response.json();
      setTracks(prev => prev.map(t => t.id === trackId ? updated : t));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Update track error:', err);
      throw err;
    }
  };

  // Delete all tracks for a sector
  const deleteTracks = async (sectorId: string) => {
    try {
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/tracks?sectorId=${sectorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tracks');
      }

      setTracks([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Delete tracks error:', err);
      throw err;
    }
  };

  // Get track statistics
  const getTrackStats = () => {
    const total = tracks.length;
    const completed = tracks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tracks.filter(t => t.status === 'IN_PROGRESS').length;
    const pending = tracks.filter(t => t.status === 'PENDING').length;
    const skipped = tracks.filter(t => t.status === 'SKIPPED').length;
    
    const progress = total > 0 ? ((completed + skipped) / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      skipped,
      progress,
    };
  };

  return {
    tracks,
    loading,
    error,
    fetchTracks,
    createTracks,
    updateTrackStatus,
    deleteTracks,
    getTrackStats,
    setTracks, // For local state updates
  };
}

