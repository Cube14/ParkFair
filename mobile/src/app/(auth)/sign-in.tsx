import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Control, Display, EditorialFrame, Label, MotorImage, useDesignPreview, useEditorial } from '../../components/Editorial';
import { ApiError } from '../../api';
import { Action, Copy, Screen } from '../../components/Screen';
import { useSession } from '../../session';
import { useTheme } from '../../theme';

export default function SignIn() {
  const { enabled } = useDesignPreview();
  const ink = useEditorial();
  const { signIn } = useSession();
  const { colors } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [entrance, setEntrance] = useState(false);
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

  const form = (
    <View style={{gap: 13}}>
      <TextInput accessibilityLabel="Username or flat number" placeholder="Username or flat number"
        placeholderTextColor={colors.secondary} autoCapitalize="none" autoComplete="username" autoCorrect={false}
        editable={!busy} value={identifier} onChangeText={setIdentifier} style={input} maxLength={128} />
      <TextInput accessibilityLabel="Password" placeholder="Password" placeholderTextColor={colors.secondary}
        autoComplete="current-password" secureTextEntry editable={!busy} value={password}
        onChangeText={setPassword} onSubmitEditing={() => { void submit(); }} style={input} maxLength={1024} />
      {error && <Copy error>{error}</Copy>}
      <Action tone={enabled ? 'primary' : undefined} label={busy ? 'Signing in' : 'Sign in'} disabled={busy || !identifier.trim() || !password}
        onPress={() => { void submit(); }} />
    </View>
  );
  if (enabled && entrance) return <EditorialFrame>
    <MotorImage immersive />
    <View style={{padding:24,backgroundColor:ink.stone,gap:10}}>
      <Label>RESIDENT AND SOCIETY PARKING</Label>
      <Display size={56}>ParkFair.</Display>
      <Control title="Continue to sign in" emphasis onPress={() => setEntrance(false)} />
    </View>
  </EditorialFrame>;
  if (enabled) return <EditorialFrame title="Welcome to ParkFair" eyebrow="RESIDENT AND SOCIETY ACCESS">
    <MotorImage />
    <Label>SIGN IN</Label>
    {form}
    <Control title="Preview entrance screen" onPress={() => setEntrance(true)} />
  </EditorialFrame>;
  return <Screen title="Sign in to ParkFair">{form}</Screen>;
}
