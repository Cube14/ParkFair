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
if (motion) vehicle.setAttribute('camera-orbit', '49deg 74deg 81%');

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
  if (motion) vehicle.jumpCameraToGoal();
  else resetCamera();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    // Bound the dolly in model units. Percentage constraints use model-viewer's
    // fitting radius, which can be much smaller than the composed opening shot.
    const radius = vehicle.getCameraOrbit().radius * (motion ? 77 / 81 : 1);
    if (Number.isFinite(radius) && radius > 0) {
      vehicle.minCameraOrbit = 'auto 46deg ' + radius * .74 + 'm';
      vehicle.maxCameraOrbit = 'auto 87deg ' + radius * 1.55 + 'm';
    }
    window.ReactNativeWebView?.postMessage('garage-ready');
    if (motion) resetCamera();
  }));
});
vehicle.addEventListener('error', () => window.ReactNativeWebView?.postMessage('garage-failed'));
window.parkfairResetCamera = () => resetCamera();
window.addEventListener('pagehide', () => vehicle.remove(), {once:true});
