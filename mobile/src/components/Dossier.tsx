import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { ApiError } from '../api';
import { applyDraftReview, type ColumnMapping, type DraftResponse, type InputFile, type Row } from '../parkingClient';
import { useSession } from '../session';
import { useTheme } from '../theme';
import { Control, Display, EditorialFrame, Label, Note, useDesignPreview, useEditorial, usePreviewMotion } from './Editorial';
import { Action, Copy, Screen } from './Screen';

type Cycle = { _id: string; cycleName: string; status: string };
type Publication = { _id: string; draftId: string; revision: number; sequence: number; activatedAt?: string | null };
const steps = ['Prepare', 'Review', 'Confirm', 'Publish', 'Communicate'];
const fields = { flatNumber: 'Flat', slotNumber: 'Bay', vehicleNumber: 'Vehicle', notes: 'Notes' };
const xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const blank = { flatNumber: '', slotNumber: '', vehicleNumber: '', notes: '' };
function Field({ label, value, set }: { label: string; value: string; set: (value: string) => void }) {
  const { colors } = useTheme();
  const { enabled } = useDesignPreview();
  const c = useEditorial();
  return <View style={{ gap: 4 }}>
    <Copy>{label}</Copy>
    <TextInput accessibilityLabel={label} value={value} onChangeText={set}
      autoCorrect={false} style={{ minHeight: 48, fontSize: 16, padding: 12, color: enabled ? c.ink : colors.text, backgroundColor: enabled ? c.stone : colors.surface }} />
  </View>;
}

export default function Dossier() {
  const router = useRouter();
  const { enabled } = useDesignPreview();
  const ink = useEditorial();
  const motion = usePreviewMotion();
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
  const [mappingField, setMappingField] = useState<keyof Row>();
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
  const [showExclusion, setShowExclusion] = useState(false);
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
  const issues = draft?.issues ?? draft?.version?.importIssues ?? [];
  const groups = new Map<number | null, typeof issues>();
  for (const issue of issues) groups.set(issue.row, [...(groups.get(issue.row) ?? []), issue]);
  const choices = picker ? inventory.data?.data.filter(item => item.isActive !== false && item[picker]?.toLowerCase().includes(term.trim().toLowerCase())
    && (picker !== 'vehicleNumber' || !row.flatNumber || item.flatId?.flatNumber === row.flatNumber)) : undefined;
  const matchingRows = rows.map((item, i) => ({ item, i })).filter(({ item }) =>
    [item.flatNumber, item.slotNumber, item.vehicleNumber].join(' ').toLowerCase().includes(filter.trim().toLowerCase()));
  const canConfirm = draft?.draft.status === 'VALIDATED' && !conflict;

  function openRow(target: number, field?: string) {
    setRow(target >= 0 ? rowData(rows[target]) : blank);
    setIndex(target);
    setPicker(field === 'flatNumber' || field === 'slotNumber' || field === 'vehicleNumber' ? field : undefined);
    setTerm('');
    setDrawer(true);
  }

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
    setMappingField(undefined);
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
    setMappingField(undefined);
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
  const Frame = enabled ? EditorialFrame : Screen;
  return <Frame title={enabled && stage === 1 ? "Allocation review" : "Allocation dossier"} eyebrow="PARKING OFFICE">
    {act('Parking office', () => router.replace('/occupancy'))}
    {enabled && <View accessible accessibilityLabel={'Stage ' + (stage + 1) + ' of 5: ' + steps[stage]} style={{ flexDirection:'row', gap:4 }}>
      {steps.map((label, i) => <View key={label} style={{ flex:1, gap:5 }}>
        <View style={{ height:3, backgroundColor:i <= stage ? ink.gold : ink.rule }} />
        <Text style={{ color:i === stage ? ink.ink : ink.muted, fontSize:10, fontWeight:i === stage ? '700' : '400' }}>{label}</Text>
      </View>)}
    </View>}
    {!enabled && <View accessibilityLabel={'Stage ' + (stage + 1) + ' of ' + steps.length + ', ' + steps[stage]}
      accessible style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {steps.map((step, i) => <Text key={step} style={{
        paddingVertical: 6, paddingHorizontal: 8,
        backgroundColor: i === stage ? colors.surface : colors.background,
        color: i === stage ? colors.text : colors.secondary, fontWeight: i === stage ? '700' : '400',
      }}>{i + 1}. {step}</Text>)}
    </View>}
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
      {drafts.isPending && <Note>Loading draft revisions…</Note>}
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
        {!enabled && preview.columns.map(column => <Copy key={column.column}>{column.column} · {column.label}</Copy>)}
        {preview.importIssues.map((issue, i) => <Copy error key={i}>{issue.message}</Copy>)}
        {enabled ? <View style={{ padding: 12, backgroundColor: ink.stone, gap: 3 }}>
          <Label>WORKBOOK MAPPING</Label>
          {(Object.keys(fields) as (keyof Row)[]).map(field => <View key={field}>
            <Control title={fields[field] + ' · ' + (preview.columns.find(column => column.column === mapping[field])?.label ?? 'Unmapped')}
              onPress={() => setMappingField(mappingField === field ? undefined : field)} disabled={busy} />
            {mappingField === field && <View style={{ marginStart: 10, paddingStart: 12, borderStartWidth: 2, borderColor: ink.rule }}>
              {preview.columns.map(column => <Control key={column.column} title={column.column + ' · ' + column.label}
                disabled={busy || Object.entries(mapping).some(([other, value]) => other !== field && value === column.column)}
                onPress={() => { setMapping({ ...mapping, [field]: column.column }); setMappingField(undefined); }} />)}
              <Control title="Clear field mapping" onPress={() => { setMapping({ ...mapping, [field]: undefined }); setMappingField(undefined); }} />
            </View>}
          </View>)}
        </View> : (Object.keys(fields) as (keyof Row)[]).map(field => <Field key={field}
          label={fields[field] + ' column number'} value={mapping[field]?.toString() ?? ''}
          set={value => setMapping({ ...mapping, [field]: value ? Number(value) : undefined })} />)}
        {act('Preview updated mapping', () => run(async () => {
          setPreview(await client.previewImport(id!, file!, mapping));
        }), conflict || (enabled && (!mapping.flatNumber || !mapping.slotNumber)))}
        {enabled && (!mapping.flatNumber || !mapping.slotNumber) && <Note>Map both the Flat and Bay columns to import.</Note>}
        {act('Replace draft rows from file', () => confirm('Import rows?', 'The upload creates a new draft revision.', async () => {
          setDraft(await client.upload(id!, revision!, file!, mapping));
          setFile(undefined);
          setPreview(undefined);
          setStage(1);
        }), conflict || (enabled && (!mapping.flatNumber || !mapping.slotNumber)))}
      </>}
      {act('Review current rows', () => setStage(1))}
    </>}

    {draft && stage === 1 && <>
      {enabled ? <View style={{ backgroundColor:ink.stone,padding:17,gap:7,borderTopWidth:2,borderColor:ink.gold }}>
        <Label>ALLOCATION COVERAGE</Label>
        <Display size={33}>{draft.coverage ? draft.coverage.totalAssignedFlats + ' / ' + draft.coverage.totalEligibleFlats : rows.length + ' chart rows'}</Display>
        {!!draft.coverage && <View style={{backgroundColor:ink.rule,height:4}}><View style={{height:4,backgroundColor:ink.gold,
          width:Math.min(100,100*draft.coverage.totalAssignedFlats/Math.max(1,draft.coverage.totalEligibleFlats))+'%'}}/></View>}
        <Note>{rows.length} chart rows · {exclusions.length} reviewed exclusions</Note>
        {!draft.coverage && <Note>Validate the chart to check eligible-flat coverage.</Note>}
      </View> : <Copy>{rows.length} chart rows · {exclusions.length} reviewed exclusions</Copy>}
      {!!draft.coverage && <Copy>{draft.coverage.totalAssignedFlats} of {draft.coverage.totalEligibleFlats} eligible flats assigned
        {'\n'}Unassigned · {draft.coverage.unassignedEligibleFlats.join(', ') || 'None'}
        {'\n'}Covered available · {draft.coverage.capacity.INSIDE.available} · Outdoor available · {draft.coverage.capacity.OUTSIDE.available}</Copy>}
      {enabled && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        <Control title="Open chart drawer" onPress={() => { setFilter(''); setDrawer(true); }} />
        <Control title="Validate and refresh coverage" emphasis disabled={busy || !editable || conflict}
          onPress={() => run(async () => setDraft(applyDraftReview(draft, await client.validate(id!, revision!))))} />
      </View>}
      {enabled && !!issues.length && <Label>{issues.length} VALIDATION {issues.length === 1 ? 'ISSUE' : 'ISSUES'}</Label>}
      {enabled ? Array.from(groups, ([rowNumber, rowIssues]) => {
        const target = rows.findIndex(item => item.row === rowNumber);
        return <View key={rowNumber ?? 'chart'} style={{ borderBottomWidth:1,borderColor:ink.rule,paddingVertical:8,gap:4 }}>
          <Label>{rowNumber === null ? 'CHART' : 'ROW ' + rowNumber} · {rowIssues.length} {rowIssues.length === 1 ? 'ISSUE' : 'ISSUES'}</Label>
          {rowIssues.map((issue, i) => <Note key={i}>{fields[issue.field as keyof Row] ?? issue.field} · {issue.message}</Note>)}
          {editable && !conflict && target >= 0 && <Control title={'Correct row ' + rowNumber}
            onPress={() => openRow(target, rowIssues.length === 1 ? rowIssues[0].field : undefined)} />}
        </View>;
      }) : issues.map((issue, i) => <Copy error key={i}>{issue.row ? 'Row ' + issue.row + ' · ' : ''}{issue.message}</Copy>)}
      {enabled && editable && !conflict && !!draft.coverage?.unassignedEligibleFlats.length && <View>
        <Label>UNCOVERED FLATS</Label>
        {draft.coverage.unassignedEligibleFlats.map(flatNumber => <Control key={flatNumber}
          title={'Assign flat ' + flatNumber} onPress={() => {
            const existing = rows.findIndex(item => item.flatNumber === flatNumber);
            setRow(existing >= 0 ? rowData(rows[existing]) : { ...blank, flatNumber });
            setIndex(existing); setPicker('slotNumber'); setTerm(''); setDrawer(true);
          }} />)}
      </View>}
      {!enabled && act('Validate and refresh coverage', () => run(async () => {
        setDraft(applyDraftReview(draft, await client.validate(id!, revision!)));
      }), !editable || conflict)}
      {enabled && editable && <Control title={showExclusion ? 'Close exclusion form' : 'Record an exclusion'} onPress={() => setShowExclusion(!showExclusion)} />}
      {(!enabled || showExclusion) && <>
      <Field label="Excluded flat" value={exclusion.flatNumber} set={flatNumber => setExclusion({ ...exclusion, flatNumber })} />
      <Field label="Exclusion reason" value={exclusion.reason} set={reason => setExclusion({ ...exclusion, reason })} />
      {act('Record reviewed exclusion', () => run(async () => {
        setDraft(await client.editDraft(id!, revision!, rows.map(rowData),
          [...exclusions.filter(item => item.flatNumber !== exclusion.flatNumber.trim()), exclusion]));
        setExclusion({ flatNumber: '', reason: '' });
        setShowExclusion(false);
      }), !editable || conflict || !exclusion.flatNumber.trim() || !exclusion.reason.trim())}
      </>}
      {exclusions.map(item => <View key={item.flatNumber}><Copy>{item.flatNumber} · {item.reason}</Copy>
        {act('Remove exclusion for ' + item.flatNumber, () => run(async () => {
          setDraft(await client.editDraft(id!, revision!, rows.map(rowData), exclusions.filter(entry => entry.flatNumber !== item.flatNumber)));
        }), !editable || conflict)}</View>)}
      {enabled && !canConfirm && <Note>{conflict ? 'Reload the current revision to continue.' : 'Resolve open issues and validate this revision before confirming.'}</Note>}
      {act('Continue to confirmation', () => { setComparison(undefined); setStage(2); }, !canConfirm)}
      {act('Back to prepare', () => setStage(0))}
    </>}

    {draft && stage === 2 && <>
      <Copy>Review revision {revision} before approving it for publication.</Copy>
      {revision! > 1 && act('Compare with previous revision', () => run(async () => {
        setComparison((await client.compare(id!, revision! - 1, revision!)).changes);
      }))}
      {revision === 1 && <Copy>First revision · review the current chart.</Copy>}
      {comparison?.map(change => <View key={change.row} style={enabled ? { padding: 12, backgroundColor: ink.stone, gap: 4 } : undefined}>
        <Copy>Row {change.row}{change.previous ? change.current ? ' · Changed' : ' · Removed' : ' · Added'}</Copy>
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
        {enabled && <Note>{publication.activatedAt ? 'Activated ' + new Date(publication.activatedAt).toLocaleString() : 'Awaiting activation'}</Note>}
        {act('Activate manually', () => confirm('Activate publication ' + publication.sequence + '?',
          'Use this published chart for ' + cycle.cycleName + '. The server checks inventory and dates.', async () => {
          await client.activate(cycle._id, publication._id);
          const result = await read<{ publications: Publication[] }>('/allocation-drafts/publications/' + cycle._id, new AbortController().signal);
          setPublication(result.publications.find(item => item._id === publication._id) ?? publication);
          void cycles.refetch();
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
    {draft && (!enabled || stage !== 1) && act('Open chart drawer', () => { setFilter(''); setDrawer(true); })}
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

    <Modal visible={drawer} animationType={motion ? 'slide' : 'none'} transparent={enabled} presentationStyle={enabled ? "overFullScreen" : "formSheet"} onRequestClose={() => { if (!busy) { setDrawer(false); setIndex(null); } }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex:1,justifyContent:'flex-end', backgroundColor:enabled ? ink.ink + '55' : undefined}}>
      <View style={enabled ? { height:'88%', backgroundColor:ink.paper,borderTopLeftRadius:20,borderTopRightRadius:20,overflow:'hidden' } : {flex:1}}>
      {enabled && <Pressable accessibilityRole="button" accessibilityLabel="Dismiss sheet" onPress={() => {if (!busy) {setDrawer(false);setIndex(null);setPicker(undefined);}}}
        style={{alignItems:'center',paddingVertical:13}}><View style={{width:37,height:4,borderRadius:2,backgroundColor:ink.gold}} /></Pressable>}
      <Screen previewSheet title={index !== null ? 'Edit chart row' : 'Allocation chart'}>
        {error && <Copy error>{error}</Copy>}
        {index === null ? <>
          <Field label="Search flats, bays or vehicles" value={filter} set={setFilter} />
          {!matchingRows.length && <Note>{rows.length ? 'No matching rows.' : 'No rows in this revision.'}</Note>}
          {matchingRows.map(({ item, i }) => <View key={item.row} style={enabled ? { borderBottomWidth: 1, borderColor: ink.rule } : undefined}>
            {act('Row ' + item.row + ' · ' + item.flatNumber + ' / ' + item.slotNumber, () => openRow(i), !editable || conflict)}
            {enabled && <Note>{item.vehicleNumber || 'No vehicle specified'}{groups.has(item.row) ? ' · ' + groups.get(item.row)!.length + ' open issues' : ''}</Note>}
          </View>)}
          {act('Add manual row', () => openRow(-1), !editable || conflict)}
          {act('Close chart', () => setDrawer(false))}
        </> : <>
          {(['flatNumber','slotNumber','vehicleNumber'] as const).map(field =>
            <Action key={field} label={enabled ? fields[field] + ' · ' + (row[field] || 'Select registered ' + fields[field].toLowerCase()) : 'Choose registered ' + fields[field].toLowerCase()}
              onPress={() => { setPicker(field); setTerm(''); }} />)}
          {picker && <>
            <Field label="Filter registered values" value={term} set={setTerm} />
            {inventory.isPending && <Note>Loading registered {fields[picker].toLowerCase()} options…</Note>}
            {inventory.isError && act('Retry inventory', () => { void inventory.refetch(); })}
            {choices?.length === 0 && <Note>No matching registered values.</Note>}
            {choices?.map(item =>
              <Action key={item[picker]} label={item[picker]!} onPress={() => {
                setRow({ ...row, [picker]: item[picker], ...(picker === 'flatNumber' && row.flatNumber !== item.flatNumber && {vehicleNumber: ''}) });
                setPicker(undefined);
              }} />)}
            {enabled && picker === 'vehicleNumber' && <Control title="Clear vehicle" onPress={() => {
              setRow({ ...row, vehicleNumber: '' }); setPicker(undefined);
            }} />}
            {act('Close choices', () => setPicker(undefined))}
          </>}
          {(enabled ? ['notes'] as const : Object.keys(fields) as (keyof Row)[]).map(field =>
            <Field key={field} label={fields[field]} value={row[field] ?? ''} set={value => setRow({ ...row, [field]: value })} />)}
          {act('Save correction', saveRow, conflict || !row.flatNumber.trim() || !row.slotNumber.trim())}
          {index >= 0 && act('Remove row', () => confirm('Remove chart row?', 'This creates a new draft revision.', async () => {
            setDraft(await client.editDraft(id!, revision!, rows.filter((_, i) => i !== index).map(rowData), exclusions));
            setIndex(null);
            setStage(1);
          }), conflict)}
          {act('Back to chart', () => { setIndex(null); setPicker(undefined); })}
        </>}
        {busy && <Text style={{ color: colors.text }}>Saving…</Text>}
      </Screen>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  </Frame>;
}
