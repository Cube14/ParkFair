import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useState } from 'react';
import { Alert, Modal, Text, TextInput, View } from 'react-native';
import { ApiError } from '../api';
import { applyDraftReview, type ColumnMapping, type DraftResponse, type InputFile, type Row } from '../parkingClient';
import { useSession } from '../session';
import { useTheme } from '../theme';
import { Action, Copy, Screen } from './Screen';

type Cycle = { _id: string; cycleName: string; status: string };
type Publication = { _id: string; draftId: string; revision: number; sequence: number };
const steps = ['Prepare', 'Review', 'Confirm', 'Publish', 'Communicate'];
const fields = { flatNumber: 'Flat', slotNumber: 'Bay', vehicleNumber: 'Vehicle', notes: 'Notes' };
const xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const blank = { flatNumber: '', slotNumber: '', vehicleNumber: '', notes: '' };
function Field({ label, value, set }: { label: string; value: string; set: (value: string) => void }) {
  const { colors } = useTheme();
  return <View style={{ gap: 4 }}>
    <Copy>{label}</Copy>
    <TextInput accessibilityLabel={label} value={value} onChangeText={set}
      autoCorrect={false} style={{ minHeight: 48, fontSize: 16, padding: 12, color: colors.text, backgroundColor: colors.surface }} />
  </View>;
}

export default function Dossier() {
  const router = useRouter();
  const { session, parking, read, signOut } = useSession();
  const { colors } = useTheme();
  const client = parking();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [notice, setNotice] = useState('');
  const [cycle, setCycle] = useState<Cycle>();
  const [draft, setDraft] = useState<DraftResponse>();
  const [stage, setStage] = useState(0);
  const [file, setFile] = useState<InputFile>();
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof client.previewImport>>>();
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [publication, setPublication] = useState<Publication>();
  const [comparison, setComparison] = useState<Awaited<ReturnType<typeof client.compare>>['changes']>();
  const [drawer, setDrawer] = useState(false);
  const [filter, setFilter] = useState('');
  const [row, setRow] = useState<Row>(blank);
  const [picker, setPicker] = useState<'flatNumber' | 'vehicleNumber' | 'slotNumber'>();
  const [term, setTerm] = useState('');
  const inventory = useQuery({
    queryKey: ['allocation-admin', session?.user.id, 'registered-options', picker],
    enabled: !!picker && drawer,
    queryFn: ({signal}) => read<{data: (Row & {isActive?: boolean; flatId?: {flatNumber:string}})[]}>(
      picker === 'flatNumber' ? '/flats' : picker === 'vehicleNumber' ? '/vehicles' : '/slots', signal),
  });
  const [index, setIndex] = useState<number | null>(null);
  const [exclusion, setExclusion] = useState({ flatNumber: '', reason: '' });
  const [creatingCycle, setCreatingCycle] = useState(false);
  const [cycleForm, setCycleForm] = useState({ cycleName: '', startDate: '', endDate: '' });
  const [notification, setNotification] = useState<{ _id: string; count: number }[]>();
  const [scheduled, setScheduled] = useState<Awaited<ReturnType<typeof client.schedules>>['schedules']>();
  const cycles = useQuery({
    queryKey: ['allocation-admin', session?.user.id, 'cycles'],
    queryFn: ({ signal }) => read<{ data: Cycle[] }>('/cycles', signal),
  });
  const drafts = useQuery({
    queryKey: ['allocation-admin', session?.user.id, cycle?._id, 'drafts'],
    queryFn: ({ signal }) => read<{ drafts: DraftResponse['draft'][] }>('/allocation-drafts?cycleId=' + encodeURIComponent(cycle!._id), signal),
    enabled: !!cycle && !draft,
  });
  const id = draft?.draft._id;
  const revision = draft?.draft.revision;
  const editable = draft && ['DRAFT', 'VALIDATED', 'APPROVED'].includes(draft.draft.status);
  const rows = draft?.version?.rows ?? [];
  const exclusions = draft?.version?.exclusions ?? [];
  const rowData = ({ flatNumber, slotNumber, vehicleNumber, notes }: Row): Row => ({ flatNumber, slotNumber, vehicleNumber, notes });

  function run(task: () => Promise<void>) {
    if (busy) return;

    setBusy(true);
    setError('');
    setNotice('');
    void task().catch((failure: unknown) => {
      setConflict(failure instanceof ApiError && failure.status === 409);
      setError(failure instanceof ApiError ? failure.message : 'Request could not complete. Check connectivity and retry.');
    }).finally(() => { setBusy(false); });
  }

  function confirm(title: string, message: string, task: () => Promise<void>) {
    Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: () => run(task) }]);
  }

  async function load(draftId: string) {
    const next = await client.getDraft(draftId);
    setDraft(next);
    setFile(undefined);
    setPreview(undefined);
    setComparison(undefined);
    setPublication(undefined);
    setConflict(false);
    const status = next.draft.status;
    if (status === 'PUBLISHED') {
      const found = await read<{ publications: Publication[] }>('/allocation-drafts/publications/' + next.draft.cycleId, new AbortController().signal);
      setPublication(found.publications.find(item => item.draftId === draftId && item.revision === next.draft.revision));
    }
    setStage(status === 'APPROVED' || status === 'PUBLISHED' ? 3 : status === 'VALIDATED' ? 2 : 0);
  }

  async function pick() {
    const picked = await DocumentPicker.getDocumentAsync({ type: [xlsx, 'text/csv', 'text/comma-separated-values', 'application/csv', 'application/vnd.ms-excel'], copyToCacheDirectory: true });
    if (picked.canceled) return;
    setPreview(undefined);
    setFile(undefined);
    const asset = picked.assets[0];
    const mime = asset.name.toLowerCase().endsWith('.xlsx') ? xlsx : asset.name.toLowerCase().endsWith('.csv') ? 'text/csv' : null;
    const local = new File(asset.uri);
    try {
      if (!mime || !local.size || local.size > 1048576) throw new ApiError(400, 'Choose a CSV or XLSX file up to 1 MB.');
      const next: InputFile = { filename: asset.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120), mime, bytes: await local.bytes() };
      const data = await client.previewImport(id!, next);
      setFile(next);
      setPreview(data);
      setMapping(Object.fromEntries(data.columns.filter(column => column.mapped).map(column => [column.mapped, column.column])));
    } finally {
      if (local.exists) local.delete();
    }
  }

  function saveRow() {
    const next = rows.map(rowData);
    if (index === -1) next.push(row);
    else if (index !== null) next[index] = row;
    run(async () => {
      setDraft(await client.editDraft(id!, revision!, next, exclusions));
      setIndex(null);
      setStage(1);
    });
  }

  const act = (label: string, press: () => void, disallowed = false) =>
    <Action label={label} onPress={press} disabled={busy || disallowed} />;
  return <Screen title="Allocation dossier">
    {act('Parking office', () => router.replace('/occupancy'))}
    <View accessibilityLabel={'Stage ' + (stage + 1) + ' of ' + steps.length + ', ' + steps[stage]}
      accessible style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {steps.map((step, i) => <Text key={step} style={{
        paddingVertical: 6, paddingHorizontal: 8,
        backgroundColor: i === stage ? colors.surface : colors.background,
        color: i === stage ? colors.text : colors.secondary, fontWeight: i === stage ? '700' : '400',
      }}>{i + 1}. {step}</Text>)}
    </View>
    <Copy>{cycle?.cycleName ?? 'Choose a parking cycle'}{revision ? ' · Revision ' + revision + ' · ' + draft.draft.status : ''}</Copy>
    {busy && <Copy>Working…</Copy>}
    {error && <Copy error>{error}</Copy>}
    {notice && <Copy>{notice}</Copy>}
    {conflict && id && act('Reload current revision', () => run(() => load(id)))}

    {!cycle && <>
      {cycles.isPending && <Copy>Loading cycles…</Copy>}
      {cycles.isError && act('Retry cycles', () => { void cycles.refetch(); })}
      {cycles.data?.data.filter(item => item.status !== 'COMPLETED').map(item =>
        <View key={item._id}>{act(item.cycleName + ' · ' + item.status, () => setCycle(item))}</View>)}
      {act(creatingCycle ? 'Close cycle form' : 'New planned cycle', () => setCreatingCycle(!creatingCycle))}
      {creatingCycle && <>
        <Field label="Cycle name" value={cycleForm.cycleName} set={cycleName => setCycleForm({ ...cycleForm, cycleName })} />
        <Field label="Start date · YYYY-MM-DD" value={cycleForm.startDate} set={startDate => setCycleForm({ ...cycleForm, startDate })} />
        <Field label="End date · YYYY-MM-DD" value={cycleForm.endDate} set={endDate => setCycleForm({ ...cycleForm, endDate })} />
        {act('Create cycle', () => run(async () => {
          const days = Math.round((Date.parse(cycleForm.endDate) - Date.parse(cycleForm.startDate)) / 86400000) + 1;
          if (!Number.isInteger(days) || days < 1 || !cycleForm.cycleName.trim()) throw new ApiError(400, 'Enter a cycle name and valid dates.');
          const result = await parking().createCycle({ ...cycleForm, durationDays: days });
          setCycle(result.data);
          setCreatingCycle(false);
          void cycles.refetch();
        }))}
      </>}
    </>}
    {cycle && !draft && <>
      {drafts.isError && act('Retry drafts', () => { void drafts.refetch(); })}
      {drafts.data?.drafts.filter(item => item.status !== 'CANCELLED').map(item => <View key={item._id}>
        {act('Open revision ' + item.revision + ' · ' + item.status, () => run(() => load(item._id)))}
      </View>)}
      {act('Create draft', () => run(async () => { setDraft(await client.createDraft(cycle._id)); }))}
    </>}

    {draft && stage === 0 && <>
      {act('Choose CSV or Excel file', () => run(pick), !editable || conflict)}
      {preview && <>
        <Copy>{file?.filename} · {preview.dataRows} rows</Copy>
        {preview.columns.map(column => <Copy key={column.column}>{column.column} · {column.label}</Copy>)}
        {preview.importIssues.map((issue, i) => <Copy error key={i}>{issue.message}</Copy>)}
        {(Object.keys(fields) as (keyof Row)[]).map(field => <Field key={field}
          label={fields[field] + ' column number'} value={mapping[field]?.toString() ?? ''}
          set={value => setMapping({ ...mapping, [field]: value ? Number(value) : undefined })} />)}
        {act('Preview updated mapping', () => run(async () => {
          setPreview(await client.previewImport(id!, file!, mapping));
        }), conflict)}
        {act('Replace draft rows from file', () => confirm('Import rows?', 'The upload creates a new draft revision.', async () => {
          setDraft(await client.upload(id!, revision!, file!, mapping));
          setFile(undefined);
          setPreview(undefined);
          setStage(1);
        }), conflict)}
      </>}
      {act('Review current rows', () => setStage(1))}
    </>}

    {draft && stage === 1 && <>
      <Copy>{rows.length} chart rows · {exclusions.length} reviewed exclusions</Copy>
      {!!draft.coverage && <Copy>{draft.coverage.totalAssignedFlats} of {draft.coverage.totalEligibleFlats} eligible flats assigned
        {'\n'}Unassigned · {draft.coverage.unassignedEligibleFlats.join(', ') || 'None'}
        {'\n'}Covered available · {draft.coverage.capacity.INSIDE.available} · Outdoor available · {draft.coverage.capacity.OUTSIDE.available}</Copy>}
      {(draft.issues ?? draft.version?.importIssues ?? []).map((issue, i) =>
        <Copy error key={i}>{issue.row ? 'Row ' + issue.row + ' · ' : ''}{issue.message}</Copy>)}
      {act('Validate and refresh coverage', () => run(async () => {
        setDraft(applyDraftReview(draft, await client.validate(id!, revision!)));
      }), !editable || conflict)}
      <Field label="Excluded flat" value={exclusion.flatNumber} set={flatNumber => setExclusion({ ...exclusion, flatNumber })} />
      <Field label="Exclusion reason" value={exclusion.reason} set={reason => setExclusion({ ...exclusion, reason })} />
      {act('Record reviewed exclusion', () => run(async () => {
        setDraft(await client.editDraft(id!, revision!, rows.map(rowData),
          [...exclusions.filter(item => item.flatNumber !== exclusion.flatNumber.trim()), exclusion]));
        setExclusion({ flatNumber: '', reason: '' });
      }), !editable || conflict || !exclusion.flatNumber.trim() || !exclusion.reason.trim())}
      {exclusions.map(item => <View key={item.flatNumber}><Copy>{item.flatNumber} · {item.reason}</Copy>
        {act('Remove exclusion for ' + item.flatNumber, () => run(async () => {
          setDraft(await client.editDraft(id!, revision!, rows.map(rowData), exclusions.filter(entry => entry.flatNumber !== item.flatNumber)));
        }), !editable || conflict)}</View>)}
      {act('Continue to confirmation', () => { setComparison(undefined); setStage(2); }, draft.draft.status !== 'VALIDATED' || conflict)}
      {act('Back to prepare', () => setStage(0))}
    </>}

    {draft && stage === 2 && <>
      <Copy>Review revision {revision} before approving it for publication.</Copy>
      {revision! > 1 && act('Compare with previous revision', () => run(async () => {
        setComparison((await client.compare(id!, revision! - 1, revision!)).changes);
      }))}
      {revision === 1 && <Copy>First revision · review the current chart.</Copy>}
      {comparison?.map(change => <View key={change.row}>
        <Copy>Row {change.row}</Copy>
        {(Object.keys(fields) as (keyof Row)[]).filter(field => change.previous?.[field] !== change.current?.[field])
          .map(field => <Copy key={field}>{fields[field]} · {change.previous?.[field] || '—'} → {change.current?.[field] || '—'}</Copy>)}
      </View>)}
      {comparison?.length === 0 && <Copy>No row changes.</Copy>}
      {act('Approve revision', () => confirm('Approve this revision?', 'Review and confirm the exact revision shown above.', async () => {
        setDraft(applyDraftReview(draft, await client.approve(id!, revision!)));
        setStage(3);
      }), draft.draft.status !== 'VALIDATED' || conflict)}
      {act('Back to review', () => setStage(1))}
    </>}

    {draft && cycle && stage === 3 && <>
      {!publication && act('Publish approved revision', () => confirm('Publish allocation?', 'The publication is immutable. Activation is a separate step.', async () => {
        const result = await client.publish(id!, revision!, 'mobile-' + id + '-' + revision);
        setPublication({ ...result.publication, draftId: id!, revision: revision! });
        setDraft({ ...draft, draft: { ...draft.draft, status: 'PUBLISHED' } });
      }), draft.draft.status !== 'APPROVED' || conflict)}
      {publication && <>
        <Copy>Published · version {publication.sequence}</Copy>
        {act('Activate manually', () => confirm('Activate publication ' + publication.sequence + '?',
          'Use this published chart for ' + cycle.cycleName + '. The server checks inventory and dates.', async () => {
          await client.activate(cycle._id, publication._id);
          setNotice('Cycle activated.');
        }), conflict)}
        <Copy>Schedule requests record an intent. Automatic execution is disabled in production.</Copy>
        {act('Record activation intent', () => confirm('Record activation intent?', 'This does not enable an automatic production worker.', async () => {
          await client.scheduleActivation(cycle._id, publication._id, true);
          setScheduled((await client.schedules(cycle._id)).schedules);
        }), conflict)}
        {act('Refresh activation intents', () => run(async () => { setScheduled((await client.schedules(cycle._id)).schedules); }))}
        {scheduled?.map(item => <View key={item._id}>
          <Copy>{item.status} · {new Date(item.dueAt).toLocaleString()}</Copy>
          {['PENDING', 'RETRY'].includes(item.status) && act('Cancel activation intent', () => confirm(
            'Cancel activation intent?', 'The published allocation stays available for review.', async () => {
              await client.cancelSchedule(cycle._id, item._id);
              setScheduled((await client.schedules(cycle._id)).schedules);
            },
          ))}
        </View>)}
        {act('Continue to communicate', () => { setNotification(undefined); setStage(4); })}
      </>}
    </>}

    {publication && cycle && stage === 4 && <>
      <Copy>Publication prepares outbox entries. External delivery is disabled. Delivered counts represent simulated inbox events.</Copy>
      {act('Check notification outcomes', () => run(async () => {
        const result = await read<{ counts: { _id: string; count: number }[] }>(
          '/allocation-drafts/publications/' + cycle._id + '/' + publication._id + '/notifications', new AbortController().signal);
        setNotification(result.counts);
      }))}
      {notification?.map(item => <Copy key={item._id}>{item._id === 'DELIVERED' ? 'Simulated delivery' : item._id} · {item.count}</Copy>)}
      {notification?.length === 0 && <Copy>No notification entries.</Copy>}
      {act('Back to publication', () => setStage(3))}
    </>}
    {draft && act('Open chart drawer', () => { setFilter(''); setDrawer(true); })}
    {draft && act('View draft activity', () => run(async () => {
      const activity = await read<{ events: { action: string; createdAt: string }[] }>('/allocation-drafts/audit/' + id, new AbortController().signal);
      Alert.alert('Draft activity', activity.events.slice(0, 6).map(event =>
        event.action.replace(/_/g, ' ').toLowerCase() + ' · ' + new Date(event.createdAt).toLocaleString()).join('\n') || 'No events.');
    }))}
    {cycle && act('Choose another cycle', () => {
      setCycle(undefined); setDraft(undefined); setPublication(undefined); setPreview(undefined); setFile(undefined);
      setScheduled(undefined); setStage(0); setError(''); setConflict(false); setNotice('');
    })}
    {act('Sign out', () => run(signOut))}

    <Modal visible={drawer} animationType="none" presentationStyle="formSheet" onRequestClose={() => { if (!busy) { setDrawer(false); setIndex(null); } }}>
      <Screen title={index !== null ? 'Edit chart row' : 'Allocation chart'}>
        {error && <Copy error>{error}</Copy>}
        {index === null ? <>
          <Field label="Search flats, bays or vehicles" value={filter} set={setFilter} />
          {rows.map((item, i) => ({ item, i })).filter(({ item }) =>
            [item.flatNumber, item.slotNumber, item.vehicleNumber].join(' ').toLowerCase().includes(filter.trim().toLowerCase()))
            .map(({ item, i }) => <View key={item.row}>{act('Row ' + item.row + ' · ' + item.flatNumber + ' / ' + item.slotNumber, () => {
              setRow(rowData(item)); setIndex(i);
            }, !editable || conflict)}</View>)}
          {act('Add manual row', () => { setRow(blank); setIndex(-1); }, !editable || conflict)}
          {act('Close chart', () => setDrawer(false))}
        </> : <>
          {(['flatNumber','slotNumber','vehicleNumber'] as const).map(field =>
            <Action key={field} label={'Choose registered ' + fields[field].toLowerCase()} onPress={() => { setPicker(field); setTerm(''); }} />)}
          {picker && <>
            <Field label="Filter registered values" value={term} set={setTerm} />
            {inventory.isError && act('Retry inventory', () => { void inventory.refetch(); })}
            {inventory.data?.data.filter(item => item.isActive !== false && item[picker]?.toLowerCase().includes(term.toLowerCase())
              && (picker !== 'vehicleNumber' || !row.flatNumber || item.flatId?.flatNumber === row.flatNumber)).map(item =>
              <Action key={item[picker]} label={item[picker]!} onPress={() => {
                setRow({ ...row, [picker]: item[picker], ...(picker === 'flatNumber' && {vehicleNumber: ''}) });
                setPicker(undefined);
              }} />)}
            {act('Close choices', () => setPicker(undefined))}
          </>}
          {(Object.keys(fields) as (keyof Row)[]).map(field =>
            <Field key={field} label={fields[field]} value={row[field] ?? ''} set={value => setRow({ ...row, [field]: value })} />)}
          {act('Save correction', saveRow, conflict || !row.flatNumber.trim() || !row.slotNumber.trim())}
          {index >= 0 && act('Remove row', () => confirm('Remove chart row?', 'This creates a new draft revision.', async () => {
            setDraft(await client.editDraft(id!, revision!, rows.filter((_, i) => i !== index).map(rowData), exclusions));
            setIndex(null);
            setStage(1);
          }), conflict)}
          {act('Back to chart', () => setIndex(null))}
        </>}
        {busy && <Text style={{ color: colors.text }}>Saving…</Text>}
      </Screen>
    </Modal>
  </Screen>;
}
