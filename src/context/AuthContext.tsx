import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthResponse, User, clearToken, getToken, setToken } from '@/lib/api';

type AuthCtx = {
  user: User | null;
  token: string | null;
  setAuth: (resp: AuthResponse) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTok] = useState<string | null>(getToken() || null);
  const [user, setUser] = useState<User | null>(null);

  const setAuth = (resp: AuthResponse) => {
    setToken(resp.token);
    setTok(resp.token);
    setUser(resp.user);
  };

  const logout = () => {
    clearToken();
    setTok(null);
    setUser(null);
  };

  // dacă backend-ul nu are endpoint de "me", păstrăm doar tokenul în storage
  useEffect(() => {
    // optional: poți adăuga apel la /api/auth/me
  }, []);

  const value = useMemo(() => ({ user, token, setAuth, logout }), [user, token]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
