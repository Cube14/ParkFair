import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

export function Screen({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{
        padding: colors.spacing.page, gap: colors.spacing.item, flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center',
      }}>
        <Text accessibilityRole="header" style={{ fontSize: 32, fontWeight: '700', color: colors.text }}>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Copy({ children, error = false }: { children: ReactNode; error?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion={error ? 'polite' : 'none'}
      style={{ color: error ? colors.error : colors.secondary, fontSize: 16, lineHeight: 24 }}>
      {children}
    </Text>
  );
}

export function Action({ label, onPress, disabled = false, tone = 'secondary' }: {
  label: string; onPress: () => void; disabled?: boolean; tone?: 'primary' | 'secondary' | 'quiet';
}) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: tone === 'primary' ? colors.action : tone === 'quiet' ? 'transparent' : colors.surface,
        opacity: disabled ? 0.48 : pressed ? 0.78 : 1,
        minHeight: 48, justifyContent: 'center', alignItems: 'center',
        borderRadius: colors.radius, padding: colors.spacing.compact,
      })}>
      <Text style={{ color: tone === 'primary' ? colors.actionText : colors.text, fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

export function Loading({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: colors.spacing.compact }}>
      <ActivityIndicator accessibilityLabel={label} color={colors.action} />
      <Copy>{label}</Copy>
    </View>
  );
}
