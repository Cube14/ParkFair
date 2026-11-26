import { useState } from 'react';
import { TextInput } from 'react-native';
import { ApiError } from '../../api';
import { Action, Copy, Screen } from '../../components/Screen';
import { useSession } from '../../session';
import { useTheme } from '../../theme';

export default function SignIn() {
  const { signIn } = useSession();
  const { colors } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = {
    color: colors.text, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1,
    borderRadius: colors.radius, padding: colors.spacing.item, minHeight: 48, fontSize: 16,
  };

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

  return (
    <Screen title="Sign in to ParkFair">
      <TextInput accessibilityLabel="Username or flat number" placeholder="Username or flat number"
        placeholderTextColor={colors.secondary} autoCapitalize="none" autoComplete="username" autoCorrect={false}
        editable={!busy} value={identifier} onChangeText={setIdentifier} style={input} maxLength={128} />
      <TextInput accessibilityLabel="Password" placeholder="Password" placeholderTextColor={colors.secondary}
        autoComplete="current-password" secureTextEntry editable={!busy} value={password}
        onChangeText={setPassword} onSubmitEditing={() => { void submit(); }} style={input} maxLength={1024} />
      {error && <Copy error>{error}</Copy>}
      <Action label={busy ? 'Signing in' : 'Sign in'} disabled={busy || !identifier.trim() || !password}
        onPress={() => { void submit(); }} />
    </Screen>
  );
}
