import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, ApiError, type User } from './api';

const sessionKey = 'parkfair.refresh-token';
const legacyKey = 'parkfair.access-token';
const storageOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
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
    current.current = value;
    setSession(value);
    if (!value) cache.clear();
  }, [cache]);

  const refresh = useCallback(() => {
    if (!pendingRefresh.current) {
      pendingRefresh.current = (async () => {
        const saved = await SecureStore.getItemAsync(sessionKey);
        if (!saved) return null;
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
    const saved = await SecureStore.getItemAsync(sessionKey);
    if (saved) await api('/auth/logout', { body: { refreshToken: saved } });
    await SecureStore.deleteItemAsync(sessionKey);
    await SecureStore.deleteItemAsync(legacyKey);
    apply(null);
    setRestoreError(false);
  }

  async function read<T>(path: string, signal: AbortSignal) {
    const token = current.current?.token;
    try {
      return await api<T>(path, { token, signal });
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401 || signal.aborted) throw error;
      const refreshed = current.current?.token !== token ? current.current : await refresh();
      if (!refreshed) throw error;
      return api<T>(path, { token: refreshed.token, signal });
    }
  }

  return (
    <SessionContext.Provider value={{ session, restoring, restoreError, retryRestore, signIn, signOut, read }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('SessionProvider must wrap ParkFair routes.');
  return context;
}
