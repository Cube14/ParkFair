import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createOfflineParking } from './offlineParking';
import { createParkingClient, parkingKeys } from './parkingClient';
import { api, ApiError, type ApiOptions, type ResidentAllocation, type User } from './api';

const sessionKey = 'parkfair.refresh-token';
const legacyKey = 'parkfair.access-token';
const storageOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const parkingSnapshotKey = 'parkfair.parking-snapshot.v1';
const offlineParking = createOfflineParking({
  read: () => SecureStore.getItemAsync(parkingSnapshotKey),
  write: (value) => SecureStore.setItemAsync(parkingSnapshotKey, value, storageOptions),
  clear: () => SecureStore.deleteItemAsync(parkingSnapshotKey),
});

type Credentials = { identifier: string; password: string };
type Session = { user: User; token: string };
type IssuedSession = Session & { refreshToken: string };
type SessionContextValue = {
  session: Session | null;
  restoring: boolean;
  restoreError: boolean;
  retryRestore: () => Promise<void>;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  parking: () => ReturnType<typeof createParkingClient>;
  readCachedParking: (account: string) => ReturnType<typeof offlineParking.read>;
  invalidateParking: () => Promise<void>;
  read: <T>(path: string, signal: AbortSignal) => Promise<T>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function storeSession({ refreshToken, token, user }: IssuedSession) {
  await SecureStore.setItemAsync(sessionKey, refreshToken, storageOptions);
  return { token, user };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const cache = useQueryClient();
  const current = useRef<Session | null>(null);
  const pendingRefresh = useRef<Promise<Session | null> | undefined>(undefined);
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState(false);

  const apply = useCallback((value: Session | null) => {
    const previous = current.current?.user.id;
    current.current = value;
    if (previous !== value?.user.id || !value) {
      void offlineParking.activate(value?.user.role === 'RESIDENT' ? value.user.id : null).catch(() => undefined);
      cache.clear();
    }
    setSession(value);
  }, [cache]);

  const refresh = useCallback(() => {
    if (!pendingRefresh.current) {
      pendingRefresh.current = (async () => {
        const saved = await SecureStore.getItemAsync(sessionKey);
        if (!saved) {
          apply(null);
          return null;
        }
        try {
          const result = await api<IssuedSession>('/auth/refresh', { body: { refreshToken: saved } });
          const restored = await storeSession(result);
          apply(restored);
          return restored;
        } catch (error) {
          if (!(error instanceof ApiError) || ![401, 403].includes(error.status)) throw error;
          await SecureStore.deleteItemAsync(sessionKey);
          apply(null);
          return null;
        }
      })().finally(() => { pendingRefresh.current = undefined; });
    }
    return pendingRefresh.current;
  }, [apply]);

  const restore = useCallback(async () => {
    try {
      await refresh();
      // Older bearer-only sessions cannot be exchanged for a refresh credential.
      await SecureStore.deleteItemAsync(legacyKey);
    } catch {
      setRestoreError(true);
    } finally {
      setRestoring(false);
    }
  }, [refresh]);

  useEffect(() => { void Promise.resolve().then(restore); }, [restore]);

  async function retryRestore() {
    setRestoreError(false);
    setRestoring(true);
    await restore();
  }

  async function signIn(credentials: Credentials) {
    const next = await api<IssuedSession>('/auth/login', { body: credentials });
    apply(await storeSession(next));
  }

  async function signOut() {
    await pendingRefresh.current?.catch(() => undefined);
    try {
      const saved = await SecureStore.getItemAsync(sessionKey);
      if (saved) await api('/auth/logout', { body: { refreshToken: saved } });
    } finally {
      apply(null);
      setRestoreError(false);
      await Promise.all([SecureStore.deleteItemAsync(sessionKey), SecureStore.deleteItemAsync(legacyKey),
        offlineParking.activate(null)]);
    }
  }

  async function request<T>(path: string, options: ApiOptions = {}) {
    const before = current.current;
    if (!before) throw new ApiError(401, 'Sign-in required.');
    try {
      return await api<T>(path, { ...options, token: before.token });
    } catch (error) {
      if (!(error instanceof ApiError) || ![401, 403].includes(error.status) || options.signal?.aborted) throw error;
      if (error.status === 403 && path.startsWith('/resident/')) {
        await offlineParking.activate(null);
        throw error;
      }
      if (error.status !== 401) throw error;
      const refreshed = current.current?.token !== before.token ? current.current : await refresh();
      if (!refreshed || refreshed.user.id !== before.user.id) throw error;
      return api<T>(path, { ...options, token: refreshed.token });
    }
  }

  async function read<T>(path: string, signal: AbortSignal) {
    const account = current.current?.user.id;
    const result = await request<T>(path, { signal });
    if (account && path === '/resident/dashboard') {
      await offlineParking.save(account, result as ResidentAllocation).catch(() => undefined);
    }
    return result;
  }

  async function invalidateParking() {
    const account = current.current?.user.id;
    if (!account) return;
    await Promise.all([cache.invalidateQueries({ queryKey: parkingKeys.resident(account) }),
      cache.invalidateQueries({ queryKey: parkingKeys.administration(account) })]);
  }

  return (
    <SessionContext.Provider value={{ session, restoring, restoreError, retryRestore, signIn, signOut, read, parking: () => createParkingClient(request),
        readCachedParking: offlineParking.read, invalidateParking }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('SessionProvider must wrap ParkFair routes.');
  return context;
}
