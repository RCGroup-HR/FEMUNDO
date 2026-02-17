import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { resolveUserModules, canAccessModule } from '../../../lib/permissions';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  allowed_modules?: string[] | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  allowedModules: string[];
  canAccess: (moduleKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('femundo_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('femundo_token');
        setToken(null);
      }
    } catch {
      localStorage.removeItem('femundo_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('femundo_token', data.token);
        setToken(data.token);
        setUser({
          ...data.user,
          name: data.user.full_name || data.user.name,
        });
        return { success: true };
      }
      return { success: false, error: data.error || 'Error al iniciar sesión' };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  }

  function logout() {
    localStorage.removeItem('femundo_token');
    setToken(null);
    setUser(null);
    window.location.href = '/admin/login';
  }

  // Módulos resueltos del usuario actual
  const allowedModules = user
    ? resolveUserModules(user.role, user.allowed_modules)
    : [];

  // Función para verificar acceso a un módulo
  function canAccess(moduleKey: string): boolean {
    if (!user) return false;
    return canAccessModule(user.role, user.allowed_modules, moduleKey);
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      allowedModules,
      canAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
