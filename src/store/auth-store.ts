import { UserInfo } from '@/lib/auth/auth';
import { create } from 'zustand';

interface AuthState {
  // User state
  user: UserInfo | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: UserInfo | null) => void;
  clearUser: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Authentication store for managing user state across the application
 */
const useAuthStore = create<AuthState>((set) => ({
  // User state
  user: null,
  isLoading: true,
  error: null,

  // Set the authenticated user
  setUser: (user) => set({ user, isLoading: false, error: null }),

  // Clear the authenticated user (sign out)
  clearUser: () => set({ user: null, isLoading: false, error: null }),

  // Set error state
  setError: (error) => set({ error, isLoading: false }),

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
