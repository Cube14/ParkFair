import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError, type User } from './api';

const sessionKey = 'parkfair.access-token';
const storageOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
type Credentials = { identifier: string; password: string };
type Session = { user: User; token: string } | null;
type SessionContextValue = {
  session: Session;
  restoring: boolean;
  restoreError: boolean;
  retryRestore: () => Promise<void>;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const cache = useQueryClient();
  const [session, setSession] = useState<Session>(null);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState(false);

  const restore = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(sessionKey);
      if (!token) return;
      const { user } = await api<{ user: User }>('/auth/me', { token });
      setSession({ user, token });
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        await SecureStore.deleteItemAsync(sessionKey).catch(() => setRestoreError(true));
      } else {
        setRestoreError(true);
      }
    } finally {
      setRestoring(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(restore); }, [restore]);

  async function retryRestore() {
    setRestoreError(false);
    setRestoring(true);
    await restore();
  }

  async function signIn(credentials: Credentials) {
    const next = await api<{ user: User; token: string }>('/auth/login', { body: credentials });
    await SecureStore.setItemAsync(sessionKey, next.token, storageOptions);
    setSession(next);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(sessionKey);
    cache.clear();
    setSession(null);
    setRestoreError(false);
  }

  return (
    <SessionContext.Provider value={{ session, restoring, restoreError, retryRestore, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('SessionProvider must wrap ParkFair routes.');
  return context;
}
