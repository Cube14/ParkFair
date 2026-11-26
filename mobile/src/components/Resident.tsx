import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Alert, Image, ScrollView, Text, View } from 'react-native';
import { ApiError, type ResidentAllocation } from '../api';
import { parkingKeys, type Allocation } from '../parkingClient';
import { useSession } from '../session';
import { useTheme } from '../theme';
import { ArrivalComposition, Control, Display, EditorialFrame, Label, LedgerLink, MotorImage, Note, TimelineEntry, useDesignPreview, useEditorial } from './Editorial';
import { Action, Copy, Loading, Screen } from './Screen';

const dates = (start: string, end: string) => [start, end].map(date => new Date(date)
  .toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' })).join(' – ');
const bay = (slot: string | null, type: string) => slot || (type === 'OUTSIDE' ? 'Outdoor parking' : 'Bay pending');

function AllocationLine({ allocation }: { allocation: Allocation }) {
  const { colors } = useTheme();
  return <View style={{ backgroundColor: colors.surface, padding: 18, borderLeftWidth: 3, borderColor: colors.action, gap: 5 }}>
    <Copy>{allocation.cycle.name}</Copy>
    <Text style={{ color: colors.text, fontFamily: 'serif', fontSize: 30 }}>{bay(allocation.parking.slot, allocation.parking.type)}</Text>
    <Copy>{dates(allocation.cycle.startDate, allocation.cycle.endDate)}</Copy>
  </View>;
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
  const { enabled } = useDesignPreview();
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
  const refresh = () => { void result.refetch(); void schedule.refetch(); };
  if (enabled && !plan) {
    const next = schedule.isSuccess ? schedule.data.next : null;
    return <ArrivalComposition current={display ? {
      bay: display.parking ? bay(display.parking.slot, display.parking.status) : 'No assignment',
      description: [current ? 'Flat ' + current.resident.flatNumber : '',
        display.parking && (display.parking.status === 'INSIDE' ? 'Covered parking' : 'Outdoor parking')].filter(Boolean).join(' · '),
      dates: display.cycle ? dates(display.cycle.startDate, display.cycle.endDate) : undefined,
    } : null} next={next && { bay: bay(next.parking.slot, next.parking.type), description: next.cycle.name,
      dates: dates(next.cycle.startDate, next.cycle.endDate) }}
      allocationStatus={<QueryStatus query={result} />}
      nextStatus={schedule.isSuccess ? <Note>No upcoming allocation.</Note> : <QueryStatus query={schedule} />}
      notice={offline && snapshot.data ? 'Offline snapshot · ' + new Date(snapshot.data.syncedAt).toLocaleString() : undefined}
      onPlan={() => setPlan(true)} onRefresh={refresh} onReconnect={offline ? refresh : undefined} />;
  }
  if (enabled) return <EditorialFrame title="Parking plan" eyebrow="SITE ORIENTATION" tabbed>
    <Control title="‹  Motor Court" onPress={() => setPlan(false)} />
    <Label>YOUR ASSIGNED BAY</Label>
    <Display size={38}>{display?.parking ? bay(display.parking.slot, display.parking.status) : 'Assignment unavailable'}</Display>
    {offline && snapshot.data && <Note>Offline snapshot · {new Date(snapshot.data.syncedAt).toLocaleString()}</Note>}
    <IllustrativePlan enlarged={zoom} />
    <Control title={zoom ? 'Fit plan' : 'Enlarge plan'} onPress={() => setZoom(!zoom)} />
    <Note>Illustrative geometry. North row A1–A3. South row B1–B3. Entry west, exit east. Follow on-site signage for your assigned bay.</Note>
  </EditorialFrame>;
  return <Screen previewTabbed title={plan ? 'Parking plan' : 'Motor Court'}>
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

  const { enabled } = useDesignPreview();
  const c = useEditorial();
  if (enabled) return <EditorialFrame title="Private garage" eyebrow="MOTOR COURT" tabbed>
    <MotorImage immersive />
    <View style={{ paddingVertical: 15, borderBottomWidth: 1, borderColor: c.rule, gap: 6 }}>
      <Label>REGISTERED VEHICLE</Label>
      <QueryStatus query={result} />
      {result.isSuccess && <Display size={32}>{result.data.vehicle?.number ?? 'No vehicle registered'}</Display>}
    </View>
    <Note>The vehicle shown is an illustration. This preview uses a static photograph.</Note>
  </EditorialFrame>;
  return <Screen title="Private garage">
    <Image source={require('../../assets/garage-preview.jpg')} accessibilityLabel="Illustrative concept vehicle"
      resizeMode="cover" style={{ width: '100%', height: 250, backgroundColor: colors.surface }} />
    <Copy>Garage photograph · static preview</Copy>

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
  const { enabled } = useDesignPreview();
  if (enabled) return <EditorialFrame title={history ? 'History' : 'Schedule'} eyebrow="PARKING LEDGER" tabbed>
    <View style={{flexDirection:'row',gap:20}}>
      <Control title="Schedule" emphasis={!history} onPress={() => showHistory(false)} />
      <Control title="History" emphasis={history} onPress={() => showHistory(true)} />
    </View>
    <QueryStatus query={selected} />
    {selected.isSuccess && (items.length ? items.map(item =>
      <TimelineEntry key={item.publication?.id ?? item.cycle.id}
        label={history ? 'PAST ALLOCATION' : item.cycle.id === future.data?.current?.cycle.id ? 'CURRENT' : 'UPCOMING'}
        bay={bay(item.parking.slot, item.parking.type)} detail={item.cycle.name} dates={dates(item.cycle.startDate, item.cycle.endDate)} />
    ) : <Note>No allocations to show.</Note>)}
  </EditorialFrame>;
  return <Screen title={history ? 'Parking history' : 'Parking schedule'}>
    <Action label={history ? 'Show schedule' : 'Show history'} onPress={() => showHistory(!history)} />
    <QueryStatus query={selected} />
    {selected.isSuccess && (items.length ? items.map(item => <AllocationLine key={item.publication?.id ?? item.cycle.id} allocation={item} />) : <Copy>No allocations to show.</Copy>)}
  </Screen>;
}

export function ResidentAccount() {
  const router = useRouter();
  const { session, parking, signOut } = useSession();
  let currentId: string | undefined;
  try {
    const payload = session?.token.split('.')[1];
    if (payload) currentId = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).sid;
  } catch { /* Only enable remote actions for identifiable sessions. */ }
  const { appearance, setAppearance } = useTheme();
  const { enabled } = useDesignPreview();
  const [mode, setMode] = useState<'Account' | 'Inbox' | 'Settings' | 'Security' | 'Signed-in devices'>('Account');
  const [message, setMessage] = useState('');
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => subscription.remove();
  }, []);
  const inbox = useResidentQuery<{ events: { _id: string; createdAt: string }[] }>('/resident/inbox', mode === 'Inbox');
  const sessions = useResidentQuery<{ sessions: { _id: string; client: string; current?: boolean; lastUsedAt?: string; expiresAt: string }[] }>('/auth/sessions', mode === 'Signed-in devices');
  if (enabled && mode === 'Account') return <EditorialFrame title="Profile" eyebrow="RESIDENT ACCOUNT" tabbed>
    <Label>SIGNED IN AS</Label>
    <Display size={30}>{session?.user.username}</Display>
    <LedgerLink title="Registered vehicle" detail="Open the private garage" glyph="garage" onPress={() => router.push('/garage')} />
    <LedgerLink title="Inbox" detail="Allocation updates" glyph="schedule" onPress={() => setMode('Inbox')} />
    <LedgerLink title="Settings" detail="Appearance, accessibility and security" glyph="account" onPress={() => setMode('Settings')} />
    {message && <Copy error>{message}</Copy>}
    <Control title="Sign out" onPress={() => { void signOut().catch(() => setMessage('Could not clear the saved session.')); }} />
  </EditorialFrame>;
  return <Screen previewTabbed title={mode}>
    {mode === 'Account' && (['Inbox', 'Settings'] as const).map(item =>
      <Action key={item} label={item} onPress={() => setMode(item)} />)}
    {mode !== 'Account' && <Action label="Back" onPress={() => setMode(mode === 'Signed-in devices' ? 'Security' : mode === 'Security' ? 'Settings' : 'Account')} />}
    {mode === 'Settings' && <Action label="Security" onPress={() => setMode('Security')} />}
    {mode === 'Security' && <Action label="Signed-in devices" onPress={() => setMode('Signed-in devices')} />}
    {message && <Copy>{message}</Copy>}
    {mode === 'Inbox' && <><QueryStatus query={inbox} />
      {inbox.isSuccess && (inbox.data.events.length ? inbox.data.events.map(entry => <Copy key={entry._id}>
        Simulated parking update · {new Date(entry.createdAt).toLocaleDateString()}
      </Copy>) : <Copy>No notifications.</Copy>)}</>}
    {mode === 'Settings' && <><Copy>Appearance · {appearance}</Copy>
      {(['System', 'Light', 'Dark'] as const).map(item => <Action key={item} label={item} disabled={item === appearance} onPress={() => setAppearance(item)} />)}
      <Copy>System reduced motion · {reduced ? 'On' : 'Off'}. The garage uses the Eco still preview.</Copy></>}
    {mode === 'Account' && <Copy>{session?.user.username}</Copy>}
    {mode === 'Signed-in devices' && <>
      <QueryStatus query={sessions} />
      {sessions.isSuccess && sessions.data.sessions.map(entry => <Action key={entry._id}
        disabled={entry.current === true || entry._id === currentId || (entry.current === undefined && !currentId)}
        label={(entry.current || entry._id === currentId ? 'This device' : entry.client === 'web' ? 'Sign out browser' : 'Sign out mobile device') +
          (entry.lastUsedAt ? ' · last active ' + new Date(entry.lastUsedAt).toLocaleString() : '')}
        onPress={() => Alert.alert('Revoke session?', 'That installation will need to sign in again.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Revoke', style: 'destructive', onPress: () => {
            void parking().revokeSession(entry._id).then(() => sessions.refetch()).catch(() => setMessage('Could not revoke session.'));
          } },
        ])} />)}
    </>}
    {mode === 'Account' && <>
      <Action label="Sign out" onPress={() => { void signOut().catch(() => setMessage('Could not clear the saved session.')); }} />
    </>}
  </Screen>;
}
