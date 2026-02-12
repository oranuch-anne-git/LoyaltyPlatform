function getToken(): string | null {
  try {
    const d = localStorage.getItem('loyalty_admin');
    return d ? JSON.parse(d).access_token : null;
  } catch {
    return null;
  }
}

/** In production (e.g. Render): set VITE_API_URL to your Admin Backend URL (e.g. https://loyalty-admin-backend.onrender.com). Leave unset for local dev (Vite proxy). */
const API_BASE = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '') || '';

const API_UNREACHABLE_MSG =
  'Cannot reach the API. Is Admin Backend running? Start it with: cd admin-backend && npm run start:dev';

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const normalizedPath = path.startsWith('http') ? path : `/api${path.replace(/^\/api/, '')}`;
  const url = path.startsWith('http') ? path : API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
  } catch (e) {
    const msg = e instanceof TypeError && e.message === 'Failed to fetch' ? API_UNREACHABLE_MSG : (e as Error).message;
    throw new Error(msg);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text.trim()) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Invalid JSON response from API. Check that the backend is reachable and returns JSON.');
  }
}

export const apiGet = <T>(path: string) => api<T>(path);
export const apiPost = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPatch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
