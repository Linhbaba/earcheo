import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

interface CreditsState {
  balance: number;
  transactions: CreditTransaction[];
  loading: boolean;
  error: string | null;
}

export const useCredits = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [state, setState] = useState<CreditsState>({
    balance: 0,
    transactions: [],
    loading: false,
    error: null,
  });

  const fetchCredits = useCallback(async () => {
    if (!isAuthenticated) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/credits', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }

      const data = await response.json();
      setState({
        balance: data.balance,
        transactions: data.transactions,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Fetch credits error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  // Fetch on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCredits();
    }
  }, [isAuthenticated, fetchCredits]);

  // Optimistic update for spending credits
  const spendCredits = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      balance: Math.max(0, prev.balance - amount),
    }));
  }, []);

  // Refresh balance (after successful operation)
  const refreshBalance = useCallback(async () => {
    await fetchCredits();
  }, [fetchCredits]);

  return {
    balance: state.balance,
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    fetchCredits,
    spendCredits,
    refreshBalance,
  };
};

