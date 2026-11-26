import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';

const base = { spacing: { compact: 8, item: 16, section: 24, page: 22 }, radius: 10 };
const dark = {
  ...base, background: '#242823', surface: '#30362D', line: '#858774',
  text: '#F5F1E8', secondary: '#D0C8B8', action: '#D3BC94', actionText: '#242823', error: '#FFABB4',
};
const light = {
  ...base, background: '#F7F3EA', surface: '#E9E5DC', line: '#777866',
  text: '#242823', secondary: '#51584B', action: '#364237', actionText: '#FFFFFF', error: '#9A1631',
};

type Appearance = 'System' | 'Light' | 'Dark';
const AppearanceContext = createContext({ appearance: 'System' as Appearance, setAppearance: (_value: Appearance) => {} });
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, update] = useState<Appearance>('System');
  useEffect(() => { void SecureStore.getItemAsync('parkfair.appearance').then(value => {
    if (value === 'Dark' || value === 'Light') update(value);
  }).catch(() => {}); }, []);
  function setAppearance(value: Appearance) {
    update(value);
    void SecureStore.setItemAsync('parkfair.appearance', value).catch(() => {});
  }
  return <AppearanceContext.Provider value={{ appearance, setAppearance }}>{children}</AppearanceContext.Provider>;
}
export function useTheme() {
  const preferences = useContext(AppearanceContext);
  const system = useColorScheme();
  const isDark = preferences.appearance === 'System' ? system === 'dark' : preferences.appearance === 'Dark';
  return { colors: isDark ? dark : light, isDark, ...preferences };
}
