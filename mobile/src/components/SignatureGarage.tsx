import { WebView, type DomWebViewRef } from '@expo/dom-webview';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { Display, usePreviewMotion } from './Editorial';
import { PorschePoster, SignatureShell, StudioButton, usePorscheViewport, useSignaturePalette } from './Signature';

const lab = 'http://127.0.0.1:8174/';

export function SignatureGarage({ registration, status }: {registration?:string;status?:string}) {
  const c = useSignaturePalette();
  const motion = usePreviewMotion();
  const router = useRouter();
  const viewport = usePorscheViewport();
  const view = useRef<DomWebViewRef>(null);
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [posterOpacity] = useState(() => new Animated.Value(1));
  const [available,setAvailable] = useState(false);
  const [interactive,setInteractive] = useState(false);
  const [readyScene,setReadyScene] = useState('');
  const [failed,setFailed] = useState(false);
  const [touching,setTouching] = useState(false);
  const close = useCallback(() => {
    if (returnTimer.current) { clearTimeout(returnTimer.current); returnTimer.current = null; }
    posterOpacity.setValue(1);
    setTouching(false);
    setInteractive(false);
    setReadyScene('');
  },[posterOpacity]);
  const fallback = useCallback(() => { setFailed(true); close(); },[close]);
  const options = new URLSearchParams({surface:c.plate,ink:c.ink,paper:c.paper,rule:c.line,motion:motion?'1':'0',scene:'5d5'}).toString();
  const ready = readyScene === options;

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    if (Platform.OS === 'android') {
      const timer = setTimeout(() => controller.abort(), 3000);
      void fetch(lab + 'garage-brutalist.glb', {method:'HEAD',cache:'no-store',signal:controller.signal})
        .then(response => {
          if (controller.signal.aborted) return;
          setAvailable(response.ok);
          if (response.ok && AppState.currentState === 'active') {
            setFailed(false);
            setInteractive(true);
          }
        })
        .catch(() => { if (!controller.signal.aborted) setAvailable(false); })
        .finally(() => clearTimeout(timer));
    }
    return () => { controller.abort(); close(); };
  },[close]));

  useEffect(() => {
    const handler = AppState.addEventListener('change',state => { if (state !== 'active') close(); });
    return () => handler.remove();
  },[close]);
  useEffect(() => {
    if (!interactive || ready) return;
    const timeout = setTimeout(fallback,25000);
    return () => clearTimeout(timeout);
  },[interactive,ready,fallback]);

  useEffect(() => {
    if (!ready) return;
    if (!motion) { posterOpacity.setValue(0); return; }
    const reveal = Animated.timing(posterOpacity,{toValue:0,duration:340,useNativeDriver:true});
    reveal.start();
    return () => reveal.stop();
  },[motion,posterOpacity,ready]);

  function resetCamera() {
    view.current?.injectJavaScript('window.parkfairResetCamera?.(); true;');
  }
  function returnHome() {
    if (returnTimer.current) return;
    if (!motion || !ready || !interactive) { router.navigate('/parking'); return; }
    resetCamera();
    returnTimer.current = setTimeout(() => {
      returnTimer.current = null;
      router.navigate('/parking');
    },410);
  }

  return <SignatureShell title="Private garage" tabbed scrollEnabled={!touching}>
    <View style={{paddingHorizontal:20,paddingTop:12,paddingBottom:9,gap:3}}>
      <Text style={{color:c.signal,fontSize:11,letterSpacing:2,fontWeight:'800'}}>MOTOR COURT</Text>
      <Display size={36}>Private garage</Display>
    </View>
    {interactive ? <View style={{height:viewport,backgroundColor:c.plate}}
      onTouchStart={() => setTouching(true)}
      onTouchEnd={event => { if (!event.nativeEvent.touches.length) setTouching(false); }}
      onTouchCancel={() => setTouching(false)}>
      <WebView ref={view} source={{uri:lab+'garage.html?'+options}} originWhitelist={[lab]} scrollEnabled={false}
        webviewDebuggingEnabled={__DEV__}
        useExpoModulesBridge={false} style={{backgroundColor:c.plate}}
        containerStyle={{flex:1,backgroundColor:c.plate}} onRenderProcessGone={fallback}
        onContentProcessDidTerminate={fallback} onMessage={({nativeEvent})=>{
          if (nativeEvent.data === 'garage-ready') {
            posterOpacity.setValue(1);
            setReadyScene(options);
          }
          if (nativeEvent.data === 'garage-failed') fallback();
        }}/>
      <Animated.View pointerEvents={ready?'none':'auto'} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill,{opacity:ready?posterOpacity:1}]}>
        <PorschePoster />
      </Animated.View>
    </View> : <PorschePoster />}
    <View style={{paddingHorizontal:20,paddingVertical:10,gap:4,backgroundColor:c.panel,borderBottomWidth:1,borderColor:c.line}}>
      <Text style={{color:c.signal,fontSize:11,letterSpacing:2,fontWeight:'800'}}>ILLUSTRATIVE VEHICLE</Text>
      <Text style={{color:c.ink,fontFamily:'serif',fontSize:23}}>{interactive ? 'Porsche 911 Carrera 4S' : 'Garage still'}</Text>
      {interactive && ready && <Text style={{color:touching?c.signal:c.muted,fontSize:13}}>Drag to orbit · Pinch to zoom</Text>}
      {failed && <Text accessibilityRole="alert" style={{color:c.ink}}>3D view unavailable. Showing the garage still.</Text>}
      {interactive && !ready && <Text accessibilityLiveRegion="polite" style={{color:c.muted}}>Loading vehicle…</Text>}
      <View style={{flexDirection:'row',flexWrap:'wrap'}}>
        <StudioButton title="‹  Motor Court" onPress={returnHome}/>
        {available && <StudioButton title={interactive ? 'Still' : 'Open 3D view'} bright={!interactive} onPress={()=>{
          if (interactive) close();
          else {setFailed(false);setInteractive(true);}
        }}/>}
        {ready && <StudioButton title="Reset view" onPress={resetCamera}/>}
      </View>
      {interactive && ready && <Text accessibilityRole="link" style={{color:c.signal,minHeight:44,paddingTop:6,fontSize:13}}
        onPress={() => { void Linking.openURL('https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf').catch(() => {}); }}>
        Porsche · Lionsharp Studios · CC BY-SA 4.0
      </Text>}
      {interactive && ready && <Text accessibilityRole="link" style={{color:c.signal,minHeight:32,fontSize:13}}
        onPress={() => { void Linking.openURL('https://sketchfab.com/3d-models/brutalist-interior-0eb40f2cb2bf4dfdbaae36095825788a').catch(() => {}); }}>
        Architecture · vslite · CC BY 4.0
      </Text>}
    </View>
    <View style={{paddingHorizontal:20,paddingVertical:12,gap:4}}>
      <Text style={{color:c.muted,fontSize:11,letterSpacing:2,fontWeight:'800'}}>REGISTERED VEHICLE</Text>
      <Text style={{color:c.ink,fontSize:18}}>{registration ?? status ?? 'No vehicle registered'}</Text>
    </View>
  </SignatureShell>;
}
