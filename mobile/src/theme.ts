import { useColorScheme } from 'react-native';

const base = { spacing: { compact: 8, item: 16, section: 24, page: 28 }, radius: 10 };
const dark = {
  ...base, background: '#121215', surface: '#202026', line: '#41414A',
  text: '#F5F3F0', secondary: '#BCBAC4', action: '#AA173D', actionText: '#FFFFFF', error: '#FF9EAD',
};
const light = {
  ...base, background: '#F7F5F1', surface: '#FFFFFF', line: '#777680',
  text: '#202026', secondary: '#514F59', action: '#9D1237', actionText: '#FFFFFF', error: '#9A1631',
};

export function useTheme() {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? dark : light, isDark };
}
