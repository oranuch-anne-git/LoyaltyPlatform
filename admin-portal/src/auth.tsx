import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type User = { id: string; email: string; name?: string; role: string } | null;

type AuthContextType = {
  token: string | null;
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'loyalty_admin';

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const [token, setToken] = useState<string | null>(() => {
    try {
      const d = stored ? JSON.parse(stored) : null;
      return d?.access_token ?? null;
    } catch {
      return null;
    }
  });
  const [user, setUserState] = useState<User>(() => {
    try {
      const d = stored ? JSON.parse(stored) : null;
      return d?.user ?? null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }
    const data = await res.json();
    setToken(data.access_token);
    setUserState(data.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ access_token: data.access_token, user: data.user }));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setUser = useCallback((u: User) => setUserState(u), []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
