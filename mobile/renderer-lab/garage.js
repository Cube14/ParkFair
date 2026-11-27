const colors = new URLSearchParams(location.search);
for (const key of ['surface', 'ink', 'paper', 'rule']) {
  const color = colors.get(key);
  if (/^#[0-9a-f]{6}$/i.test(color ?? '')) document.documentElement.style.setProperty('--' + key, color);
}
const vehicle = document.querySelector('#vehicle');
const initialOrbit = vehicle.getAttribute('camera-orbit');
const initialTarget = vehicle.getAttribute('camera-target');
const initialFieldOfView = vehicle.getAttribute('field-of-view');
const motion = colors.get('motion') === '1';
vehicle.setAttribute('interpolation-decay', motion ? '110' : '0');
if (motion) vehicle.setAttribute('camera-orbit', '45deg 76deg 8.05m');
let modelReady = false;
let lightingReady = false;

function resetCamera(instant = !motion) {
  vehicle.cameraTarget = initialTarget;
  vehicle.cameraOrbit = initialOrbit;
  vehicle.fieldOfView = initialFieldOfView;
  if (instant) vehicle.jumpCameraToGoal();
}

function revealWhenReady() {
  if (!modelReady || !lightingReady) return;
  if (motion) vehicle.jumpCameraToGoal();
  else resetCamera();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.ReactNativeWebView?.postMessage('garage-ready');
    if (motion) resetCamera();
  }));
}

vehicle.addEventListener('load', () => {
  const windshield = vehicle.model.getMaterialByName('window');
  if (windshield) {
    windshield.pbrMetallicRoughness.setMetallicFactor(0.12);
    windshield.pbrMetallicRoughness.setRoughnessFactor(0.58);
    windshield.setClearcoatFactor(0.18);
    windshield.setClearcoatRoughnessFactor(0.34);
  }
  modelReady = true;
  revealWhenReady();
}, {once:true});
vehicle.addEventListener('environment-change', () => {
  lightingReady = true;
  revealWhenReady();
}, {once:true});
vehicle.addEventListener('error', () => window.ReactNativeWebView?.postMessage('garage-failed'));
vehicle.setAttribute('environment-image', colors.get('light') === '08' ? 'studio-08-1k.hdr' : 'studio-04-1k.hdr');
const exposure = colors.get('exposure');
if (exposure === 'evening' || exposure === 'daylight') vehicle.setAttribute('exposure', exposure === 'evening' ? '0.83' : '1.06');
vehicle.setAttribute('src', colors.get('arch') === 'showroom' ? 'garage-showroom.glb' : 'garage-brutalist.glb');
window.parkfairResetCamera = () => resetCamera();
window.addEventListener('pagehide', () => vehicle.remove(), {once:true});
