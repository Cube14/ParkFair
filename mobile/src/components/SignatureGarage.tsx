import { WebView, type DomWebViewRef } from '@expo/dom-webview';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, Text, useWindowDimensions, View } from 'react-native';
import { Display, usePreviewMotion } from './Editorial';
import { SignatureShell, StudioButton, useSignaturePalette, VehiclePortrait } from './Signature';

const lab = 'http://127.0.0.1:8174/';

export function SignatureGarage({ registration, status }: {registration?:string;status?:string}) {
  const c = useSignaturePalette();
  const motion = usePreviewMotion();
  const { height } = useWindowDimensions();
  const view = useRef<DomWebViewRef>(null);
  const [available,setAvailable] = useState(false);
  const [interactive,setInteractive] = useState(false);
  const [ready,setReady] = useState(false);
  const [failed,setFailed] = useState(false);
  const [touching,setTouching] = useState(false);
  const close = useCallback(() => { setTouching(false); setInteractive(false); setReady(false); },[]);
  const fallback = useCallback(() => { setFailed(true); close(); },[close]);
  const viewport = Math.max(295, Math.min(540, Math.round(height * .43)));

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    if (Platform.OS === 'android') {
      const timer = setTimeout(() => controller.abort(), 3000);
      void fetch(lab + 'porsche.glb', {method:'HEAD',cache:'no-store',signal:controller.signal})
        .then(response => { if (!controller.signal.aborted) setAvailable(response.ok); })
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

  const options = new URLSearchParams({surface:c.plate,ink:c.ink,motion:motion?'1':'0',scene:'5d2'}).toString();
  return <SignatureShell title="Private garage" tabbed scrollEnabled={!touching}>
    <View style={{paddingHorizontal:20,paddingTop:18,paddingBottom:12,gap:4}}>
      <Text style={{color:c.signal,fontSize:11,letterSpacing:2,fontWeight:'800'}}>MOTOR COURT</Text>
      <Display size={36}>Private garage</Display>
    </View>
    {interactive ? <View style={{height:viewport,backgroundColor:c.plate}}
      onTouchStart={() => setTouching(true)}
      onTouchEnd={event => { if (!event.nativeEvent.touches.length) setTouching(false); }}
      onTouchCancel={() => setTouching(false)}>
      <WebView ref={view} source={{uri:lab+'garage.html?'+options}} originWhitelist={[lab]} scrollEnabled={false}
        webviewDebuggingEnabled={__DEV__}
        useExpoModulesBridge={false} containerStyle={{flex:1}} onRenderProcessGone={fallback}
        onContentProcessDidTerminate={fallback} onMessage={({nativeEvent})=>{
          if (nativeEvent.data === 'garage-ready') setReady(true);
          if (nativeEvent.data === 'garage-failed') fallback();
        }}/>
    </View> : <VehiclePortrait />}
    <View style={{paddingHorizontal:20,paddingVertical:14,gap:5,backgroundColor:c.panel,borderBottomWidth:1,borderColor:c.line}}>
      <Text style={{color:c.signal,fontSize:11,letterSpacing:2,fontWeight:'800'}}>ILLUSTRATIVE VEHICLE</Text>
      <Text style={{color:c.ink,fontFamily:'serif',fontSize:23}}>{interactive ? 'Porsche 911 Carrera 4S' : 'Garage photograph'}</Text>
      {interactive && ready && <Text style={{color:c.muted}}>Drag to orbit · Pinch to zoom</Text>}
      {failed && <Text accessibilityRole="alert" style={{color:c.ink}}>3D view unavailable. Showing the garage photograph.</Text>}
      {interactive && !ready && <Text accessibilityLiveRegion="polite" style={{color:c.muted}}>Loading vehicle…</Text>}
      {available && <View style={{flexDirection:'row',flexWrap:'wrap'}}>
        <StudioButton title={interactive ? 'Show photograph' : 'Open 3D view'} bright={!interactive} onPress={()=>{
          if (interactive) close();
          else {setFailed(false);setInteractive(true);}
        }}/>
        {ready && <StudioButton title="Reset view" onPress={()=>view.current?.injectJavaScript('window.parkfairResetCamera?.(); true;')}/>}
      </View>}
      {interactive && ready && <Text accessibilityRole="link" style={{color:c.signal,minHeight:44,paddingTop:10}}
        onPress={() => { void Linking.openURL('https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf').catch(() => {}); }}>
        Lionsharp Studios · CC BY-SA 4.0
      </Text>}
    </View>
    <View style={{paddingHorizontal:20,paddingVertical:12,gap:4}}>
      <Text style={{color:c.muted,fontSize:11,letterSpacing:2,fontWeight:'800'}}>REGISTERED VEHICLE</Text>
      <Text style={{color:c.ink,fontSize:18}}>{registration ?? status ?? 'No vehicle registered'}</Text>
    </View>
  </SignatureShell>;
}
