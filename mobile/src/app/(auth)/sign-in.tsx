import { useRef, useState, type ComponentRef } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useDesignPreview, useEditorial } from '../../components/Editorial';
import { CinematicArrival } from '../../components/CinematicArrival';
import { ApiError } from '../../api';
import { Action, Copy, Screen } from '../../components/Screen';
import { useSession } from '../../session';
import { useTheme } from '../../theme';

export default function SignIn() {
  const { enabled } = useDesignPreview();
  const palette = useEditorial();
  const { signIn } = useSession();
  const { colors } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const passwordField = useRef<ComponentRef<typeof TextInput>>(null);
  const input = enabled ? {
    color: palette.ink, backgroundColor: palette.stone, borderColor: palette.rule, borderWidth: 1,
    borderRadius: 3, padding: 12, minHeight: 48, fontSize: 16,
  } : {
    color: colors.text, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1,
    borderRadius: colors.radius, padding: colors.spacing.item, minHeight: 48, fontSize: 16,
  };
  const placeholder = enabled ? palette.muted : colors.secondary;

  async function submit() {
    if (busy || !identifier.trim() || !password) return;
    setBusy(true);
    setError('');
    try {
      await signIn({ identifier: identifier.trim(), password });
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'Could not sign in. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  const form = (
    <View style={{gap: 13}}>
      <View style={{ gap: 5 }}>
        {enabled && <Text style={{ color: palette.ink, fontWeight: '600' }}>Username or flat number</Text>}
        <TextInput accessibilityLabel="Username or flat number" placeholder={enabled ? undefined : 'Username or flat number'}
          placeholderTextColor={placeholder} autoCapitalize="none" autoComplete="username" autoCorrect={false}
          returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => passwordField.current?.focus()}
          editable={!busy} value={identifier} onChangeText={setIdentifier} style={input} maxLength={128} />
      </View>
      <View style={{ gap: 5 }}>
        {enabled && <Text style={{ color: palette.ink, fontWeight: '600' }}>Password</Text>}
        <TextInput ref={passwordField} accessibilityLabel="Password" placeholder={enabled ? undefined : 'Password'} placeholderTextColor={placeholder}
          autoComplete="current-password" secureTextEntry editable={!busy} value={password} returnKeyType="go"
          onChangeText={setPassword} onSubmitEditing={() => { void submit(); }} style={input} maxLength={1024} />
      </View>
      {!!error && (enabled ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite"
        style={{ color: palette.ink, borderStartWidth: 2, borderColor: palette.gold, paddingStart: 10, fontSize: 15 }}>
        {error}
      </Text> : <Copy error>{error}</Copy>)}
      <Action tone={enabled ? 'primary' : undefined} label={busy ? 'Signing in' : 'Sign in'} disabled={busy || !identifier.trim() || !password}
        onPress={() => { void submit(); }} />
    </View>
  );
  if (enabled) return <CinematicArrival>{form}</CinematicArrival>;
  return <Screen title="Sign in to ParkFair">{form}</Screen>;
}
