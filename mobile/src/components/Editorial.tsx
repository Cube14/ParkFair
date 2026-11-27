import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { AccessibilityInfo, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AdminOccupancy } from '../api';
import { useTheme } from '../theme';
import { TabGlyph } from './TabGlyph';

const PreviewContext = createContext({ enabled: false, toggle: () => {} });
export function DesignPreviewProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState(false);
  return <PreviewContext.Provider value={{ enabled: __DEV__ && selected,
    toggle: () => { if (__DEV__) setSelected(value => !value); } }}>{children}</PreviewContext.Provider>;
}
export const useDesignPreview = () => useContext(PreviewContext);

export function usePreviewMotion() {
  return usePreviewMotionPreference() === true;
}

export function usePreviewMotionPreference() {
  const { enabled } = useDesignPreview();
  const [reduce, setReduce] = useState<boolean | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduce(value); }).catch(() => { if (mounted) setReduce(true); });
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => { mounted = false; listener.remove(); };
  }, [enabled]);
  return enabled && (reduce === null ? null : !reduce);
}

// Owner-locked Phase 5B palette. Changes require explicit owner approval.
export function useEditorial() {
  const { isDark } = useTheme();
  return isDark
    ? { paper: '#171815', stone: '#222420', rule: '#3C4037', ink: '#F2ECDE', muted: '#BEB8A8', gold: '#DBB984', plate: '#2A3028' }
    : { paper: '#F7F3E9', stone: '#EFE8DA', rule: '#D7CEBD', ink: '#242721', muted: '#625E52', gold: '#70502D', plate: '#E1DDD1' };
}

export function Label({ children }: { children: ReactNode }) {
  const c = useEditorial();
  return <Text style={{ color: c.muted, fontSize: 11, fontWeight: '700', letterSpacing: 2 }}>{children}</Text>;
}

export function Display({ children, size = 42 }: { children: ReactNode; size?: number }) {
  const c = useEditorial();
  return <Text accessibilityRole="header" style={{ color: c.ink, fontFamily: 'serif', fontSize: size, letterSpacing: -1.5 }}>{children}</Text>;
}
export function Note({ children }: { children: ReactNode }) {
  const c = useEditorial();
  return <Text style={{ color: c.muted, fontSize: 14, lineHeight: 21 }}>{children}</Text>;
}

export function LedgerLink({ title, detail, glyph, onPress }: {
  title: string; detail?: string; glyph: string; onPress: () => void;
}) {
  const c = useEditorial();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={detail} onPress={onPress}
    style={({pressed}) => [styles.ledger, { borderColor: c.rule, opacity: pressed ? 0.65 : 1 }]}>
    <TabGlyph name={glyph} color={c.gold} />
    <View style={{flex:1}}>
      <Text style={{color:c.ink,fontSize:17,fontWeight:'600'}}>{title}</Text>
      {!!detail && <Note>{detail}</Note>}
    </View>
    <Note>›</Note>
  </Pressable>;
}

export function Control({ title, onPress, emphasis = false, disabled = false }: {
  title: string; onPress: () => void; emphasis?: boolean; disabled?: boolean;
}) {
  const c = useEditorial();
  return <Pressable accessibilityRole="button" accessibilityState={{disabled}} onPress={onPress} disabled={disabled}
    style={({pressed}) => ({ minHeight: 48, paddingHorizontal: emphasis ? 18 : 0, paddingVertical: 12,
      justifyContent: 'center', alignSelf: 'flex-start', opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      backgroundColor: emphasis ? c.ink : 'transparent', borderRadius: 3 })}>
    <Text style={{ color: emphasis ? c.paper : c.gold, fontWeight: '700', fontSize: 14 }}>{title}</Text>
  </Pressable>;
}

export function EditorialFrame({ title, eyebrow, children, tabbed = false, sheet = false }: {
  title?: string; eyebrow?: string; children: ReactNode; tabbed?: boolean; sheet?: boolean;
}) {
  const c = useEditorial();
  const { toggle } = useDesignPreview();
  const { isDark, setAppearance } = useTheme();
  return <SafeAreaView edges={sheet ? ['bottom', 'left', 'right'] : tabbed ? ['top', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}
    style={{ flex: 1, backgroundColor: c.paper }}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.frame}>
      {!sheet && <View style={[styles.masthead, { borderColor: c.rule }]}>
        <View style={styles.brand}>
          <View style={{ backgroundColor: c.ink, width: 30, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
            <TabGlyph name="parking" color={c.paper} />
          </View>
          <Text style={{ fontFamily: 'serif', fontSize: 24, color: c.ink, letterSpacing: -0.6 }}>ParkFair</Text>
        </View>
        <View style={styles.tools}>
          <Control title={isDark ? 'Light' : 'Dark'} onPress={() => setAppearance(isDark ? 'Light' : 'Dark')} />
          <Control title="Exit preview" onPress={toggle} />
        </View>
      </View>}
      {!!title && <View style={{ gap: 4, marginBottom: 4 }}>{!!eyebrow && <Label>{eyebrow}</Label>}<Display size={sheet ? 34 : 42}>{title}</Display></View>}
      {children}
    </ScrollView>
  </SafeAreaView>;
}

export function MotorImage({ immersive = false }: { immersive?: boolean }) {
  return <View style={{ minHeight: immersive ? 325 : 242, backgroundColor: '#30322B', overflow: 'hidden' }}>
    <Image source={require('../../assets/garage-preview.jpg')} accessibilityLabel="Illustrative car in an architectural garage"
      resizeMode="cover" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
    <View style={{ marginTop: immersive ? 'auto' : 10, marginLeft: immersive ? 0 : 10, paddingHorizontal: 12, paddingVertical: 8,
      backgroundColor: '#161713D9', alignSelf: 'flex-start' }}>
      <Text style={{ color: '#FAF1E0', fontSize: 10, fontWeight: '700', letterSpacing: 1.3 }}>ILLUSTRATIVE GARAGE STUDY</Text>
    </View>
  </View>;
}

export type ParkingPanel = { bay: string; description?: string; dates?: string };
export function ArrivalComposition({ current, next, notice, allocationStatus, nextStatus, onPlan, onRefresh, onReconnect }: {
  current: ParkingPanel | null; next: ParkingPanel | null; notice?: string;
  allocationStatus?: ReactNode; nextStatus?: ReactNode; onPlan: () => void; onRefresh: () => void; onReconnect?: () => void;
}) {
  const c = useEditorial();
  const router = useRouter();
  return <EditorialFrame title="Motor Court" eyebrow="RESIDENT PARKING" tabbed>
    <MotorImage />
    <View style={{ marginTop: -40, marginHorizontal: 14, padding: 17, backgroundColor: c.stone, borderTopWidth: 3, borderColor: c.gold, gap: 4 }}>
      <Label>CURRENT ALLOCATION</Label>
      {current ? <>
        <Display size={47}>{current.bay}</Display>
        {!!current.description && <Note>{current.description}</Note>}
        {!!current.dates && <Note>{current.dates}</Note>}
      </> : allocationStatus}
      {!!notice && <Note>{notice}</Note>}
      <View style={styles.tools}>
        <Control title="Parking plan" onPress={onPlan} />
        <Control title={onReconnect ? 'Reconnect' : 'Refresh'} onPress={onReconnect ?? onRefresh} />
      </View>
    </View>
    <View style={[styles.ledger, { borderColor: c.rule }]}>
      <View style={{ flex: 1, gap: 4 }}>
        <Label>UPCOMING</Label>
        {next ? <><Note>{next.description}</Note><Note>{next.dates}</Note></> : nextStatus}
      </View>
      {next && <Display size={32}>{next.bay}</Display>}
    </View>
    <Control title="Visit the private garage  ↗" onPress={() => router.push('/garage')} />
  </EditorialFrame>;
}

export function TimelineEntry({ label, bay, detail, dates }: { label?: string; bay: string; detail?: string; dates: string }) {
  const c = useEditorial();
  return <View style={{ flexDirection: 'row', gap: 14 }}>
    <View style={{ alignItems: 'center', width: 13 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.gold, marginTop: 6 }} />
      <View style={{ width: StyleSheet.hairlineWidth, flex: 1, backgroundColor: c.rule }} />
    </View>
    <View style={{ flex: 1, paddingBottom: 14, gap: 3 }}>
      {!!label && <Label>{label}</Label>}
      <Display size={32}>{bay}</Display>
      <Note>{detail}</Note><Note>{dates}</Note>
    </View>
  </View>;
}

const officeModules = [
  { name: 'Flats', caption: 'Homes and resident accounts', icon: 'account' },
  { name: 'Vehicles', caption: 'Registered vehicles', icon: 'garage' },
  { name: 'Inventory', caption: 'Bays and capacity', icon: 'parking' },
  { name: 'Cycles', caption: 'Rotation and allocation dates', icon: 'schedule' },
] as const;
export function OfficeComposition({ data, pending, retry, navigate, onDossier, onSettings }: {
  data?: AdminOccupancy['data']; pending: boolean; retry?: () => void; navigate: (name: typeof officeModules[number]['name']) => void;
  onDossier: () => void; onSettings: () => void;
}) {
  const c = useEditorial();
  const ratio = data?.totalCapacity ? Math.min(100, Math.max(0, 100 * data.activeCycleAssignments / data.totalCapacity)) : 0;
  return <EditorialFrame title="Parking Office" eyebrow="SOCIETY ADMINISTRATION">
    <View style={{ padding: 19, backgroundColor: c.plate, gap: 10, borderTopWidth: 2, borderColor: c.gold }}>
      <Label>CURRENT CYCLE</Label>
      <Display size={28}>{data?.activeCycle ?? (pending ? 'Loading cycle…' : retry ? 'Occupancy unavailable' : 'No active cycle')}</Display>
      {data && <>
        <View style={[styles.tools, { justifyContent: 'space-between', alignItems: 'flex-end' }]}>
          <View><Display size={40}>{data.activeCycleAssignments}</Display><Label>ASSIGNED</Label></View>
          <View><Display size={40}>{data.availableCapacity}</Display><Label>AVAILABLE</Label></View>
          <View><Display size={40}>{data.totalCapacity}</Display><Label>CAPACITY</Label></View>
        </View>
        <View accessible accessibilityLabel={Math.round(ratio) + '% occupied'} style={{ backgroundColor: c.rule, height: 4, marginTop: 2 }}>
          <View style={{ width: ratio + '%', height: 4, backgroundColor: c.gold }} />
        </View>
      </>}
      {!!retry && <Control title="Retry occupancy" onPress={retry} />}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Allocation workspace" onPress={onDossier}
      style={[styles.ledger, { borderColor: c.rule }]}>
      <View style={{ flex: 1 }}><Label>ALLOCATION WORKSPACE</Label><Display size={28}>Review dossier</Display></View>
      <Note>↗</Note>
    </Pressable>
    <Label>MANAGEMENT</Label>
    <View>
      {officeModules.map(module => <Pressable key={module.name} accessibilityRole="button" accessibilityLabel={module.name}
        onPress={() => navigate(module.name)} style={[styles.ledger, { borderColor: c.rule, paddingVertical: 10 }]}>
        <TabGlyph name={module.icon} color={c.gold} />
        <View style={{ flex: 1 }}><Text style={{ color: c.ink, fontSize: 17, fontWeight: '600' }}>{module.name}</Text>
          <Note>{module.caption}</Note></View><Note>›</Note>
      </Pressable>)}
    </View>
    <Control title="Office settings" onPress={onSettings} />
  </EditorialFrame>;
}

const styles = StyleSheet.create({
  frame: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 24, gap: 13 },
  masthead: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 54, gap: 6 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  ledger: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 13 },
});
