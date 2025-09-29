const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  tags?: string[];
  note?: string;
}

export interface CreateServerPayload {
  name: string;
  host: string;
  port: number;
  username: string;
  tags?: string[];
  note?: string;
}

/* ===== Auth types & helpers ===== */
export interface User {
  id: string;
  email: string;
  name?: string;
}
export interface AuthResponse {
  token: string;
  user: User;
}

export function getToken() {
  return localStorage.getItem("token") || "";
}
export function setToken(t: string) {
  localStorage.setItem("token", t);
}
export function clearToken() {
  localStorage.removeItem("token");
}

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  { auth = true }: { auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      msg = data.error || msg;
    } catch {}
    throw new ApiError(msg, response.status);
  }
  // 204 no content
  if (response.status === 204) return undefined as T;
  return response.json();
}

/* ===== Servers CRUD ===== */
export async function listServers(): Promise<Server[]> {
  return apiRequest<Server[]>('/api/servers');
}
export async function createServer(payload: CreateServerPayload): Promise<Server> {
  return apiRequest<Server>('/api/servers', { method: 'POST', body: JSON.stringify(payload) });
}
export async function updateServer(id: string, payload: Partial<CreateServerPayload>): Promise<Server> {
  return apiRequest<Server>(`/api/servers/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}
export async function deleteServer(id: string): Promise<void> {
  return apiRequest<void>(`/api/servers/${id}`, { method: 'DELETE' });
}

/* ===== Auth API ===== */
export async function register(email: string, password: string, name?: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  }, { auth: false });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, { auth: false });
}

export function googleAuthUrl() {
  return `${API_BASE_URL}/api/auth/google`;
}
