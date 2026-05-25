import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginSvc, logout as logoutSvc, register as registerSvc, getMe } from '../services/authService';
import { setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session via refresh token on mount
  useEffect(() => {
    (async () => {
      try {
        const u = await getMe();
        setUser(u);
      } catch {
        // No valid session — that's fine
      } finally {
        setLoading(false);
      }
    })();

    // Listen for forced logout (401 after refresh fails)
    const handler = () => setUser(null);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginSvc(email, password);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await registerSvc(payload);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await logoutSvc();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
