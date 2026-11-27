import { View } from 'react-native';
import { Control, Display, Label, LedgerLink, Note, useEditorial } from './Editorial';
import { SignatureShell } from './Signature';
import type { AdminOccupancy } from '../api';

const departments = [
  { name: 'Flats', icon: 'account', detail: 'Flats and resident access' },
  { name: 'Vehicles', icon: 'garage', detail: 'Registrations and activity' },
  { name: 'Inventory', icon: 'parking', detail: 'Parking bays and capacity' },
  { name: 'Cycles', icon: 'schedule', detail: 'Planned, active and completed cycles' },
] as const;
export type OfficeSection = typeof departments[number]['name'];
export type OfficeCycle = { _id: string; cycleName: string; status: string; startDate: string; endDate: string; latestPublicationId?: string | null; activePublicationId?: string | null };
export type OfficeBay = { side?: string; isActive?: boolean; maxCapacity?: number };

const date = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

export function nextPlannedCycle(cycles?: OfficeCycle[]) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  return cycles?.find(cycle => cycle.status === 'PLANNED' && cycle.endDate.slice(0, 10) >= today);
}

export function ParkingOffice({ data, pending, retry, cycles, bays, pendingReview, navigate, onDossier, onSettings }: {
  data?: AdminOccupancy['data']; pending: boolean; retry?: () => void; cycles?: OfficeCycle[]; bays?: OfficeBay[];
  pendingReview?: { revision: number; status: string; issueCount: number };
  navigate: (section: OfficeSection) => void; onDossier: () => void; onSettings: () => void;
}) {
  const c = useEditorial();
  const upcoming = nextPlannedCycle(cycles);
  const ratio = data?.totalCapacity ? Math.min(100, 100 * data.activeCycleAssignments / data.totalCapacity) : 0;
  const inventory = bays?.filter(bay => bay.isActive !== false);
  const byArea = data && inventory?.every(bay => ['A', 'B', 'OUTSIDE'].includes(bay.side ?? '')) &&
    data.insideAssignments !== undefined && data.outsideAssignments !== undefined ? [
      { name: 'Covered', occupied: data.insideAssignments, bays: inventory.filter(bay => bay.side !== 'OUTSIDE') },
      { name: 'Outdoor', occupied: data.outsideAssignments, bays: inventory.filter(bay => bay.side === 'OUTSIDE') },
    ] : undefined;
  return <SignatureShell title="Parking Office">
    <View style={{ padding: 20, gap: 7 }}>
      <Label>SOCIETY OPERATIONS</Label>
      <Display size={37}>Parking Office</Display>
    </View>
    <View style={{ padding: 20, gap: 12, backgroundColor: c.stone, borderTopWidth: 2, borderColor: c.gold }}>
      <Label>LIVE OCCUPANCY</Label>
      {data && <>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Display size={39}>{data.activeCycleAssignments} / {data.totalCapacity}</Display>
          <Note>{data.availableCapacity} available</Note>
        </View>
        <View accessible accessibilityLabel={Math.round(ratio) + '% assigned'} style={{ height: 7, backgroundColor: c.rule }}>
          <View style={{ height: 7, width: ratio + '%', backgroundColor: c.gold }} />
        </View>
        {data.capacityByArea ? ([['INSIDE','Covered'], ['OUTSIDE','Outdoor']] as const).map(([key,label]) => {
          const area = data.capacityByArea![key];
          return <View key={key} style={{flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
            <Note>{label}</Note><Note>{area.available} available · {area.total} effective</Note>
          </View>;
        }) : byArea?.map(area => {
          const total = area.bays.reduce((sum, bay) => sum + (bay.maxCapacity ?? 0), 0);
          return <View key={area.name} style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <Note>{area.name}</Note><Note>{total - area.occupied} available · {total} total</Note>
          </View>;
        })}
        {data.maximumCapacity !== undefined && <Note>{data.maximumCapacity} maximum · flexibility depends on tandem occupancy</Note>}
      </>}
      {pending && <Note>Loading occupancy…</Note>}
      {retry && <Control title="Refresh office data" onPress={retry} />}
    </View>
    <View style={{ padding: 20, gap: 9, borderBottomWidth: 1, borderColor: c.rule }}>
      <Label>CURRENT CYCLE</Label>
      <Display size={25}>{data ? data.activeCycle ?? 'No effective cycle' : 'Awaiting occupancy data'}</Display>
      {!!data?.activeCycleStartDate && !!data.activeCycleEndDate && <Note>{date(data.activeCycleStartDate)} – {date(data.activeCycleEndDate)}</Note>}
      <Label>PLANNING QUEUE</Label>
      <Display size={25}>{upcoming?.cycleName ?? (cycles ? 'No planned cycles' : 'Awaiting cycle data')}</Display>
      {upcoming && <Note>{date(upcoming.startDate)} – {date(upcoming.endDate)} · {upcoming.latestPublicationId ? 'Published · awaiting activation' : 'Allocation review pending'}</Note>}
      {pendingReview && <Note>Revision {pendingReview.revision} · {pendingReview.status.toLowerCase()} · {pendingReview.issueCount} {pendingReview.issueCount === 1 ? 'issue' : 'issues'} on latest review</Note>}
      <Control emphasis title="Open allocation workspace" onPress={onDossier} />
    </View>
    <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
      <Label>MANAGEMENT</Label>
      {departments.map(item => <LedgerLink key={item.name} title={item.name} detail={item.detail} glyph={item.icon} onPress={() => navigate(item.name)} />)}
      <Control title="Office settings" onPress={onSettings} />
    </View>
  </SignatureShell>;
}
