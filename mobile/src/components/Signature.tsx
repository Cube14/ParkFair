import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Animated, Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AdminOccupancy } from '../api';
import { useTheme } from '../theme';
import { useDesignPreview, useEditorial, usePreviewMotion, type ParkingPanel } from './Editorial';
import { TabGlyph } from './TabGlyph';

export function useSignaturePalette() {
  const { paper,stone,rule,ink,muted,gold,plate } = useEditorial();
  return {paper,panel:stone,line:rule,ink,muted,signal:gold,plate};
}

export function StudioButton({ title, onPress, bright = false }: { title:string; onPress:()=>void; bright?:boolean }) {
  const c = useSignaturePalette();
  return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => ({
    minHeight:48, paddingHorizontal:13, justifyContent:'center', alignSelf:'flex-start',
    backgroundColor:bright ? c.signal : 'transparent', borderRadius:4, opacity:pressed ? 0.7 : 1,
  })}><Text style={{color:bright ? c.paper : c.signal, fontWeight:'700',fontSize:14}}>{title}</Text></Pressable>;
}

export function SignatureShell({ children, tabbed = false, title, scrollEnabled = true }: {
  children: ReactNode; tabbed?: boolean; title:string; scrollEnabled?: boolean;
}) {
  const c = useSignaturePalette();
  const { isDark, setAppearance } = useTheme();
  const { toggle } = useDesignPreview();
  return <SafeAreaView edges={tabbed ? ['top','left','right'] : ['top','bottom','left','right']} style={{ flex:1,backgroundColor:c.paper }}>
    <View style={[styles.masthead,{borderColor:c.line}]}>
      <View style={styles.brand}>
        <View style={[styles.mark,{backgroundColor:c.ink}]}><TabGlyph name="parking" color={c.paper}/></View>
        <Text style={{color:c.ink,fontFamily:'serif',fontSize:24,letterSpacing:-0.6}}>ParkFair</Text>
      </View>
      <View style={styles.actions}>
        <StudioButton title={isDark ? 'Light' : 'Dark'} onPress={()=>setAppearance(isDark ? 'Light' : 'Dark')}/>
        <StudioButton title="Exit preview" onPress={toggle}/>
      </View>
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" accessibilityLabel={title} scrollEnabled={scrollEnabled}
      contentContainerStyle={{paddingBottom:18, width:'100%', maxWidth:760, alignSelf:'center'}}>{children}</ScrollView>
  </SafeAreaView>;
}

export function Scene({ title, label, children, full = false, responsive = false, entrance = false }: {
  title:string; label:string; children?:ReactNode; full?:boolean; responsive?:boolean; entrance?:boolean;
}) {
  const c = useSignaturePalette();
  const motion = usePreviewMotion();
  const viewport = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(1));
  const [x] = useState(() => new Animated.Value(0));
  const active = motion && responsive;
  useEffect(() => {
    if (!motion) { progress.setValue(1); x.setValue(0); return; }
    progress.setValue(0);
    const reveal = Animated.timing(progress,{toValue:1,duration:390,useNativeDriver:true});
    reveal.start();
    return () => reveal.stop();
  }, [motion,progress,x]);
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => active && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderMove: (_, gesture) => x.setValue(Math.max(-30,Math.min(30,gesture.dx * .22))),
    onPanResponderRelease: () => { Animated.spring(x,{toValue:0,useNativeDriver:true}).start(); },
    onPanResponderTerminate: () => x.setValue(0),
  }),[active,x]);
  return <View style={{minHeight:entrance ? Math.max(460, viewport.height * .78) : full ? 460 : 300,
    backgroundColor:c.plate, overflow:'hidden'}} {...pan.panHandlers}>
    <Animated.View style={[StyleSheet.absoluteFill,{opacity:progress.interpolate({inputRange:[0,1],outputRange:[.55,1]}),
      transform:active ? [{translateX:x},{scale:1.17}] : [{scale:1.04}]}]}>
      <Image source={require('../../assets/garage-preview.jpg')} resizeMode="cover"
        accessibilityLabel="Illustrative architectural garage photograph" style={{width:'100%',height:'100%'}} />
    </Animated.View>
    <Animated.View pointerEvents="none" style={[styles.sceneTop,{backgroundColor:c.panel,opacity:progress,
      transform:[{translateY:progress.interpolate({inputRange:[0,1],outputRange:[9,0]})}]}]}>
      <Text style={[styles.sceneLabel,{color:c.signal}]}>{label}</Text>
      <Text accessibilityRole="header" style={[styles.sceneTitle,{color:c.ink}]}>{title}</Text>
    </Animated.View>
    {!!children && <View style={styles.sceneBottom}>{children}</View>}
  </View>;
}

export function SignatureHome({ current,next,notice,loading,upcomingStatus,onGarage,onPlan,onRefresh }: {
  current:ParkingPanel|null; next:ParkingPanel|null; notice?:string; loading?:ReactNode; upcomingStatus:string;
  onGarage:()=>void; onPlan:()=>void; onRefresh:()=>void;
}) {
  const c = useSignaturePalette();
  const motion = usePreviewMotion();
  const [currentReveal] = useState(() => new Animated.Value(1));
  const [nextReveal] = useState(() => new Animated.Value(1));
  useFocusEffect(useCallback(() => {
    if (!motion) {
      currentReveal.setValue(1);
      nextReveal.setValue(1);
      return;
    }
    currentReveal.setValue(0);
    nextReveal.setValue(0);
    const reveal = Animated.stagger(65, [currentReveal, nextReveal].map(value =>
      Animated.timing(value,{toValue:1,duration:230,useNativeDriver:true})));
    reveal.start();
    return () => reveal.stop();
  },[currentReveal,motion,nextReveal]));
  const revealStyle = (value: Animated.Value) => ({
    opacity:value.interpolate({inputRange:[0,1],outputRange:[.78,1]}),
    transform:[{translateY:value.interpolate({inputRange:[0,1],outputRange:[6,0]})}],
  });
  return <SignatureShell title="Motor Court" tabbed>
    <View style={{paddingHorizontal:20,paddingTop:12,paddingBottom:9,gap:3}}>
      <Text style={[styles.sceneLabel,{color:c.signal}]}>RESIDENT PARKING</Text>
      <Text accessibilityRole="header" style={[styles.sceneTitle,{color:c.ink}]}>Motor Court</Text>
    </View>
    <PorschePoster />
    <Animated.View style={[styles.ledger,{alignItems:'center',backgroundColor:c.panel,borderColor:c.line},revealStyle(currentReveal)]}>
      <View style={{flex:1,gap:5}}>
        <Text style={[styles.sceneLabel,{color:c.signal}]}>CURRENT PARKING</Text>
        {current ? <>
          <Text style={{color:c.ink}}>{current.description}</Text>
          <Text style={{color:c.muted}}>{current.dates}</Text>
        </> : loading}
        {!!notice && <Text style={{color:c.muted}}>{notice}</Text>}
      </View>
      {!!current && <Text style={[styles.bay,{color:c.ink}]}>{current.bay}</Text>}
    </Animated.View>
    <Animated.View style={[styles.ledger,{backgroundColor:c.panel,borderColor:c.line},revealStyle(nextReveal)]}>
      <View style={{flex:1,gap:5}}>
        <Text style={{color:c.signal,letterSpacing:2,fontWeight:'800',fontSize:11}}>UPCOMING</Text>
        <Text style={{color:c.ink,fontWeight:'600'}}>{next?.description ?? upcomingStatus}</Text>
        {!!next?.dates && <Text style={{color:c.muted}}>{next.dates}</Text>}
      </View>
      {!!next && <Text style={{fontFamily:'serif',fontSize:32,color:c.ink}}>{next.bay}</Text>}
    </Animated.View>
    <View style={[styles.actions,{paddingHorizontal:8}]}>
      <StudioButton title="Enter private garage  ↗" onPress={onGarage}/>
      <StudioButton title="Parking plan" onPress={onPlan}/>
      <StudioButton title="Refresh allocation" onPress={onRefresh}/>
    </View>
  </SignatureShell>;
}

const demoBays = ['A-10','A-11','A-12','A-13','B-10','B-11','B-12','B-13'];
export function SignaturePlan({ onReturn }: { onReturn:()=>void }) {
  const c = useSignaturePalette();
  const [large,setLarge] = useState(false);
  const [list,setList] = useState(false);
  return <SignatureShell title="Illustrative parking plan" tabbed>
    <View style={{padding:20,gap:8}}>
      <StudioButton title="‹  Motor Court" onPress={onReturn}/>
      <Text accessibilityRole="header" style={{color:c.ink,fontSize:34,fontWeight:'600'}}>Parking plan</Text>
      <Text style={{color:c.muted}}>Synthetic geometry · A-12 is the highlighted sample bay.</Text>
      <View style={styles.actions}>
        <StudioButton title={large ? 'Fit plan' : 'Zoom in'} onPress={()=>setLarge(!large)}/>
        <StudioButton title={list ? 'Show drawing' : 'Accessible bay list'} onPress={()=>setList(!list)}/>
      </View>
      {list ? demoBays.map(bay=><Text key={bay} style={{color:c.ink,paddingVertical:5}}>{bay}{bay==='A-12' ? ' · Sample assignment' : ''}</Text>) :
        <ScrollView horizontal>
          <View style={{width:large ? 630 : 352,padding:14,backgroundColor:c.panel,borderColor:c.line,borderWidth:3,gap:8}}>
            {[0,4].map(start=><View key={start}>
              {start===4 && <View style={{borderColor:c.line,borderTopWidth:1,borderBottomWidth:1,paddingVertical:22,marginBottom:8}}>
                <Text style={{color:c.muted,textAlign:'center',letterSpacing:2}}>ENTRY →     DRIVE AISLE     → EXIT</Text>
              </View>}
              <View style={{flexDirection:'row'}}>
                {demoBays.slice(start,start+4).map(bay=><View key={bay} style={{flex:1,height:large?140:95,
                  backgroundColor:bay==='A-12' ? c.signal : c.paper,borderWidth:1,borderColor:c.line,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{color:bay==='A-12'?c.paper:c.ink,fontWeight:'700'}}>{bay}</Text>
                </View>)}
              </View>
            </View>)}
          </View>
        </ScrollView>}
      <Text style={{color:c.muted}}>Use on-site signs for real navigation.</Text>
    </View>
  </SignatureShell>;
}

export function VehiclePortrait() {
  const c = useSignaturePalette();
  return <View style={{width:'100%',aspectRatio:1080 / 608,backgroundColor:c.plate}}>
    <Image source={require('../../assets/garage-preview.jpg')} resizeMode="contain"
      accessibilityLabel="Illustrative architectural garage photograph" style={{width:'100%',height:'100%'}}/>
  </View>;
}

export function usePorscheViewport() {
  const {height} = useWindowDimensions();
  return Math.max(270, Math.min(460, Math.round(height * .385)));
}

// These local evaluation stills are captured from the same model-viewer camera.
export function PorschePoster() {
  const c = useSignaturePalette();
  const {isDark} = useTheme();
  const height = usePorscheViewport();
  const uri = 'http://127.0.0.1:8174/porsche-' + (isDark ? 'dark' : 'light') + '.jpg?v=android2';
  const [failed,setFailed] = useState('');
  return <View style={{height,justifyContent:'center',backgroundColor:c.plate}}>
    {failed === uri ? <VehiclePortrait /> : <Image key={uri} source={{uri}} fadeDuration={0} resizeMode="cover"
      accessibilityLabel="Illustrative Porsche in the ParkFair garage"
      onError={()=>setFailed(uri)} style={{width:'100%',height:'100%'}}/>}
  </View>;
}

export function SceneStatus({ busy, text }: {busy:boolean;text:string}) {
  const c = useSignaturePalette();
  return <View accessible accessibilityLiveRegion="polite" style={{flexDirection:'row',gap:8,alignItems:'center'}}>
    {busy && <ActivityIndicator color={c.signal}/>}<Text style={{color:c.ink,fontSize:14}}>{text}</Text>
  </View>;
}

type OfficeSection = 'Flats' | 'Vehicles' | 'Inventory' | 'Cycles';
export function SignatureOffice({ data, pending, retry, navigate, onDossier, onSettings }: {
  data?: AdminOccupancy['data']; pending:boolean; retry?:()=>void;
  navigate:(section:OfficeSection)=>void; onDossier:()=>void; onSettings:()=>void;
}) {
  const c = useSignaturePalette();
  const occupancy = data?.totalCapacity ? Math.max(0, Math.min(1, data.activeCycleAssignments / data.totalCapacity)) : 0;
  return <SignatureShell title="Parking Office">
    <View style={{padding:18,gap:8,backgroundColor:c.panel}}>
      <Text style={{letterSpacing:2.5,color:c.signal,fontWeight:'800',fontSize:11}}>SOCIETY OPERATIONS</Text>
      <Text accessibilityRole="header" style={{color:c.ink,fontSize:36,fontWeight:'600'}}>Parking Office</Text>
      <Text style={{color:c.muted}}>{data?.activeCycle ?? (pending ? 'Loading occupancy…' : retry ? 'Occupancy unavailable' : 'No active cycle')}</Text>
      {data && <>
        <View accessibilityLabel={Math.round(occupancy*100)+' percent assigned'} accessible
          style={{flexDirection:'row',height:32,gap:4,marginVertical:10}}>
          {Array.from({length:16},(_,i)=><View key={i} style={{flex:1,backgroundColor:i < Math.round(occupancy*16)?c.signal:c.line}}/>)}
        </View>
        <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:12}}>
          {[['Assigned',data.activeCycleAssignments],['Available',data.availableCapacity],['Capacity',data.totalCapacity]].map(([label,value])=>
            <View key={label}><Text style={{color:c.ink,fontSize:32,fontWeight:'300'}}>{value}</Text><Text style={{color:c.muted}}>{label}</Text></View>)}
        </View>
      </>}
      {retry && <StudioButton title="Retry occupancy" onPress={retry}/>}
    </View>
    <View style={{padding:18,gap:8,borderColor:c.line,borderTopWidth:1,borderBottomWidth:1}}>
      <Text style={{color:c.ink,fontSize:23,fontWeight:'600'}}>Allocation dossier</Text>
      <Text style={{color:c.muted}}>Prepare, validate and publish parking assignments.</Text>
      <StudioButton title="Open allocation workspace" bright onPress={onDossier}/>
    </View>
    <View style={{padding:12,flexDirection:'row',flexWrap:'wrap',gap:8}}>
      {(['Flats','Vehicles','Inventory','Cycles'] as const).map((section,i)=><Pressable key={section} accessibilityRole="button"
        onPress={()=>navigate(section)} style={{width:'47%',minHeight:67,padding:10,borderBottomWidth:1,borderColor:c.line,
          flexDirection:'row',alignItems:'center',gap:8}}>
        <TabGlyph name={['account','garage','parking','schedule'][i]} color={c.signal}/>
        <Text style={{color:c.ink,fontSize:16,fontWeight:'600'}}>{section}</Text>
      </Pressable>)}
    </View>
    <StudioButton title="Office settings" onPress={onSettings}/>
  </SignatureShell>;
}

const styles = StyleSheet.create({
  masthead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',paddingHorizontal:14,borderBottomWidth:1},
  brand:{flexDirection:'row',gap:9,alignItems:'center'},
  mark:{width:29,height:29,alignItems:'center',justifyContent:'center',borderRadius:4},
  actions:{flexDirection:'row',flexWrap:'wrap'},
  sceneTop:{alignSelf:'flex-start',paddingHorizontal:18,paddingVertical:12,marginTop:17},
  sceneLabel:{fontWeight:'800',fontSize:10,letterSpacing:2.4},
  sceneTitle:{fontFamily:'serif',fontSize:36,letterSpacing:-1.5},
  sceneBottom:{marginTop:'auto',padding:16,alignItems:'stretch'},
  bay:{fontFamily:'serif',fontSize:44,letterSpacing:-1.5},
  ledger:{padding:16,gap:8,flexDirection:'row',alignItems:'center',borderBottomWidth:1},
});
