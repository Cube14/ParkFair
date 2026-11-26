import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, BackHandler, Pressable, Text, TextInput, View } from 'react-native';
import { useSession } from '../../session';
import { useTheme } from '../../theme';
import { Action, Copy, Screen } from '../../components/Screen';
import type { AdminOccupancy } from '../../api';

const sections = { Flats: '/flats', Vehicles: '/vehicles', Inventory: '/slots', Cycles: '/cycles' };
type Section = keyof typeof sections;
type Entry = { _id: string; flatNumber?: string; slotNumber?: string; vehicleNumber?: string; cycleName?: string; status?: string; maxCapacity?: number; vehicleCount?: number; isActive?: boolean; flatId?: {_id:string;flatNumber:string}; account?: {exists:boolean;isActive:boolean;userId?:string} };
export default function Workspace() {
  const router = useRouter();
  const { session, read, request, signOut } = useSession();
  const { colors } = useTheme();
  const [section, setSection] = useState<Section>();
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [number, setNumber] = useState('');
  const [side, setSide] = useState('A');
  const [flat, setFlat] = useState('');
  const flats = useQuery({queryKey:['allocation-admin', session?.user.id,'flat-options'],enabled:section === 'Vehicles' && adding,
    queryFn:({signal})=>read<{data:Entry[]}>('/flats',signal)});
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resident, setResident] = useState<Entry>();
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState(false);
  const { appearance, setAppearance } = useTheme();
  const base = ['allocation-admin', session?.user.id];
  const overview = useQuery({ queryKey: [...base,'dashboard'], queryFn: ({signal}) => read<AdminOccupancy>('/dashboard', signal) });
  const directory = useQuery({ queryKey: [...base,section], enabled: !!section,
    queryFn: ({signal}) => read<{data:Entry[]}>(sections[section!], signal) });
  function open(value?:Section) { setSection(value); setSearch(''); setAdding(false); setMessage(''); setNumber(''); setFlat(''); setResident(undefined); setPassword(''); setSettings(false); }
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (busy) return true;
      if (resident) { setResident(undefined); setPassword(''); return true; }
      if (adding) { setAdding(false); return true; }
      if (section || settings) { open(); return true; }
      return false;
    });
    return () => back.remove();
  }, [adding, busy, resident, section, settings]);
  async function saveRecord() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    if (!section) {setBusy(false);return;}
    const body = section === 'Flats' ? {flatNumber:number.trim()} : section === 'Vehicles' ?
      {vehicleNumber:number.trim(),flatId:flat} : {slotNumber:number.trim(),side,maxCapacity:1,displayOrder:(directory.data?.data.length ?? 0)+1};
    try { await request(sections[section],{method:'POST',body}); setAdding(false); setNumber(''); setMessage('Saved.'); await Promise.all([directory.refetch(),overview.refetch()]); }
    catch(e) {setFailed(true); setMessage(e instanceof Error ? e.message : 'Could not save record.');}
    finally {setBusy(false);}
  }
  function updateResident(kind: 'password' | 'toggle') {
    if (!resident || busy) return;
    const accountId = resident.account?.userId;
    Alert.alert(kind === 'password' ? (accountId ? 'Reset resident password?' : 'Create resident account?') :
      resident.account?.isActive ? 'Disable resident account?' : 'Enable resident account?', 'Confirm the change for flat ' + resident.flatNumber + '.', [
      {text:'Cancel',style:'cancel'}, {text:'Confirm',onPress:() => {
        setBusy(true);
        setFailed(false);
        const path = accountId ? '/auth/resident/' + accountId + '/' + kind : '/auth/resident';
        const body = kind === 'toggle' ? undefined : accountId ? {password} : {password,flatId:resident._id};
        void request(path,{method:accountId?'PUT':'POST',body}).then(async () => {
          setPassword(''); setResident(undefined); setMessage('Resident account updated.'); await directory.refetch();
        }).catch(error => {
          setFailed(true);
          setMessage(error instanceof Error ? error.message : 'Could not update the account.');
        }).finally(() => setBusy(false));
      }},
    ]);
  }
  function toggleVehicle(entry: Entry) {
    const isActive = entry.isActive === false;
    Alert.alert(isActive ? 'Activate vehicle?' : 'Deactivate vehicle?', entry.vehicleNumber, [
      {text:'Cancel',style:'cancel'},
      {text:'Confirm',onPress:() => {
        setBusy(true);
        setFailed(false);
        void request('/vehicles/' + entry._id,{method:'PUT',body:{isActive}}).then(async () => {
          setMessage('Vehicle updated.');
          await directory.refetch();
        }).catch(error => {
          setFailed(true);
          setMessage(error instanceof Error ? error.message : 'Could not update vehicle.');
        }).finally(() => setBusy(false));
      }},
    ]);
  }
  return <Screen title={settings ? 'Office settings' : resident ? 'Resident account' : section ?? 'Parking office'}>
    {settings ? <>
      <Copy>{session?.user.username}</Copy>
      <Copy>Appearance · {appearance}</Copy>
      {(['System','Light','Dark'] as const).map(choice => <Action key={choice} label={choice} disabled={appearance===choice} onPress={()=>setAppearance(choice)}/>)}
      <Action label="Back to overview" tone="quiet" onPress={()=>open()}/>
      <Action label="Sign out" onPress={()=>void signOut().catch(()=>setMessage('Sign-out failed.'))}/>
    </> : resident ? <>
      <Copy>Flat {resident.flatNumber}</Copy>
      {resident.account?.userId && <Action label={resident.account.isActive ? 'Disable account' : 'Enable account'}
        disabled={busy} onPress={()=>updateResident('toggle')}/>}
      <TextInput value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" accessibilityLabel="Resident password"
        placeholder="Resident password" placeholderTextColor={colors.secondary} style={{color:colors.text,backgroundColor:colors.surface,padding:14}}/>
      <Action label={resident.account?.userId ? 'Reset password' : 'Create resident account'} tone="primary"
        disabled={busy || password.length<8} onPress={()=>updateResident('password')}/>
      <Action label="Back to flats" tone="quiet" disabled={busy} onPress={()=>{setResident(undefined);setPassword('');}}/>
    </> : !section ? <>
      <View style={{padding:20,backgroundColor:colors.surface,gap:6}}>
        <Copy>{overview.data?.data.activeCycle ?? (overview.isPending ? 'Loading cycle…' : 'Current cycle')}</Copy>
        {overview.data && <><Text style={{fontFamily:'serif',fontSize:40,color:colors.text}}>{overview.data.data.activeCycleAssignments} / {overview.data.data.totalCapacity}</Text><Copy>Spaces assigned · {overview.data.data.availableCapacity} available</Copy></>}
        {overview.isError && <Action label="Retry overview" onPress={()=>void overview.refetch()}/>}
      </View>
      <Action label="Allocation workspace" tone="primary" onPress={()=>router.push('/allocations')}/>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
        {(Object.keys(sections) as Section[]).map(name=><Pressable key={name} accessibilityRole="button" onPress={()=>open(name)}
          style={{width:'47%',padding:14,minHeight:62,borderBottomWidth:1,borderColor:colors.line}}>
          <Text style={{color:colors.text,fontSize:20}}>{name} ↗</Text></Pressable>)}
      </View>
      <Action label="Account and settings" tone="quiet" onPress={()=>setSettings(true)}/>
      <Action label="Sign out" tone="quiet" onPress={()=>void signOut().catch(()=>setMessage('Sign-out failed.'))}/>
    </> : <>
      <Action label="Back to overview" onPress={()=>open()} />
      <TextInput accessibilityLabel="Search directory" placeholder="Search directory" placeholderTextColor={colors.secondary} value={search} onChangeText={setSearch} style={{backgroundColor:colors.surface,color:colors.text,padding:14}}/>
      {section !== 'Cycles' && (adding ? <>
        <Copy>{section === 'Inventory' ? 'New bay · capacity one' : section === 'Flats' ? 'New flat number' : 'Vehicle registration'}</Copy>
        <TextInput accessibilityLabel="New identifier" value={number} onChangeText={setNumber} style={{color:colors.text,padding:14,backgroundColor:colors.surface}}/>
        {section === 'Inventory' && ['A','B','OUTSIDE'].map(value=><Action key={value} label={'Side '+value} disabled={side===value} onPress={()=>setSide(value)}/>)}
        {section === 'Vehicles' && flats.data?.data.map(entry=><Action key={entry._id} label={'Flat '+entry.flatNumber} disabled={flat===entry._id} onPress={()=>setFlat(entry._id)}/>)}
        <Action label="Save record" disabled={busy || !number.trim() || (section === 'Vehicles' && !flat)} onPress={()=>void saveRecord()}/><Action label="Cancel" onPress={()=>setAdding(false)}/>
      </> : <Action label={section === 'Flats' ? 'Add flat' : section === 'Inventory' ? 'Add bay' : 'Register vehicle'} onPress={()=>setAdding(true)}/>)}
      {section === 'Cycles' && <Action label="Plan or review a cycle" onPress={()=>router.push('/allocations')}/>}
      {directory.isPending && <Copy>Loading…</Copy>}
      {directory.isError && <Action label="Retry directory" onPress={()=>void directory.refetch()}/>}
      {directory.data?.data.filter(e=>JSON.stringify(e).toLowerCase().includes(search.toLowerCase())).map(e=><View key={e._id} style={{paddingVertical:10,borderBottomWidth:1,borderColor:colors.line}}>
        <Text style={{fontSize:22,color:colors.text}}>{e.flatNumber ?? e.vehicleNumber ?? e.slotNumber ?? e.cycleName}</Text>
        <Copy>{e.account ? (e.account.exists ? (e.account.isActive?'Resident active':'Account disabled'):'No resident account')+' · '+e.vehicleCount+' vehicles' : e.flatId ? 'Flat '+e.flatId.flatNumber : e.maxCapacity ? 'Capacity '+e.maxCapacity : e.status}</Copy>
        {section === 'Flats' && <Action label={'Manage resident · '+e.flatNumber} tone="quiet" onPress={()=>{setResident(e);setMessage('');}}/>}
        {section === 'Vehicles' && <Action label={(e.isActive === false ? 'Activate ' : 'Deactivate ') + e.vehicleNumber}
          tone="quiet" disabled={busy} onPress={()=>toggleVehicle(e)}/>}
      </View>)}
      {directory.data?.data.length === 0 && <Copy>No records.</Copy>}
    </>}
    {!!message && <Copy error={failed}>{message}</Copy>}
  </Screen>;
}
