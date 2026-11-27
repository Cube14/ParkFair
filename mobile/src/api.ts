import { fetch as expoFetch } from 'expo/fetch';

export type Role = 'ADMIN' | 'RESIDENT';
export type User = { id: string; username: string; role: Role };
export type ResidentAllocation = {
  resident: { name: string; flatNumber: string };
  vehicle: { number: string } | null;
  parking: { status: 'INSIDE' | 'OUTSIDE'; slot: string } | null;
  cycle: { name: string; startDate: string; endDate: string; remainingDays: number } | null;
};
export type AdminOccupancy = {
  data: {
    activeCycle: string | null;
    activeCycleAssignments: number;
    totalCapacity: number;
    availableCapacity: number;
    activeCycleStartDate?: string | null;
    activeCycleEndDate?: string | null;
    insideAssignments?: number;
    outsideAssignments?: number;
  };
};

export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export type ApiOptions = {
  token?: string;
  body?: Record<string, unknown>;
  raw?: Blob | Uint8Array<ArrayBuffer>;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  signal?: AbortSignal;
};

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  let base: URL;
  try {
    base = new URL(configured ?? '');
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash ||
        !base.pathname.replace(/\/$/, '').endsWith('/api')) {
      throw new Error();
    }
  } catch {
    throw new ApiError(0, 'Set EXPO_PUBLIC_API_URL to a trusted HTTPS address ending in /api.');
  }

  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (options.signal?.aborted) cancel();
  options.signal?.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(cancel, 15000);
  let response: Pick<Response, 'ok' | 'status' | 'json'>;
  let result;
  try {
    const send = options.raw instanceof Uint8Array ? expoFetch : fetch;
    response = await send(base.href.replace(/\/$/, '') + path, {
      method: options.method ?? (options.body || options.raw ? 'POST' : 'GET'),
      headers: {
        Accept: 'application/json',
        ...(['/auth/login', '/auth/refresh', '/auth/logout'].includes(path) && { 'X-ParkFair-Session': 'native' }),
        ...(options.body && { 'Content-Type': 'application/json' }),
        ...options.headers,
        ...(options.token && { Authorization: `Bearer ${options.token}` }),
      },
      body: options.raw ?? (options.body && JSON.stringify(options.body)),
      signal: controller.signal,
    });
    result = await response.json().catch(() => null);
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', cancel);
  }
  if (!response.ok) {
    const message = response.status >= 500 ? undefined : result?.message;
    throw new ApiError(response.status, typeof message === 'string' ? message : 'ParkFair could not complete the request.');
  }
  if (path === '/flats' && !options.method && Array.isArray(result)) return { data: result } as T;
  if (!result || result.success !== true) throw new ApiError(response.status, 'ParkFair returned an unexpected response.');
  return result as T;
}
