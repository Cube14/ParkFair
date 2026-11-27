import { WebView, type DomWebViewRef } from '@expo/dom-webview';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform, useWindowDimensions, View } from 'react-native';
import { useTheme } from '../theme';
import { Control, Note, useEditorial, usePreviewMotion } from './Editorial';
import { garageLab } from './Signature';

export function ParkingStudyViewport({ selected, assigned, onSelection, onClose, onError, onDragging }: {
  selected?: string; assigned?: string; onSelection: (name: string) => void; onClose: () => void; onError: () => void; onDragging: (active: boolean) => void;
}) {
  const c = useEditorial();
  const { isDark } = useTheme();
  const motion = usePreviewMotion();
  const { height } = useWindowDimensions();
  const ref = useRef<DomWebViewRef>(null);
  const [readyUri, setReadyUri] = useState('');
  const [pan, setPan] = useState(false);
  const [preset, setPreset] = useState<'axonometric' | 'overhead'>('axonometric');
  const uri = garageLab + 'parking-study.html?' + new URLSearchParams({ ...c, dark: isDark ? '1' : '0', motion: motion ? '1' : '0' }).toString();
  const ready = readyUri === uri;
  useEffect(() => {
    if (ready) ref.current?.injectJavaScript(`window.parkingStudyCommand?.('assignment',${JSON.stringify(assigned ?? null)});true;`);
  }, [assigned, ready]);

  useEffect(() => {
    const handler = AppState.addEventListener('change', state => { if (state !== 'active') onClose(); });
    const blur = Platform.OS === 'android' ? AppState.addEventListener('blur', onClose) : undefined;
    return () => { handler.remove(); blur?.remove(); };
  }, [onClose]);
  useEffect(() => {
    if (ready) return;
    const timeout = setTimeout(onError, 6500);
    return () => clearTimeout(timeout);
  }, [onError, ready, uri]);

  function command(action: string, value?: string | boolean) {
    ref.current?.injectJavaScript(`window.parkingStudyCommand?.(${JSON.stringify(action)},${JSON.stringify(value ?? null)});true;`);
  }
  function switchPreset(next: typeof preset) {
    setPreset(next);
    command('camera', next);
  }

  return <>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:14,paddingHorizontal:12}}>
      <Control title="Isometric" emphasis={preset === 'axonometric'} disabled={!ready} onPress={() => switchPreset('axonometric')} />
      <Control title="Top-down" emphasis={preset === 'overhead'} disabled={!ready} onPress={() => switchPreset('overhead')} />
      <Control title={pan ? 'Switch to orbit' : 'Pan view'} disabled={!ready} onPress={() => { setPan(!pan); command('pan', !pan); }} />
      <Control title="Reset view" disabled={!ready} onPress={() => command('reset')} />
    </View>
    <View style={{height:Math.min(340,Math.round(height*.40)),backgroundColor:c.paper,borderTopWidth:1,borderColor:c.rule}}
      onTouchStart={() => onDragging(true)} onTouchEnd={event => { if (!event.nativeEvent.touches.length) onDragging(false); }}
      onTouchCancel={() => onDragging(false)}>
      <WebView key={uri} ref={ref} source={{uri}} originWhitelist={[garageLab]} scrollEnabled={false} useExpoModulesBridge={false}
        webviewDebuggingEnabled={__DEV__} style={{backgroundColor:c.paper}} containerStyle={{flex:1,backgroundColor:c.paper}}
        onRenderProcessGone={onError} onContentProcessDidTerminate={onError}
        onMessage={({nativeEvent}) => {
          let message: { type?: string; value?: unknown };
          try { message = JSON.parse(nativeEvent.data); } catch { return; }
          if (message.type === 'ready') {
            command('assignment', assigned);
            command('select', selected);
            command('camera', preset);
            command('pan', pan);
            setReadyUri(uri);
          }
          if (message.type === 'bay' && typeof message.value === 'string') onSelection(message.value);
          if (message.type === 'error') onError();
          if (message.type === 'suspended') onClose();
        }} />
    </View>
    <View style={{paddingHorizontal:12,paddingVertical:7}} accessibilityLiveRegion="polite">
      <Note>{ready ? pan ? 'Drag to pan. Switch to orbit to pinch or select.' : 'Drag to orbit · Pinch to zoom · Tap a bay' : 'Preparing the architectural study…'}</Note>
    </View>
  </>;
}
