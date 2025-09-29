const API_BASE_URL = import.meta.env.VITE_API_URL;

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

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

export async function listServers(): Promise<Server[]> {
  return apiRequest<Server[]>('/api/servers');
}

export async function createServer(payload: CreateServerPayload): Promise<Server> {
  return apiRequest<Server>('/api/servers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateServer(id: string, payload: Partial<CreateServerPayload>): Promise<Server> {
  return apiRequest<Server>(`/api/servers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteServer(id: string): Promise<void> {
  return apiRequest<void>(`/api/servers/${id}`, {
    method: 'DELETE',
  });
}