import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Alert, Image, ScrollView, Text, View } from 'react-native';
import { ApiError, type ResidentAllocation } from '../api';
import { parkingKeys, type Allocation } from '../parkingClient';
import { useSession } from '../session';
import { useTheme } from '../theme';
import { Action, Copy, Loading, Screen } from './Screen';

const dates = (start: string, end: string) => [start, end].map(date => new Date(date)
  .toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' })).join(' – ');
const bay = (slot: string | null, type: string) => slot || (type === 'OUTSIDE' ? 'Outdoor parking' : 'Bay pending');

function AllocationLine({ allocation }: { allocation: Allocation }) {
  return <Copy>{bay(allocation.parking.slot, allocation.parking.type)} · {allocation.cycle.name}{'\n'}
    {dates(allocation.cycle.startDate, allocation.cycle.endDate)}</Copy>;
}

function useResidentQuery<T>(path: string, enabled = true) {
  const { session, read } = useSession();
  return useQuery({
    queryKey: [...parkingKeys.resident(session?.user.id ?? ''), path],
    queryFn: ({ signal }) => read<T>(path, signal),
    enabled: enabled && !!session,
  });
}

function QueryStatus({ query }: { query: { isPending: boolean; isError: boolean; refetch: () => unknown } }) {
  if (query.isPending) return <Loading label="Loading parking" />;
  if (!query.isError) return null;
  return <><Copy error>Could not load this information.</Copy><Action label="Retry" onPress={() => { void query.refetch(); }} /></>;
}

function IllustrativePlan({ enlarged }: { enlarged: boolean }) {
  const { colors } = useTheme();
  return <ScrollView horizontal accessibilityLabel="Illustrative parking plan, scroll horizontally"
    style={{ backgroundColor: colors.surface }}>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ minWidth: enlarged ? 490 : 265, padding: 12 }}>
      {['A', 'B'].map((row, side) => <View key={row}>
        {side === 1 && <View style={{ paddingVertical: 18, borderColor: colors.line, borderBottomWidth: 1, borderStyle: 'dashed' }}>
          <Copy>Entry →      Driving aisle      → Exit</Copy>
        </View>}
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[1, 2, 3].map(number => <View key={number} style={{
            flex: 1, minHeight: enlarged ? 92 : 58, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: colors.line,
          }}><Copy>{row}{number}</Copy></View>)}
        </View>
      </View>)}
    </View>
  </ScrollView>;
}

export function ResidentParking() {
  const { colors } = useTheme();
  const { session, readCachedParking } = useSession();
  const [plan, setPlan] = useState(false);
  const [zoom, setZoom] = useState(false);
  const result = useResidentQuery<ResidentAllocation>('/resident/dashboard');
  const schedule = useResidentQuery<{ next: Allocation | null }>('/resident/schedule');
  const offline = result.isError && !(result.error instanceof ApiError);
  const account = session?.user.id ?? '';
  const snapshot = useQuery({
    queryKey: [...parkingKeys.resident(account), 'offline', result.errorUpdatedAt],
    queryFn: () => readCachedParking(account),
    enabled: !!account && offline,
    refetchInterval: 60000,
  });
  const current = result.isSuccess ? result.data : null;
  const display = current ?? (offline ? snapshot.data?.data : null);
  return <Screen title={plan ? 'Parking plan' : 'Motor Court'}>
    {offline && snapshot.data ? <><Copy>Offline snapshot · synced {new Date(snapshot.data.syncedAt).toLocaleString()}. Confirm before parking.</Copy>
      <Action label="Reconnect" onPress={() => { void result.refetch(); void schedule.refetch(); }} /></> : <QueryStatus query={result} />}
    {display && <View style={{ backgroundColor: colors.surface, padding: 18, gap: 8 }}>
      <Copy>Current parking{current ? ' · Flat ' + current.resident.flatNumber : ''}</Copy>
      <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 38, fontFamily: 'serif' }}>
        {display.parking ? bay(display.parking.slot, display.parking.status) : 'No assignment'}
      </Text>
      {display.parking && <Copy>{display.parking.status === 'INSIDE' ? 'Covered parking' : 'Outdoor parking'}</Copy>}
      {display.cycle && <Copy>{display.cycle.name} · {dates(display.cycle.startDate, display.cycle.endDate)}</Copy>}
    </View>}
    {plan ? <>
      <Copy>Illustrative plan · synthetic geometry</Copy>
      <IllustrativePlan enlarged={zoom} />
      <Action label={zoom ? 'Reset plan zoom' : 'Enlarge plan'} onPress={() => setZoom(!zoom)} />
      <Copy>Illustrative bay list · North A1, A2, A3. South B1, B2, B3. Entry west, exit east.</Copy>
      <Copy>Refer to on-site signage for your verified bay location.</Copy>
    </> : <>
      <Image source={require('../../assets/garage-preview.jpg')} accessibilityLabel="Illustrative concept car in a concrete garage"
        style={{ width: '100%', height: 220, backgroundColor: colors.surface }} resizeMode="cover" />
      <Copy>Illustrative garage · <Link href="/garage" style={{ color: colors.action }}>Open private garage</Link></Copy>
      <Copy>Next published allocation</Copy>
      {schedule.isSuccess ? (schedule.data.next ? <AllocationLine allocation={schedule.data.next} /> : <Copy>No upcoming allocation.</Copy>) :
        <QueryStatus query={schedule} />}
    </>}
    <Action label={plan ? 'Return to parking details' : 'View parking plan'} onPress={() => setPlan(!plan)} />
    {result.isSuccess && <Action label="Refresh allocations" disabled={result.isFetching}
      onPress={() => { void result.refetch(); void schedule.refetch(); }} />}
  </Screen>;
}

export function ResidentGarage() {
  const { colors } = useTheme();
  const result = useResidentQuery<ResidentAllocation>('/resident/dashboard');
  const [expanded, setExpanded] = useState(false);
  return <Screen title="Private garage">
    <Image source={require('../../assets/garage-preview.jpg')} accessibilityLabel="Illustrative concept vehicle"
      resizeMode={expanded ? 'cover' : 'contain'} style={{ width: '100%', height: expanded ? 340 : 225, backgroundColor: colors.surface }} />
    <Copy>Illustrative vehicle and garage</Copy>
    <Action label={expanded ? 'Fit image' : 'Expand image'} onPress={() => setExpanded(!expanded)} />
    <QueryStatus query={result} />
    {result.isSuccess && <Copy>{result.data.vehicle ? 'Registered vehicle · ' + result.data.vehicle.number : 'No registered vehicle shown.'}</Copy>}
  </Screen>;
}

export function ResidentSchedule() {
  const [history, showHistory] = useState(false);
  const future = useResidentQuery<{ current: Allocation | null; upcoming: Allocation[] }>('/resident/schedule', !history);
  const past = useResidentQuery<{ history: Allocation[] }>('/resident/history', history);
  const selected = history ? past : future;
  const items = selected.isSuccess ? (history ? past.data?.history ?? [] :
    [future.data?.current, ...(future.data?.upcoming ?? [])].filter((x): x is Allocation => !!x)) : [];
  return <Screen title={history ? 'Parking history' : 'Parking schedule'}>
    <Action label={history ? 'Show schedule' : 'Show history'} onPress={() => showHistory(!history)} />
    <QueryStatus query={selected} />
    {selected.isSuccess && (items.length ? items.map(item => <AllocationLine key={item.publication?.id ?? item.cycle.id} allocation={item} />) : <Copy>No allocations to show.</Copy>)}
  </Screen>;
}

export function ResidentAccount() {
  const { session, parking, signOut } = useSession();
  const { appearance, setAppearance } = useTheme();
  const [mode, setMode] = useState<'Account' | 'Inbox' | 'Settings'>('Account');
  const [message, setMessage] = useState('');
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => subscription.remove();
  }, []);
  const inbox = useResidentQuery<{ events: { _id: string; createdAt: string }[] }>('/resident/inbox', mode === 'Inbox');
  const sessions = useResidentQuery<{ sessions: { _id: string; client: string; expiresAt: string }[] }>('/auth/sessions', mode === 'Account');
  return <Screen title={mode}>
    {(['Account', 'Inbox', 'Settings'] as const).filter(item => item !== mode).map(item =>
      <Action key={item} label={item} onPress={() => setMode(item)} />)}
    {message && <Copy>{message}</Copy>}
    {mode === 'Inbox' && <><QueryStatus query={inbox} />
      {inbox.isSuccess && (inbox.data.events.length ? inbox.data.events.map(entry => <Copy key={entry._id}>
        Simulated parking update · {new Date(entry.createdAt).toLocaleDateString()}
      </Copy>) : <Copy>No notifications.</Copy>)}</>}
    {mode === 'Settings' && <><Copy>Appearance · {appearance}</Copy>
      {(['System', 'Light', 'Dark'] as const).map(item => <Action key={item} label={item} disabled={item === appearance} onPress={() => setAppearance(item)} />)}
      <Copy>System reduced motion · {reduced ? 'On' : 'Off'}. The garage uses the Eco still preview.</Copy></>}
    {mode === 'Account' && <>
      <Copy>{session?.user.username}</Copy><QueryStatus query={sessions} />
      {sessions.isSuccess && sessions.data.sessions.map(entry => <Action key={entry._id}
        label={'Revoke ' + entry.client + ' session · expires ' + new Date(entry.expiresAt).toLocaleDateString()}
        onPress={() => Alert.alert('Revoke session?', 'That installation will need to sign in again.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Revoke', style: 'destructive', onPress: () => {
            void parking().revokeSession(entry._id).then(() => sessions.refetch()).catch(() => setMessage('Could not revoke session.'));
          } },
        ])} />)}
      <Action label="Sign out" onPress={() => { void signOut().catch(() => setMessage('Could not clear the saved session.')); }} />
    </>}
  </Screen>;
}
