import { WebView } from '@expo/dom-webview';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform, Text, View } from 'react-native';
import { Scene, SignatureShell, StudioButton, useSignaturePalette } from './Signature';

type Metrics = { load?: number; median?: number; p95?: number; count?: number; orbit?: boolean; zoom?: boolean };
const lab = 'http://127.0.0.1:8174/';

export function SignatureGarage({ registration, status }: {registration?:string;status?:string}) {
  const c = useSignaturePalette();
  const [premium,setPremium] = useState(false);
  const [failed,setFailed] = useState(false);
  const [metrics,setMetrics] = useState<Metrics>({});
  const close = useCallback(() => setPremium(false),[]);
  useFocusEffect(useCallback(() => close,[close]));
  useEffect(() => {
    const handler = AppState.addEventListener('change',state => { if (state !== 'active') close(); });
    return () => handler.remove();
  },[close]);
  useEffect(() => {
    if (!premium || metrics.load !== undefined) return;
    const timeout = setTimeout(() => {setFailed(true);close();},15000);
    return () => clearTimeout(timeout);
  },[premium,metrics.load,close]);

  return <SignatureShell title="Private garage" tabbed>
    {premium ? <View style={{height:420,backgroundColor:'#1e2725'}}>
      <WebView source={{uri:lab}} originWhitelist={[lab]} scrollEnabled={false} useExpoModulesBridge={false}
        webviewDebuggingEnabled={__DEV__}
        containerStyle={{flex:1}} onRenderProcessGone={()=>{setFailed(true);close();}}
        onMessage={({nativeEvent})=>{
          try {
            const message = JSON.parse(nativeEvent.data);
            if (message.kind === 'ready' && Number.isFinite(message.milliseconds)) setMetrics(last=>({...last,load:message.milliseconds}));
            if (message.kind === 'frames' && Number.isFinite(message.p95)) setMetrics(last=>({...last,median:message.median,p95:message.p95,count:message.sample}));
            if (message.kind === 'camera') setMetrics(last=>({...last,orbit:last.orbit || message.orbit === true,zoom:last.zoom || message.zoom === true}));
            if (message.kind === 'failed') {setFailed(true);close();}
          } catch { /* Ignore messages outside the local diagnostic protocol. */ }
        }}/>
    </View> : <Scene title="Private garage" label="GARAGE  /  ECO STUDY" full />}
    <View style={{padding:16,backgroundColor:c.panel,gap:7,borderBottomWidth:1,borderColor:c.line}}>
      <Text style={{fontSize:11,letterSpacing:2,fontWeight:'800',color:c.signal}}>REGISTERED VEHICLE</Text>
      <Text style={{color:c.ink,fontSize:25,fontWeight:'600'}}>{registration ?? status ?? 'No vehicle registered'}</Text>
      <Text style={{color:c.muted}}>{premium ? 'Premium · CC0 diagnostics. Drag to orbit and pinch to zoom.' : 'Eco · illustrative static photograph.'}</Text>
      {failed && <Text accessibilityRole="alert" style={{color:c.ink}}>3D diagnostics unavailable. The static view is open.</Text>}
      {Platform.OS === 'android' && <StudioButton title={premium ? 'Return to Eco' : 'Open Premium 3D diagnostic'} bright onPress={()=>{
        if (premium) close();
        else {setFailed(false);setMetrics({});setPremium(true);}
      }}/>}
      {metrics.load !== undefined && <Text style={{color:c.muted}}>Model loaded in {metrics.load} ms · {metrics.orbit ? 'orbit observed' : 'orbit waiting'} · {metrics.zoom ? 'zoom observed' : 'zoom waiting'}</Text>}
      {metrics.p95 !== undefined && <Text style={{color:c.muted}}>{metrics.count} WebView frames · median {metrics.median?.toFixed(1)} ms · p95 {metrics.p95.toFixed(1)} ms</Text>}
      <Text style={{color:c.muted}}>Ultra remains a hardware qualification tier.</Text>
    </View>
  </SignatureShell>;
}
