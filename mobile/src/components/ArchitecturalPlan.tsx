import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { PanResponder, Platform, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import layout from '../data/parkingStudy.json';
import { Control, Display, Label, Note, useEditorial } from './Editorial';
import { ParkingStudyViewport } from './ParkingStudyViewport';
import { SignatureShell, StudioButton } from './Signature';
import { useTheme } from '../theme';

const { drawing, positions } = layout;
const areaStyle = ({ x, y, width, depth }: typeof layout.covered) => ({ left: x, top: y, width, height: depth });
const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
type Camera = { zoom: number; x: number; y: number };
const fitted: Camera = { zoom: 1, x: 0, y: 0 };

function touchCenter(event: GestureResponderEvent) {
  const [first, second] = event.nativeEvent.touches;
  if (!first) return undefined;
  if (!second) return { x: first.pageX, y: first.pageY, distance: 0 };
  return { x: (first.pageX + second.pageX) / 2, y: (first.pageY + second.pageY) / 2,
    distance: Math.hypot(first.pageX - second.pageX, first.pageY - second.pageY) };
}

export function ArchitecturalPlan({ onReturn, allocation }: { onReturn: () => void; allocation?: string | null }) {
  const c = useEditorial();
  const { isDark } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 340 });
  const [camera, setCamera] = useState(fitted);
  const current = useRef(fitted);
  const gesture = useRef<ReturnType<typeof touchCenter>>(undefined);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<'drawing' | 'study' | 'list'>('drawing');
  const [studyError, setStudyError] = useState(false);
  const [manual, setSelected] = useState<string>();
  const assigned = positions.find(bay => bay.name === allocation)?.name;
  const selected = manual ?? assigned;
  const selectedBay = positions.find(bay => bay.name === selected);
  const info = selectedBay?.position === 'A' ? 'Inner tandem position' : selectedBay?.position === 'B' ? 'Outer tandem position' :
    selectedBay?.position === 'FULL' ? 'Whole flex slot' : selectedBay?.area === 'Outdoor' ? 'Perpendicular outdoor bay' : 'Covered parking';
  const closeStudy = useCallback(() => { setMode('drawing'); setDragging(false); }, [setMode, setDragging]);
  const failStudy = useCallback(() => { closeStudy(); setStudyError(true); }, [closeStudy, setStudyError]);
  useFocusEffect(useCallback(() => closeStudy, [closeStudy]));
  const fit = Math.min(size.width / drawing.width, size.height / drawing.height);
  const scale = fit * camera.zoom;
  const setView = useMemo(() => (zoom: number, x: number, y: number) => {
    const nextZoom = Math.max(1, Math.min(2.7, zoom));
    const next = { zoom: nextZoom,
      x: clamp(x, Math.max(0, (drawing.width * fit * nextZoom - size.width) / 2)),
      y: clamp(y, Math.max(0, (drawing.height * fit * nextZoom - size.height) / 2)) };
    current.current = next;
    setCamera(next);
  }, [fit, size.height, size.width]);

  // PanResponder stores these callbacks and reads gesture refs only during a touch.
  // eslint-disable-next-line react-hooks/refs
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponderCapture: event => event.nativeEvent.touches.length > 1,
    onMoveShouldSetPanResponderCapture: (event, state) => event.nativeEvent.touches.length > 1 ||
      (current.current.zoom > 1 && Math.hypot(state.dx, state.dy) > 6),
    onPanResponderGrant: event => { gesture.current = touchCenter(event); setDragging(true); },
    onPanResponderMove: event => {
      const last = gesture.current;
      const point = touchCenter(event);
      gesture.current = point;
      if (!last || !point || !!last.distance !== !!point.distance) return;
      const active = current.current;
      const zoom = point.distance ? active.zoom * point.distance / Math.max(1, last.distance) : active.zoom;
      setView(zoom, active.x + point.x - last.x, active.y + point.y - last.y);
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: () => { gesture.current = undefined; setDragging(false); },
    onPanResponderTerminate: () => { gesture.current = undefined; setDragging(false); },
  }), [setView]);

  return <SignatureShell title="Siddha-A parking plan" tabbed scrollEnabled={!dragging}>
    <View style={{ padding: 16, gap: 6 }}>
      <StudioButton title="‹  Motor Court" onPress={onReturn} />
      <Label>SIDDHA-A SCHEMATIC</Label>
      <Display size={37}>Parking plan</Display>
      <Note>Not to scale. Confirm your bay with on-site signage.</Note>
    </View>
    <View style={{ marginHorizontal: 12, borderWidth: 1, borderColor: c.rule, backgroundColor: c.stone }}>
      <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap', paddingHorizontal: 10 }}>
        {Platform.OS === 'android' && <Control title="3D study" emphasis={mode === 'study'} onPress={() => { setStudyError(false); setMode('study'); }} />}
        <Control title="2D drawing" emphasis={mode === 'drawing'} onPress={closeStudy} />
        <Control title="Accessible bay list" emphasis={mode === 'list'} onPress={() => { setDragging(false); setMode('list'); }} />
      </View>
      {studyError && mode === 'drawing' && <View style={{paddingHorizontal:12}}><Note>3D study unavailable. The 2D drawing and bay list are available.</Note></View>}
      {mode === 'drawing' && <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', paddingHorizontal: 10 }}>
          <Control title="Zoom out" disabled={camera.zoom <= 1} onPress={() => setView(camera.zoom / 1.35, camera.x, camera.y)} />
          <Control title="Zoom in" disabled={camera.zoom >= 2.7} onPress={() => setView(camera.zoom * 1.35, camera.x, camera.y)} />
          <Control title="Fit plan" onPress={() => setView(1, 0, 0)} />
      </View>}
      {mode === 'study' ? <ParkingStudyViewport key={isDark ? 'dark' : 'light'} selected={selected} assigned={assigned} onSelection={name => {
        if (positions.some(bay => bay.name === name)) setSelected(name);
      }} onDragging={setDragging} onClose={closeStudy} onError={failStudy} /> : mode === 'list' ? <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
        {positions.map(bay => <Pressable key={bay.name} accessibilityRole="button" accessibilityState={{ selected: bay.name === selected }}
          onPress={() => setSelected(bay.name)} style={{ minHeight: 46, justifyContent: 'center', borderTopWidth: 1, borderColor: c.rule }}>
          <Note>{bay.name} · {bay.area}{bay.name === assigned ? ' · Your current allocation' : ''}</Note>
        </Pressable>)}
      </View> : <View onLayout={event => {
        const { width, height } = event.nativeEvent.layout;
        if (width !== size.width || height !== size.height) { setSize({ width, height }); current.current = fitted; setCamera(fitted); }
      }} {...pan.panHandlers} accessibilityLabel="Synthetic top-down plan" style={{ height: 340, overflow: 'hidden', backgroundColor: c.paper, borderTopWidth: 1, borderColor: c.rule }}>
        {!!fit && <View style={{ position: 'absolute', width: drawing.width, height: drawing.height,
          left: (size.width - drawing.width) / 2 + camera.x, top: (size.height - drawing.height) / 2 + camera.y, transform: [{ scale }] }}>
          <View pointerEvents="none" style={[styles.absolute, areaStyle(layout.building), { backgroundColor: c.plate, borderWidth: 1, borderColor: c.rule, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={[styles.label, { color: c.ink }]}>Siddha-A</Text>
          </View>
          <View pointerEvents="none" style={[styles.absolute, areaStyle(layout.outdoor), { backgroundColor: c.plate, borderWidth: 1, borderColor: c.rule }]} />
          <View pointerEvents="none" style={[styles.absolute, areaStyle(layout.connector), { backgroundColor: c.plate }]} />
          <View pointerEvents="none" style={[styles.absolute, areaStyle(layout.aisle), { backgroundColor: c.plate, alignItems: 'center', justifyContent: 'space-around' }]}>
            <Text style={[styles.label, { color: c.gold }]}>Entrance</Text>
            {[0, 1, 2, 3, 4].map(index => <Text key={index} style={{ color: c.muted, fontSize: 17 }}>↑ ↓</Text>)}
          </View>
          {layout.columns.map(column => <View key={column.x + ':' + column.y} pointerEvents="none"
            style={[styles.absolute, { left: column.x - 3, top: column.y - 3, width: 6, height: 6, backgroundColor: c.muted }]} />)}
          {layout.bays.map(bay => {
            const flex = 'flex' in bay && bay.flex;
            const choices = flex ? [bay.name + 'A', bay.name + 'B'] : [];
            const highlight = assigned === bay.name;
            return <View key={bay.name} style={[styles.absolute, areaStyle(bay), { backgroundColor: c.paper, borderWidth: 1,
              borderColor: selected === bay.name || highlight ? c.gold : c.rule }]}>
              <Pressable accessibilityRole="button" accessibilityLabel={bay.name + ', ' + bay.area}
                accessibilityState={{selected: selected === bay.name}} onPress={() => setSelected(bay.name)}
                style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor:highlight ? c.gold : c.paper}}>
                <Text numberOfLines={1} maxFontSizeMultiplier={1.25} style={[styles.label,{color:highlight ? c.paper : c.ink},
                  bay.area === 'Outdoor' && {width:58,textAlign:'center',transform:[{rotate:'-90deg'}]}]}>{bay.name}</Text>
              </Pressable>
              {flex && <View style={{flex:1,flexDirection:'row',borderTopWidth:1,borderColor:c.rule}}>
                {choices.map(name => <Pressable key={name} accessibilityRole="button" accessibilityLabel={name}
                  accessibilityState={{selected:selected === name}} onPress={() => setSelected(name)}
                  style={{flex:1,alignItems:'center',justifyContent:'center',borderWidth:selected === name ? 1 : 0,borderColor:c.gold,
                    backgroundColor:highlight || assigned === name ? c.gold : c.stone}}>
                  <Text style={[styles.label,{color:highlight || assigned === name ? c.paper : c.ink}]}>{name.slice(-1)}</Text>
                </Pressable>)}
              </View>}
            </View>;
          })}
        </View>}
      </View>}
    </View>
    <View accessibilityLiveRegion="polite" style={{ margin: 12, padding: 12, gap: 6, backgroundColor: c.stone, borderStartWidth: 2, borderColor: c.gold,
      ...(mode === 'study' && { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }) }}>
      <View>
        <Label>{selected && selected === assigned ? 'YOUR CURRENT ALLOCATION' : selected ? 'SELECTED POSITION' : 'CURRENT ALLOCATION'}</Label>
        <Display size={mode === 'study' ? 24 : 28}>{selected ?? (allocation ? 'Outside this schematic' : 'No current bay')}</Display>
      </View>
      <Note>{selectedBay ? info : allocation || 'Select a position to inspect it.'}</Note>
    </View>
  </SignatureShell>;
}

const styles = StyleSheet.create({ absolute: { position: 'absolute' }, label: { fontSize: 11, fontWeight: '700', letterSpacing: .4 } });
