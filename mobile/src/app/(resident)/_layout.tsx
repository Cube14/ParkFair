import { useDesignPreview, useEditorial, usePreviewMotion } from '../../components/Editorial';
import { TabGlyph } from '../../components/TabGlyph';
import { Tabs } from 'expo-router';
import { useTheme } from '../../theme';

export const unstable_settings = { initialRouteName: 'parking' };
export default function ResidentLayout() {
  const { colors } = useTheme();
  const { enabled } = useDesignPreview();
  const c = useEditorial();
  const motion = usePreviewMotion();
  return <Tabs screenOptions={({route}) => ({
    tabBarIcon: ({color}) => <TabGlyph name={route.name} color={typeof color === 'string' ? color : colors.text}/>,
    headerShown: false, animation: motion ? 'fade' : 'none', tabBarActiveTintColor: enabled ? c.gold : colors.action,
    tabBarInactiveTintColor: enabled ? c.muted : colors.secondary, tabBarStyle: { backgroundColor: enabled ? c.paper : colors.background, borderTopColor: enabled ? c.rule : colors.line },
    tabBarLabelPosition: 'below-icon', tabBarLabelStyle: { fontSize: 13 },
  })}>
    <Tabs.Screen name="parking" options={{ title: 'Parking' }} />
    <Tabs.Screen name="garage" options={{ title: 'Garage' }} />
    <Tabs.Screen name="schedule" options={{ title: 'Schedule' }} />
    <Tabs.Screen name="account" options={{ title: 'Account' }} />
  </Tabs>;
}
