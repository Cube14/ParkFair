import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useTheme } from '../theme';
import { Control, Display, useEditorial, usePreviewMotionPreference } from './Editorial';
import { SignatureShell } from './Signature';

// Local evaluation still from the Phase 5D.5 Porsche and Brutalist composition.
const entranceStill = { uri: 'http://127.0.0.1:8174/garage-brutalist-light.jpg' };

export function CinematicArrival({ children }: { children: ReactNode }) {
  const palette = useEditorial();
  const { isDark } = useTheme();
  const motion = usePreviewMotionPreference();
  const { height } = useWindowDimensions();
  const [finished, setFinished] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [arrival] = useState(() => new Animated.Value(0));
  const [form] = useState(() => new Animated.Value(0));
  const [framing] = useState(() => new Animated.Value(1));
  const showIntro = motion === true && !finished;

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    if (!imageReady) {
      const timeout = setTimeout(() => setFinished(true), 900);
      return () => clearTimeout(timeout);
    }
    const reveal = Animated.timing(arrival, {
      toValue: 1, duration: 3100, easing: Easing.inOut(Easing.quad), useNativeDriver: true,
    });
    reveal.start(({ finished: complete }) => { if (complete) setFinished(true); });
    return () => reveal.stop();
  }, [arrival, imageReady, showIntro]);

  useEffect(() => {
    if (!finished || motion !== true) return;
    const reveal = Animated.parallel([
      Animated.timing(form, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(framing, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]);
    reveal.start();
    return () => reveal.stop();
  }, [finished, form, framing, motion]);

  const compactHeight = Math.min(254, Math.round(height * .29));
  const fullHeight = Math.min(470, Math.round(height * .54));
  const heroHeight = motion === true
    ? framing.interpolate({ inputRange: [0, 1], outputRange: [compactHeight, fullHeight] })
    : compactHeight;
  const introImage = showIntro ? {
    opacity: arrival.interpolate({ inputRange: [0, .16, .65, 1], outputRange: [.13, .29, 1, 1] }),
    transform: [
      { translateX: arrival.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
      { scale: arrival.interpolate({ inputRange: [0, 1], outputRange: [1.17, 1] }) },
    ],
  } : undefined;

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <SignatureShell title="ParkFair access">
      {!keyboard && <Animated.View style={{ height: heroHeight, overflow: 'hidden', backgroundColor: isDark ? palette.paper : palette.ink }}>
        <Animated.View style={[StyleSheet.absoluteFill, introImage]} importantForAccessibility="no-hide-descendants">
          <Image source={entranceStill} accessible={false} resizeMode="cover" fadeDuration={0}
            onLoad={() => setImageReady(true)} onError={() => setFinished(true)} style={{ width: '100%', height: '100%' }} />
        </Animated.View>
      </Animated.View>}
      {showIntro ? <View style={[styles.panel, { borderColor: palette.rule }]}>
        <Animated.View style={{ opacity: arrival.interpolate({ inputRange: [0, .36, 1], outputRange: [.42, 1, 1] }) }}>
          <Text style={[styles.label, { color: palette.gold }]}>PRIVATE RESIDENCE PARKING</Text>
          <Display size={52}>ParkFair</Display>
        </Animated.View>
        <Control title="Skip to sign in" onPress={() => setFinished(true)} />
      </View> : motion !== null && <Animated.View style={[styles.panel, { borderColor: palette.rule },
        finished && motion === true ? { opacity: form } : undefined]}>
        <View style={{ gap: 4 }}>
          <Text style={[styles.label, { color: palette.gold }]}>RESIDENT & SOCIETY ACCESS</Text>
          <Display size={42}>Sign in</Display>
        </View>
        {children}
      </Animated.View>}
    </SignatureShell>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  panel: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 8, gap: 15, borderTopWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
});
