import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Animated, Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const uri = 'http://127.0.0.1:8174/garage-brutalist-' + (isDark ? 'dark' : 'light') + '.jpg';
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
