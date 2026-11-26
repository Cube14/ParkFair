const model = document.querySelector('#model');
const status = document.querySelector('#status');
const start = performance.now();
let lastFrame = 0;
let sampling = 0;
let initialOrbit;
let orbitObserved = false;
let zoomObserved = false;
const frameTimes = [];

function report(kind, data = {}) {
  window.ReactNativeWebView?.postMessage(JSON.stringify({ kind, ...data }));
}

function frame(timestamp) {
  if (lastFrame) frameTimes.push(timestamp - lastFrame);
  lastFrame = timestamp;
  if (frameTimes.length < 90) sampling = requestAnimationFrame(frame);
  else {
    const sorted = [...frameTimes].sort((a,b) => a-b);
    report('frames', { sample: sorted.length, median: sorted[Math.floor(sorted.length * .5)], p95: sorted[Math.floor(sorted.length * .95)] });
    sampling = 0;
  }
}

model.addEventListener('load', () => {
  status.textContent = 'CC0 diagnostic · drag and pinch';
  const orbit = model.getCameraOrbit();
  initialOrbit = { theta: orbit.theta, radius: orbit.radius };
  report('ready', { milliseconds: Math.round(performance.now() - start) });
});
model.addEventListener('error', () => report('failed'));
model.addEventListener('camera-change', event => {
  if (event.detail?.source !== 'user-interaction' || !initialOrbit) return;
  const orbit = model.getCameraOrbit();
  const moved = orbitObserved || Math.abs(orbit.theta-initialOrbit.theta) > .03;
  const zoomed = zoomObserved || Math.abs(orbit.radius-initialOrbit.radius) > .01;
  if (moved !== orbitObserved || zoomed !== zoomObserved) {
    orbitObserved = moved;
    zoomObserved = zoomed;
    report('camera', { orbit: moved, zoom: zoomed });
  }
  if (!lastFrame && !sampling) sampling = requestAnimationFrame(frame);
});
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(sampling);
  model.remove();
});
