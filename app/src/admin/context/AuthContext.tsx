import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'cliente';
  status: 'active' | 'inactive';
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  isClient: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      setUser(res.data.user);
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err?.response?.data?.message || err?.message || 'Error de conexion';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  const isAdmin = useCallback(() => user?.role === 'admin', [user]);
  const isEditor = useCallback(() => user?.role === 'editor', [user]);
  const isClient = useCallback(() => user?.role === 'cliente', [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin, isEditor, isClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
