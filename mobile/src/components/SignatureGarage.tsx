import { WebView, type DomWebViewRef } from '@expo/dom-webview';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { Display, usePreviewMotion } from './Editorial';
import { garageLab as lab, PorschePoster, SignatureShell, StudioButton, usePorscheViewport, useSignaturePalette } from './Signature';
import { useTheme } from '../theme';

export function SignatureGarage({ registration, status }: {registration?:string;status?:string}) {
  const c = useSignaturePalette();
  const { isDark } = useTheme();
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
  const [lightingStudy,setLightingStudy] = useState(false);
  const [credits,setCredits] = useState(false);
  const close = useCallback(() => {
    if (returnTimer.current) { clearTimeout(returnTimer.current); returnTimer.current = null; }
    posterOpacity.setValue(1);
    setTouching(false);
    setInteractive(false);
    setReadyScene('');
  },[posterOpacity]);
  const fallback = useCallback(() => { setFailed(true); close(); },[close]);
  const options = new URLSearchParams({surface:c.plate, ink:c.ink, paper:c.paper, rule:c.line, motion:motion?'1':'0', scene:'5d9',
    light: lightingStudy && isDark ? '08' : '04', exposure: lightingStudy ? (isDark ? 'evening' : 'daylight') : 'baseline'}).toString();
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
    const blur = Platform.OS === 'android' ? AppState.addEventListener('blur', close) : undefined;
    return () => { handler.remove(); blur?.remove(); };
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
      <Display size={36}>Private garage</Display>
    </View>
    {interactive ? <View style={{height:viewport,backgroundColor:c.plate}}
      onTouchStart={() => setTouching(true)}
      onTouchEnd={event => { if (!event.nativeEvent.touches.length) setTouching(false); }}
      onTouchCancel={() => setTouching(false)}>
      <WebView key={options} ref={view} source={{uri:lab+'garage.html?'+options}} originWhitelist={[lab]} scrollEnabled={false}
        webviewDebuggingEnabled={__DEV__}
        useExpoModulesBridge={false} style={{backgroundColor:c.plate}}
        containerStyle={{flex:1,backgroundColor:c.plate}} onRenderProcessGone={fallback}
        onContentProcessDidTerminate={fallback} onMessage={({nativeEvent})=>{
          if (nativeEvent.data === 'garage-ready') {
            posterOpacity.setValue(1);
            setReadyScene(options);
          }
          if (nativeEvent.data === 'garage-failed') fallback();
          if (nativeEvent.data === 'garage-suspended') close();
        }}/>
      <Animated.View pointerEvents={ready?'none':'auto'} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill,{opacity:ready?posterOpacity:1}]}>
        <PorschePoster />
      </Animated.View>
    </View> : <PorschePoster />}
    <View style={{paddingHorizontal:20,paddingVertical:10,gap:4,backgroundColor:c.panel,borderBottomWidth:1,borderColor:c.line}}>
      <Text style={{color:c.ink,fontFamily:'serif',fontSize:23}}>{interactive ? 'Porsche 911 Carrera 4S' : 'Garage still'}</Text>
      <Text style={{color:c.muted,fontSize:13}}>Illustrative vehicle · {interactive ? 'Interactive' : 'Eco still'}</Text>
      {interactive && ready && <Text style={{color:touching?c.signal:c.muted,fontSize:13}}>Drag to orbit · Pinch to zoom</Text>}
      {failed && <Text accessibilityRole="alert" style={{color:c.ink}}>3D view unavailable. Showing the garage still.</Text>}
      {interactive && !ready && <Text accessibilityLiveRegion="polite" style={{color:c.muted}}>Loading vehicle…</Text>}
      <View style={{flexDirection:'row',flexWrap:'wrap'}}>
        {ready && <StudioButton title="Reset view" onPress={resetCamera}/>}
        {available && <StudioButton title={interactive ? 'Use Eco still' : 'Open 3D view'} bright={!interactive} onPress={()=>{
          if (interactive) close();
          else {setFailed(false);setInteractive(true);}
        }}/>}
        <StudioButton title="‹  Motor Court" onPress={returnHome}/>
      </View>
      {ready && <StudioButton title={lightingStudy ? 'Restore baseline lighting' : 'Try appearance lighting'} onPress={() => setLightingStudy(!lightingStudy)} />}
      <StudioButton title={credits ? 'Hide scene credits' : 'Scene credits'} onPress={() => setCredits(!credits)} />
      {credits && <View style={{ gap: 8 }}>
        {[
          ['Porsche · Lionsharp Studios / Karol Miklas · CC BY-SA 4.0', 'https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf'],
          ['Architecture · vslite · CC BY 4.0', 'https://sketchfab.com/3d-models/brutalist-interior-0eb40f2cb2bf4dfdbaae36095825788a'],
          ['Lighting · Greg Zaal / Sergej Majboroda · CC0', 'https://polyhaven.com/license'],
        ].map(([label, url]) => <Text key={url} accessibilityRole="link" style={{color:c.signal,minHeight:44,fontSize:13}}
          onPress={() => { void Linking.openURL(url).catch(() => {}); }}>{label}</Text>)}
      </View>}
    </View>
    <View style={{paddingHorizontal:20,paddingVertical:12,gap:4}}>
      <Text style={{color:c.muted,fontSize:11,letterSpacing:2,fontWeight:'800'}}>REGISTERED VEHICLE</Text>
      <Text style={{color:c.ink,fontSize:18}}>{registration ?? status ?? 'No vehicle registered'}</Text>
    </View>
  </SignatureShell>;
}
