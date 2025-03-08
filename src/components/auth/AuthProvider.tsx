'use client';

import useAuthStore from '@/store/auth-store';
import { useEffect } from 'react';

/**
 * AuthProvider component that fetches the current user on mount
 * and sets it in the auth store
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (response.ok && data.user) {
          setUser(data.user);
        } else {
          // Clear the user if not authenticated
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setError('Failed to fetch current user');
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();
  }, [setUser, setLoading, setError]);

  return <>{children}</>;
}
