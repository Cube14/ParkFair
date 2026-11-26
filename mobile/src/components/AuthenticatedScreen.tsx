import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { api, ApiError } from '../api';
import { useSession } from '../session';
import { Action, Copy, Loading, Screen } from './Screen';

export function AuthenticatedScreen<T>({ title, path, children }: {
  title: string; path: string; children: (data: T) => ReactNode;
}) {
  const { session, signOut } = useSession();
  const [storageError, setStorageError] = useState(false);
  const result = useQuery({
    queryKey: [session?.user.id, path],
    enabled: Boolean(session),
    queryFn: ({ signal }) => api<T>(path, { token: session?.token, signal }),
  });
  const expired = result.error instanceof ApiError && [401, 403].includes(result.error.status);

  return (
    <Screen title={title}>
      {result.isPending && <Loading label="Loading parking information" />}
      {result.isError && <Copy error>{expired ? 'Sign out and sign in again to continue.' :
        'Parking information is temporarily unavailable.'}</Copy>}
      {result.isError && !expired && <Action label="Retry" disabled={result.isFetching}
        onPress={() => { void result.refetch(); }} />}
      {!result.isError && result.data && children(result.data)}
      {storageError && <Copy error>Could not clear the saved session. Try signing out again.</Copy>}
      <Action label="Sign out" onPress={() => { void signOut().catch(() => setStorageError(true)); }} />
    </Screen>
  );
}
