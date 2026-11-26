import { WebView, type DomWebViewRef } from '@expo/dom-webview';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, Text, useWindowDimensions, View } from 'react-native';
import { SignatureShell, StudioButton, useSignaturePalette, VehiclePortrait } from './Signature';

const lab = 'http://127.0.0.1:8174/';

export function SignatureGarage({ registration, status }: {registration?:string;status?:string}) {
  const c = useSignaturePalette();
  const { height } = useWindowDimensions();
  const view = useRef<DomWebViewRef>(null);
  const [available,setAvailable] = useState(false);
  const [interactive,setInteractive] = useState(false);
  const [ready,setReady] = useState(false);
  const [failed,setFailed] = useState(false);
  const close = useCallback(() => { setInteractive(false); setReady(false); },[]);
  const fallback = useCallback(() => { setFailed(true); close(); },[close]);
  const viewport = Math.max(360, Math.min(620, Math.round(height * .52)));

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
    const timeout = setTimeout(fallback,15000);
    return () => clearTimeout(timeout);
  },[interactive,ready,fallback]);

  const colors = new URLSearchParams({surface:c.plate,ink:c.ink}).toString();
  return <SignatureShell title="Private garage" tabbed>
    <View style={{paddingHorizontal:20,paddingTop:18,paddingBottom:12,gap:4}}>
      <Text style={{color:c.signal,fontSize:11,letterSpacing:2,fontWeight:'800'}}>MOTOR COURT</Text>
      <Text accessibilityRole="header" style={{color:c.ink,fontSize:32,fontWeight:'600'}}>Private garage</Text>
    </View>
    {interactive ? <View style={{height:viewport,backgroundColor:c.plate}}>
      <WebView ref={view} source={{uri:lab+'garage.html?'+colors}} originWhitelist={[lab]} scrollEnabled={false}
        useExpoModulesBridge={false} containerStyle={{flex:1}} onRenderProcessGone={fallback}
        onContentProcessDidTerminate={fallback} onMessage={({nativeEvent})=>{
          if (nativeEvent.data === 'garage-ready') setReady(true);
          if (nativeEvent.data === 'garage-failed') fallback();
        }}/>
    </View> : <VehiclePortrait height={viewport} />}
    <View style={{paddingHorizontal:20,paddingVertical:14,gap:5,backgroundColor:c.panel,borderBottomWidth:1,borderColor:c.line}}>
      <Text style={{color:c.signal,fontSize:11,letterSpacing:2,fontWeight:'800'}}>REGISTERED VEHICLE</Text>
      <Text style={{color:c.ink,fontSize:24,fontWeight:'600'}}>{registration ?? status ?? 'No vehicle registered'}</Text>
      <Text style={{color:c.muted}}>{interactive ? 'Drag to orbit · Pinch to zoom' : 'Illustrative garage photograph'}</Text>
      {interactive && ready && <Text style={{color:c.muted}}>Porsche 911 Carrera 4S · Lionsharp Studios · CC BY-SA 4.0</Text>}
      {interactive && ready && <StudioButton title="Model source and license"
        onPress={() => { void Linking.openURL('https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf').catch(() => {}); }}/>}
      {failed && <Text accessibilityRole="alert" style={{color:c.ink}}>3D view unavailable. Showing the garage photograph.</Text>}
      {interactive && !ready && <Text accessibilityLiveRegion="polite" style={{color:c.muted}}>Loading vehicle…</Text>}
      {available && <View style={{flexDirection:'row',flexWrap:'wrap'}}>
        <StudioButton title={interactive ? 'Show photograph' : 'Open 3D view'} onPress={()=>{
          if (interactive) close();
          else {setFailed(false);setInteractive(true);}
        }}/>
        {ready && <StudioButton title="Reset view" onPress={()=>view.current?.injectJavaScript('window.parkfairResetCamera?.(); true;')}/>}
      </View>}
    </View>
  </SignatureShell>;
}
