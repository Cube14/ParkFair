import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Action, Copy, Loading, Screen } from '../components/Screen';
import { SessionProvider, useSession } from '../session';
import { AppearanceProvider, useTheme } from '../theme';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: false } } });

function Navigation() {
  const { session, restoring, restoreError, retryRestore, signOut } = useSession();
  const { colors, isDark } = useTheme();
  if (restoring) return <Screen title="ParkFair"><Loading label="Restoring session" /></Screen>;
  if (restoreError) {
    return (
      <Screen title="ParkFair">
        <Copy error>Could not check the saved session. Check your connection and retry.</Copy>
        <Action label="Retry" onPress={() => { void retryRestore(); }} />
        <Action label="Clear session" onPress={() => { void signOut().catch(() => {}); }} />
      </Screen>
    );
  }
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={session?.user.role === 'RESIDENT'}>
          <Stack.Screen name="(resident)" />
        </Stack.Protected>
        <Stack.Protected guard={session?.user.role === 'ADMIN'}>
          <Stack.Screen name="(admin)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => focusManager.setFocused(state === 'active'));
    return () => listener.remove();
  }, []);
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppearanceProvider><SessionProvider><Navigation /></SessionProvider></AppearanceProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
