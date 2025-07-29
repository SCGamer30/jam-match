import { useState, useEffect, useCallback } from "react";
import {
  AuthUser,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  onAuthStateChange,
} from "./auth";

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}

/**
 * Custom hook for managing authentication state
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to initialize authentication");
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange((user) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const { user, error } = await signIn(email, password);

        if (error) {
          setError(error.message);
          setLoading(false);
          return false;
        }

        setUser(user);
        setLoading(false);
        return true;
      } catch (err) {
        setError("An unexpected error occurred");
        setLoading(false);
        return false;
      }
    },
    []
  );

  const handleSignUp = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const { user, error } = await signUp(email, password);

        if (error) {
          setError(error.message);
          setLoading(false);
          return false;
        }

        setUser(user);
        setLoading(false);
        return true;
      } catch (err) {
        setError("An unexpected error occurred");
        setLoading(false);
        return false;
      }
    },
    []
  );

  const handleSignOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signOut();

      if (error) {
        setError(error.message);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError("Failed to sign out");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    clearError,
    isAuthenticated: !!user,
  };
}
