import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as authService from '@/services/auth';
import type { LocalUser } from '@/services/auth';

interface AuthContextValue {
  user: LocalUser | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  refreshUser: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const current = await authService.getCurrentUser();
    setUser(current);
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setUser(await authService.getCurrentUser());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    refreshUser,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
