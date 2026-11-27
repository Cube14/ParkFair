import { createStudyModel, studyCoordinates } from './parking-study-model.js?v=6b1';

const viewer = document.querySelector('#study');
const params = new URLSearchParams(location.search);
const palette = {};
const motion = params.get('motion') === '1';
const notify = (type, value) => window.ReactNativeWebView?.postMessage(JSON.stringify({ type, value }));
const presets = { axonometric: '24deg 43deg 70m', overhead: '0deg 0.1deg 64m' };
let preset = 'axonometric';
let mode = 'orbit';
let objectUrl;
let closed = false;
let chooseBay;
let updateAssignment;
let drag;
let pressed;

function reset(next = preset) {
  preset = next;
  viewer.cameraTarget = '0m 0m 0m';
  viewer.cameraOrbit = presets[preset];
  viewer.fieldOfView = '32deg';
  if (!motion) viewer.jumpCameraToGoal();
}

function reportReady(stats) {
  requestAnimationFrame(() => {
    if (closed) return;
    performance.mark('parking-study-ready', { detail: stats });
    notify('ready', stats);
  });
}

function dispose(suspended) {
  if (closed) return;
  closed = true;
  viewer.remove();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  if (suspended) notify('suspended');
}

window.parkingStudyCommand = (action, value) => {
  if (!viewer.loaded || closed) return;
  if (action === 'camera' && Object.hasOwn(presets, value)) reset(value);
  if (action === 'reset') reset();
  if (action === 'select') chooseBay?.(value, false);
  if (action === 'assignment') updateAssignment?.(value);
  if (action === 'pan') {
    mode = value ? 'pan' : 'orbit';
    viewer.toggleAttribute('camera-controls', !value);
  }
};

viewer.addEventListener('pointerdown', event => {
  pressed = event.isPrimary ? { x: event.clientX, y: event.clientY, moved: false } : undefined;
  if (mode !== 'pan' || !event.isPrimary || !viewer.loaded) return;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  viewer.setPointerCapture(event.pointerId);
});
viewer.addEventListener('pointermove', event => {
  if (pressed && Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > 6) pressed.moved = true;
  if (!drag || drag.id !== event.pointerId || mode !== 'pan') return;
  const camera = viewer.getCameraOrbit();
  const current = viewer.getCameraTarget();
  const span = 2 * camera.radius * Math.tan(viewer.getFieldOfView() * Math.PI / 360);
  const unit = span / viewer.clientHeight;
  const dx = (drag.x - event.clientX) * unit, dy = (drag.y - event.clientY) * unit;
  const yaw = camera.theta;
  const bounded = value => Math.max(-9, Math.min(9, value));
  viewer.cameraTarget = `${bounded(current.x + dx * Math.cos(yaw) + dy * Math.sin(yaw))}m 0m ${bounded(
    current.z - dx * Math.sin(yaw) + dy * Math.cos(yaw))}m`;
  viewer.jumpCameraToGoal();
  drag = { ...drag, x: event.clientX, y: event.clientY };
});
viewer.addEventListener('pointerup', () => { drag = undefined; });
viewer.addEventListener('pointercancel', () => { drag = undefined; pressed = undefined; });

async function setup() {
  for (const key of ['paper', 'stone', 'rule', 'ink', 'muted', 'gold', 'plate']) {
    const color = params.get(key);
    if (!/^#[0-9a-f]{6}$/i.test(color ?? '')) throw new Error('Study palette unavailable');
    palette[key] = color;
    document.documentElement.style.setProperty('--' + key, color);
  }
  viewer.setAttribute('exposure', params.get('dark') === '1' ? '1.32' : '.83');
  viewer.setAttribute('interpolation-decay', motion ? '125' : '0');
  const response = await fetch('parkingStudy.json?v=6b1');
  if (!response.ok) throw new Error('Study layout unavailable');
  const layout = await response.json();
  if (closed) return;
  const { x, z, bays } = studyCoordinates(layout);
  const markers = new Map();
  const result = createStudyModel(layout, palette);
  let selected;
  let assigned;
  const known = new Map(bays.map(bay => [bay.name, bay]));
  const isPartOf = (bay, name) => bay.name === name || (known.get(name)?.position === 'FULL' && bay.physical === name);
  function repaint() {
    for (const [id, marker] of markers) {
      const bay = known.get(id);
      const allocated = isPartOf(bay, assigned), chosen = isPartOf(bay, selected);
      const color = allocated ? result.accentColor : chosen ? result.selectionColor : result.bayColor;
      viewer.model.getMaterialByName('select:' + id)?.pbrMetallicRoughness.setBaseColorFactor(color);
      marker.setAttribute('aria-pressed', String(id === selected));
      marker.dataset.assigned = String(allocated);
    }
  }
  chooseBay = (name, announce = true) => {
    if (!viewer.loaded || (name && !known.has(name))) return;
    selected = name;
    repaint();
    if (announce && name) notify('bay', name);
  };
  updateAssignment = name => {
    const follows = !selected || selected === assigned;
    assigned = known.has(name) ? name : undefined;
    if (follows) selected = assigned;
    repaint();
  };

  for (const bay of bays) {
    const marker = document.createElement('button');
    const child = bay.position === 'A' || bay.position === 'B';
    marker.className = child ? 'bay tandem' : bay.area === 'Outdoor' ? 'bay outdoor' : 'bay';
    marker.textContent = child ? bay.position : bay.name;
    marker.slot = 'hotspot-' + bay.name.replace(' ', '-');
    const fraction = child ? .70 : bay.position === 'FULL' ? .26 : bay.area === 'Outdoor' ? (Number(bay.name.slice(-1)) % 2 ? .32 : .67) : .50;
    marker.dataset.position = `${x(bay.x + bay.width / 2)}m 0.1m ${z(bay.y + bay.depth * fraction)}m`;
    marker.dataset.normal = '0m 1m 0m';
    marker.setAttribute('aria-label', bay.name + ', ' + bay.area);
    marker.setAttribute('aria-pressed', 'false');
    marker.addEventListener('click', event => {
      event.stopPropagation();
      if (!pressed?.moved && mode === 'orbit') chooseBay(bay.name);
    });
    markers.set(bay.name, marker);
    viewer.append(marker);
  }
  for (const { name, x: nx, y: nz, height = .1 } of layout.markings) {
    const marker = document.createElement('span');
    marker.className = 'aisle';
    marker.textContent = name;
    marker.slot = 'hotspot-' + name;
    marker.dataset.position = `${x(nx)}m ${height}m ${z(nz)}m`;
    marker.dataset.normal = '0m 1m 0m';
    viewer.append(marker);
  }
  viewer.addEventListener('click', event => {
    if (pressed?.moved || mode === 'pan' || !viewer.loaded) return;
    const hit = viewer.positionAndNormalFromPoint(event.clientX, event.clientY)?.position;
    if (!hit || hit.y > .4) return;
    const hits = bays.filter(item => hit.x >= x(item.x) && hit.x <= x(item.x + item.width) &&
      hit.z >= z(item.y) && hit.z <= z(item.y + item.depth));
    const bay = hits.length > 1 && hit.z >= z(hits[0].y + hits[0].depth * .43) ? hits[1] : hits[0];
    if (bay) chooseBay(bay.name);
  });
  viewer.addEventListener('load', () => {
    reset();
    reportReady({ triangles: result.triangles, bytes: result.model.size });
  }, { once: true });
  viewer.addEventListener('error', () => notify('error'), { once: true });
  objectUrl = URL.createObjectURL(result.model);
  viewer.setAttribute('src', objectUrl);
}

window.addEventListener('pagehide', () => dispose(false), { once: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) dispose(true); });
setup().catch(() => notify('error'));
