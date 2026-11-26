import { Tabs } from 'expo-router';
import { useTheme } from '../../theme';

export const unstable_settings = { initialRouteName: 'parking' };
export default function ResidentLayout() {
  const { colors } = useTheme();
  return <Tabs screenOptions={{
    headerShown: false, animation: 'none', tabBarActiveTintColor: colors.action,
    tabBarInactiveTintColor: colors.secondary, tabBarStyle: { backgroundColor: colors.background },
    tabBarLabelPosition: 'beside-icon', tabBarLabelStyle: { fontSize: 13 },
  }}>
    <Tabs.Screen name="parking" options={{ title: 'Parking' }} />
    <Tabs.Screen name="garage" options={{ title: 'Garage' }} />
    <Tabs.Screen name="schedule" options={{ title: 'Schedule' }} />
    <Tabs.Screen name="account" options={{ title: 'Account' }} />
  </Tabs>;
}
