import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthResponse, User, clearToken, getToken, setToken } from '@/lib/api';

type AuthCtx = {
  user: User | null;
  token: string | null;
  setAuth: (resp: AuthResponse) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

// mic helper pt. base64url -> JSON
function decodeJwt<T = any>(token: string): T | null {
  try {
    const [, payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

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

  // setează user din token la mount și ori de câte ori token-ul se schimbă
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    const payload = decodeJwt<{ id?: string; email?: string; name?: string; exp?: number }>(token);
    if (payload?.exp && Date.now() / 1000 > payload.exp) {
      // token expirat
      logout();
      return;
    }
    if (payload?.id && payload?.email) {
      setUser({ id: payload.id, email: payload.email, name: payload.name });
    } else {
      // dacă payload nu conține câmpurile, îl lăsăm null (sau poți cere /me)
      setUser(null);
    }
  }, [token]);

  const value = useMemo(() => ({ user, token, setAuth, logout }), [user, token]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
