import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useApi() {
  const { token, logout } = useAuth();

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      logout();
      throw new Error('Sesión expirada');
    }
    return res;
  }, [token, logout]);

  const get = useCallback((url: string) => apiFetch(url), [apiFetch]);

  const post = useCallback((url: string, body: any) =>
    apiFetch(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }), [apiFetch]);

  const put = useCallback((url: string, body: any) =>
    apiFetch(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }), [apiFetch]);

  const del = useCallback((url: string) =>
    apiFetch(url, { method: 'DELETE' }), [apiFetch]);

  return { get, post, put, del, apiFetch };
}

export function useApiData<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (promise: Promise<Response>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await promise;
      const json = await res.json();
      if (res.ok) {
        setData(json.data || json);
        return json;
      } else {
        setError(json.error || 'Error desconocido');
        return null;
      }
    } catch (e: any) {
      setError(e.message || 'Error de conexión');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, setData, loading, error, execute };
}
