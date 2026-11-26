const colors = new URLSearchParams(location.search);
for (const key of ['surface', 'ink', 'paper', 'rule']) {
  const color = colors.get(key);
  if (/^#[0-9a-f]{6}$/i.test(color ?? '')) document.documentElement.style.setProperty('--' + key, color);
}
const vehicle = document.querySelector('#vehicle');
const initialOrbit = vehicle.getAttribute('camera-orbit');
const initialFieldOfView = vehicle.getAttribute('field-of-view');
const motion = colors.get('motion') === '1';
vehicle.setAttribute('interpolation-decay', motion ? '110' : '0');
if (motion) vehicle.setAttribute('camera-orbit', '57deg 72deg 86%');

function resetCamera(instant = !motion) {
  vehicle.cameraTarget = 'auto auto auto';
  vehicle.cameraOrbit = initialOrbit;
  vehicle.fieldOfView = initialFieldOfView;
  if (instant) vehicle.jumpCameraToGoal();
}

vehicle.addEventListener('load', () => {
  const windshield = vehicle.model.getMaterialByName('window');
  if (windshield) {
    windshield.pbrMetallicRoughness.setMetallicFactor(0.12);
    windshield.pbrMetallicRoughness.setRoughnessFactor(0.58);
    windshield.setClearcoatFactor(0.18);
    windshield.setClearcoatRoughnessFactor(0.34);
  }
  if (motion) {
    vehicle.jumpCameraToGoal();
    requestAnimationFrame(() => requestAnimationFrame(() => resetCamera()));
  } else resetCamera();
  window.ReactNativeWebView?.postMessage('garage-ready');
});
vehicle.addEventListener('error', () => window.ReactNativeWebView?.postMessage('garage-failed'));
window.parkfairResetCamera = () => resetCamera();
window.addEventListener('pagehide', () => vehicle.remove(), {once:true});
