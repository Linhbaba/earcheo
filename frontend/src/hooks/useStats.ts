import { useQuery } from '@tanstack/react-query';

interface PlatformStats {
  totalUsers: number;
  totalFindings: number;
  publicFindings: number;
  totalEquipment: number;
  lastUpdated: string;
}

export const useStats = () => {
  return useQuery<PlatformStats>({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minut
    refetchInterval: 10 * 60 * 1000, // Refresh každých 10 minut
  });
};

