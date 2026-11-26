const colors = new URLSearchParams(location.search);
for (const key of ['surface', 'ink']) {
  const color = colors.get(key);
  if (/^#[0-9a-f]{6}$/i.test(color ?? '')) document.documentElement.style.setProperty('--' + key, color);
}
const vehicle = document.querySelector('#vehicle');
vehicle.addEventListener('load', () => window.ReactNativeWebView?.postMessage('garage-ready'));
vehicle.addEventListener('error', () => window.ReactNativeWebView?.postMessage('garage-failed'));
window.parkfairResetCamera = () => {
  vehicle.cameraTarget = 'auto auto auto';
  vehicle.cameraOrbit = '35deg 69deg 125%';
  vehicle.fieldOfView = '30deg';
  vehicle.jumpCameraToGoal();
};
window.addEventListener('pagehide', () => vehicle.remove(), {once:true});
