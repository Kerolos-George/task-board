const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  status: number;
  details: string | string[];

  constructor(status: number, message: string | string[]) {
    super(Array.isArray(message) ? message.join(', ') : message);
    this.status = status;
    this.details = message;
  }
}

function getToken() {
  return localStorage.getItem('accessToken');
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (data.message as string | string[]) ?? 'Request failed',
    );
  }

  return data as T;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api<import('./types').AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  register: (body: { name: string; email: string; password: string }) =>
    api<import('./types').AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  me: () => api<import('./types').User>('/auth/me'),
};

export const projectsApi = {
  list: (params?: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== '') q.set(k, String(v));
    });
    const qs = q.toString();
    return api<import('./types').Paginated<import('./types').Project>>(
      `/projects${qs ? `?${qs}` : ''}`,
    );
  },
  get: (id: string) => api<import('./types').Project>(`/projects/${id}`),
  create: (body: { name: string; description?: string }) =>
    api<import('./types').Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: { name?: string; description?: string }) =>
    api<import('./types').Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    api<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),
  addMember: (id: string, email: string) =>
    api(`/projects/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  removeMember: (id: string, userId: string) =>
    api<{ message: string }>(`/projects/${id}/members/${userId}`, {
      method: 'DELETE',
    }),
};

export const tasksApi = {
  list: (projectId: string, params?: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    const qs = q.toString();
    return api<import('./types').Paginated<import('./types').Task>>(
      `/projects/${projectId}/tasks${qs ? `?${qs}` : ''}`,
    );
  },
  get: (projectId: string, taskId: string) =>
    api<import('./types').Task>(`/projects/${projectId}/tasks/${taskId}`),
  create: (
    projectId: string,
    body: Record<string, unknown>,
  ) =>
    api<import('./types').Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (
    projectId: string,
    taskId: string,
    body: Record<string, unknown>,
  ) =>
    api<import('./types').Task>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (projectId: string, taskId: string) =>
    api<{ message: string }>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    }),
};
