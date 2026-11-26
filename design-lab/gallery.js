const concepts = [
  { id: 'r1', code: 'R1', name: 'Architectural luxury', copy: 'A daylight gallery of concrete, stone and brushed metal. Parking is set like an architectural annotation.', mode: 'light' },
  { id: 'r2', code: 'R2', name: 'Cinematic elegance', copy: 'A photograph leads the composition. A restrained blue-hour transition gives way to crisp parking details.', mode: 'dark' },
  { id: 'r3', code: 'R3', name: 'Interactive private garage', copy: 'The garage leads. A responsive viewpoint study connects a configurable vehicle silhouette to the parking plan.', mode: 'dark' },
];
const screens = {
  splash: ['Splash', 'Brief brand entrance; Skip takes the user straight to sign-in.'],
  onboarding: ['Onboarding', 'Introduces the service and permission context.'],
  signin: ['Sign-in', 'Credentials stay local to this mock and are never submitted.'],
  home: ['Home', 'Lead with current slot, section and effective dates.'],
  garage: ['Garage', 'Drag or use the zoom buttons. This is image parallax, not a 3D mesh.'],
  parking: ['Parking details', 'The active allocation is visually and semantically separate from the next allocation.'],
  map: ['Parking map', 'Select a labeled bay. The section and selected bay are also available as text.'],
  upcoming: ['Upcoming', 'A published future slot shown with the date it may take effect.'],
  schedule: ['Schedule', 'Current and future cycles presented in sequence.'],
  history: ['History', 'Prior effective placements with date ranges.'],
  inbox: ['Notifications', 'An inbox item leads to authenticated parking details.'],
  vehicle: ['Vehicle profile', 'A verified identifier can sit beside an explicitly illustrative vehicle.'],
  account: ['Account and sessions', 'Review signed-in installations and sign out.'],
  appearance: ['Appearance', 'Light/dark, fidelity and reduced-motion control studies.'],
  states: ['Offline and other states', 'A cached snapshot includes a timestamp. Loading, error and empty states stay distinct.'],
};
const state = { concept: 'r1', screen: 'home', bay: 'A-12', appearance: 'dark', scenario: 'offline' };
const reduce = document.querySelector('#reduce-motion');
const player = document.querySelector('#play-motion');
const inspector = document.querySelector('#resident-phone');
const motionNote = document.querySelector('#motion-note');
const describeMotion = () => reduce.checked || matchMedia('(prefers-reduced-motion: reduce)').matches;
const button = (title, screen, primary = false) => `<button type="button" class="button ${primary ? 'primary' : ''}" data-screen="${screen}">${title}</button>`;
const row = (label, value) => `<div class="line"><small>${label}</small><strong>${value}</strong></div>`;
const cap = (label, heading) => `<p class="caps">${label}</p><h4>${heading}</h4>`;
const panel = (label, text) => `<div class="mock-card"><strong>${label}</strong><p>${text}</p></div>`;
const photo = (concept, orbit = false) =>
  `<figure class="photo${orbit ? ' orbit' : ''}" ${orbit ? 'tabindex="0" aria-label="Garage illustration. Use arrow keys to adjust viewpoint."' : ''}>
    <img draggable="false" src="assets/${concept.id}.png" alt="${concept.name} garage art with an unbranded concept car"></figure>`;

function screenBody(concept, screen) {
  const shell = (html) => `<div class="padded">${html}</div>`;
  switch (screen) {
    case 'splash': return `<div class="hero">${photo(concept)}${shell(cap('ParkFair', 'A place to arrive.') + button('Continue', 'onboarding', true) + button('Skip', 'signin'))}</div>`;
    case 'onboarding': return photo(concept) + shell(cap('Welcome', 'Find your parking.') + panel('One glance before you arrive', 'View your effective space, upcoming changes, and the path to your assigned bay.') + button('Sign in', 'signin', true));
    case 'signin': return shell(cap('Resident access', 'Welcome back.') + '<label class="mock-field">Flat or username<input autocomplete="off" placeholder="Example: 012"></label><label class="mock-field">Password<input type="password" autocomplete="off" placeholder="Demo field"></label>' + button('Preview signed-in home', 'home', true));
    case 'home': {
      const imageFirst = concept.id !== 'r1';
      const info = `<div class="padded hero-info"><div>${cap(concept.id === 'r3' ? 'Private garage' : 'Current parking', 'A-12')}<p>Covered · Level B1</p></div>${concept.id === 'r3' ? button('Garage', 'garage', true) : ''}</div>`;
      return `<div class="hero">${imageFirst ? photo(concept) + info : info + photo(concept)}</div>` +
        shell(row('Effective', '14–20 December') + row('Next published', 'C-03 · 21 December') +
          (concept.id === 'r3' ? button('View parking plan', 'map', true) : button('Open garage', 'garage', true)));
    }
    case 'garage': return photo(concept, true) + shell(cap('Illustrative vehicle', concept.id === 'r1' ? 'The parking gallery' : concept.id === 'r2' ? 'Arrival view' : 'Your private garage') +
      '<p>Drag to explore the viewpoint or use the controls.</p><div class="zoom-controls"><button class="button" data-zoom="-1" aria-label="Zoom out">−</button><button class="button" data-zoom="1" aria-label="Zoom in">+</button><button class="button" data-zoom="0">Reset view</button></div>' +
      row('Assigned bay', 'A-12 · Level B1') + button('Locate my bay', 'parking', true));
    case 'parking': return shell(cap('Effective now', 'Bay A-12') + row('Section', 'A · Level B1') + row('Parking type', 'Covered') + row('End date', '20 December') +
      panel('Arrival note', 'Use the Level B1 entry ramp and follow the lettered aisle.') + button('Open parking map', 'map', true) + button('View upcoming', 'upcoming'));
    case 'map': return shell(cap('Level B1', 'Parking plan') + '<p>Tap a bay or use the tab key.</p><div class="map">' +
      ['A-09', 'A-10', 'A-11', 'A-12', 'A-13', 'A-14', 'A-15', 'A-16'].map((bay) =>
        `<button type="button" data-bay="${bay}" aria-pressed="${bay === state.bay}">${bay}</button>`).join('') + '</div>' +
      '<div aria-live="polite" data-bay-text>' + panel(state.bay, state.bay === 'A-12' ? 'Your assigned bay · Covered' : 'Another bay in Section A') + '</div>' + button('Parking details', 'parking'));
    case 'upcoming': return shell(cap('Published · future', 'Bay C-03') + panel('Effective from 21 December', 'Continue using A-12 through 20 December.') + row('Location', 'Section C · Outdoor') + button('See full schedule', 'schedule', true));
    case 'schedule': return shell(cap('Calendar', 'Parking schedule') + panel('14–20 December · Current', 'A-12 · Covered · Level B1') + panel('21–27 December · Upcoming', 'C-03 · Outdoor · Section C') + button('View history', 'history'));
    case 'history': return shell(cap('Past cycles', 'Parking history') + panel('07–13 December', 'B-08 · Covered · Level B1') + panel('30 November–06 December', 'C-04 · Outdoor · Section C') + button('Current parking', 'parking'));
    case 'inbox': return shell(cap('Resident updates', 'Notifications') + panel('Upcoming allocation published', 'The next cycle has a parking update.') + button('View update', 'upcoming', true));
    case 'vehicle': return photo(concept) + shell(cap('Registered vehicle', 'Vehicle profile') + row('Identifier', 'DEMO-012') + row('Image', 'Illustrative concept vehicle') + button('Open garage', 'garage'));
    case 'account': return shell(cap('Profile', 'Account and sessions') + row('Residence', 'Flat 012') + panel('This installation', 'Android · Last used today') + button('Sign-out preview', 'signin'));
    case 'appearance': return shell(cap('Preferences', 'Appearance') + row('Colour scheme', state.appearance === 'light' ? 'Light' : 'Dark') + row('Motion', describeMotion() ? 'Reduced' : 'System default') + panel('Graphics fidelity', 'Eco · Premium · Ultra') + '<p>Use the gallery appearance and motion controls to test this preview.</p>');
    case 'states': {
      const states = {
        offline: ['Cached parking', 'A-12 · Last synchronized 18 December at 09:20. This may have changed.'],
        loading: ['Checking parking…', 'Keep the allocation area stable while a request is in progress.'],
        error: ['Parking unavailable', 'Check connectivity and retry.'],
        empty: ['No current assignment', 'Check the schedule or ask the administrator.'],
      };
      return shell(cap('Service states', 'Parking status') + '<div class="zoom-controls">' +
        Object.keys(states).map((key) => `<button class="button" aria-pressed="${key === state.scenario}" data-scenario="${key}">${key}</button>`).join('') +
        '</div>' + panel(...states[state.scenario]) + button('Back to home', 'home'));
    }
  }
}

function phone(concept, screen, appearance = concept.mode) {
  const nav = [['home', 'Home'], ['garage', 'Garage'], ['schedule', 'Schedule'], ['account', 'Account']];
  return `<article class="phone ${concept.id} ${appearance}" aria-label="${concept.name} preview">
  <header class="phone-top"><strong>PARKFAIR</strong><small>Flat 012</small></header>
  <div class="phone-content">${screenBody(concept, screen)}</div>
  <nav class="phone-nav" aria-label="Resident preview navigation">${nav.map(([key, label]) =>
    `<button type="button" data-screen="${key}" ${screen === key ? 'aria-current="true"' : ''}>${label}</button>`).join('')}</nav></article>`;
}

const residentGrid = document.querySelector('#resident-grid');
residentGrid.innerHTML = concepts.map((concept) => `<article class="concept" data-concept="${concept.id}">
<p class="eyebrow">${concept.code}</p><h3>${concept.name}</h3><p>${concept.copy}</p>
<div class="concept-phone">${phone(concept, 'home')}</div>
<div class="zoom-controls"><button class="button" type="button" data-card="home" aria-pressed="true">Home</button>
<button class="button" type="button" data-card="garage" aria-pressed="false">Garage</button>
<button class="button" type="button" data-inspect="${concept.id}">Screen library</button></div></article>`).join('');

const chooseConcept = document.querySelector('#inspect-concept');
chooseConcept.innerHTML = concepts.map(({ id, code, name }) => `<option value="${id}">${code} · ${name}</option>`).join('');
const appearance = document.querySelector('#appearance');
const index = document.querySelector('#screen-index');
index.innerHTML = Object.entries(screens).map(([id, [label]]) => `<button type="button" data-screen="${id}">${label}</button>`).join('');
function show(screen = state.screen) {
  if (!Object.hasOwn(screens, screen)) return;
  state.screen = screen;
  inspector.innerHTML = phone(concepts.find(({ id }) => id === state.concept), screen, state.appearance);
  document.querySelector('#screen-caption').textContent = screens[screen][1];
  for (const entry of index.children) entry.setAttribute('aria-pressed', entry.dataset.screen === screen);
}
show();
chooseConcept.addEventListener('change', () => { state.concept = chooseConcept.value; show(); });
appearance.addEventListener('change', () => { state.appearance = appearance.value; show(); });
reduce.addEventListener('change', () => { document.body.classList.toggle('reduced', reduce.checked); });
let playId = 0;
player.addEventListener('click', async () => {
  if (describeMotion()) {
    show('garage');
    motionNote.textContent = 'Reduced motion is active. The garage opened directly.';
    return;
  }
  const durableId = ++playId;
  for (const screen of ['splash', 'home', 'garage', 'parking', 'upcoming']) {
    if (durableId !== playId) return;
    show(screen);
    await new Promise((resolve) => setTimeout(resolve, 850));
  }
  motionNote.textContent = 'Transition study finished on the future allocation.';
});

const steps = ['Cycle', 'Import', 'Mapping', 'Validate', 'Correct', 'Coverage', 'Compare', 'Approve', 'Publish', 'Activate', 'Dispatch'];
const guide = [
  ['Choose an upcoming cycle', '14–20 December · Residential parking', 'Open a planned cycle or create one. Today’s effective cycle remains available.'],
  ['Bring in your chart', 'Choose Excel or CSV', 'Or enter a chart manually. The worksheet is reviewed before it changes a draft.'],
  ['Confirm the column mapping', 'Flat → Apartment · Slot → Bay', 'Map unfamiliar headers explicitly. Identifiers remain text.'],
  ['Validate the chart', '20 rows accepted · 2 need attention', 'Open issues by row and field. Validation checks ownership, inventory and capacity.'],
  ['Correct two assignments', 'Row 8 · Bay A-12 is full', 'Open a focused row detail sheet on phones. On web, edit beside the visible chart.'],
  ['Review coverage', '22 eligible · 21 assigned · 1 exclusion', 'The review shows every unassigned eligible flat and its reason if excluded.'],
  ['Compare with the previous revision', 'Revision 3 → Revision 4', 'Review changes before approval.'],
  ['Approve revision 4', '21 assignments · 1 reviewed exclusion', 'Approval attaches to this exact version. An edit requires a new review.'],
  ['Publish approved revision 4', 'Future allocation · 14–20 December', 'This saves the chart and prepares pending notifications. Activation is separate.'],
  ['Choose activation', 'Manual or scheduled for 14 December', 'Scheduling requires explicit approval. Inventory is checked again at execution.'],
  ['Review notification dispatch', '21 pending events', 'Review the current publication, receipt state and unresolved delivery events.'],
];
const art = [
  { id: 'a', code: 'A1', name: 'Review dossier', intro: 'A focused guided brief with a chart drawer for corrections.' },
  { id: 'b', code: 'A2', name: 'Guided workbench', intro: 'A persistent chart with review and row details in a side panel.' },
];
function adminContent(concept, i) {
  const [title, lead, body] = guide[i];
  const table = '<table aria-label="Synthetic allocation chart"><thead><tr><th>Flat</th><th>Bay</th><th>Review</th></tr></thead><tbody><tr><td>004</td><td>A-11</td><td><span class="status pass">Accepted</span></td></tr><tr><td>005</td><td>A-12</td><td><span class="status check">Capacity</span></td></tr><tr><td>011</td><td>C-08</td><td><span class="status check">Check vehicle</span></td></tr></tbody></table>';
  const detail = {
    1: '<div class="upload-zone"><strong>December allocation.xlsx</strong><small>Example workbook | 22 rows | XLSX</small><button type="button" class="button" data-demo-upload>Use sample workbook</button><span aria-live="polite" data-upload-status></span></div>',
    3: '<div class="review-stats"><span><small>Accepted</small><b>20</b></span><span><small>Needs review</small><b>2</b></span></div>',
    8: '<div class="confirmation"><strong>Revision 4 is approved</strong><span>21 placements | Pending activation</span></div>',
  }[i] ?? '';
  const editor = `<div class="paper editor"><p class="eyebrow">Step ${i + 1} of ${steps.length}</p><strong>${lead}</strong><p>${body}</p>${i === 4 ?
    '<label>Filter chart <input data-chart-filter placeholder="Flat or bay"></label><p><label>Replacement bay <select><option>A-14</option><option>A-16</option></select></label></p>' : ''}${detail}</div>`;
  return `<h4>${title}</h4><div class="desk">${concept.id === 'b' ? '<div class="paper"><strong>Revision 4 chart</strong>' + table + '</div>' + editor : editor + (i === 4 ? '<div class="paper"><strong>Nearby rows</strong>' + table + '</div>' : '<div class="paper"><strong>Cycle 12</strong><p>14–20 December</p><p>Revision 4 · Synthetic chart</p></div>')}</div>
  <div class="actions">${i > 0 ? `<button class="button" type="button" data-step="${i - 1}">Back</button>` : ''}${i < steps.length - 1 ?
    `<button class="button primary" type="button" data-step="${i + 1}">Preview ${steps[i + 1].toLowerCase()}</button>` : ''}</div>`;
}
const adminGrid = document.querySelector('#admin-grid');
adminGrid.innerHTML = art.map((entry) => `<article class="workstation ${entry.id}" data-admin="${entry.id}"><header>
<p class="eyebrow">${entry.code} · Hybrid administrator</p><h3>${entry.name}</h3><p class="caption">${entry.intro}</p></header>
<section><div class="step-strip" aria-label="Workflow stages">${steps.map((step, i) =>
  `<button type="button" data-step="${i}" aria-pressed="${i === 1}">${step}</button>`).join('')}</div>
<div class="admin-content">${adminContent(entry, 1)}</div></section></article>`).join('');

let drag;
function updateView(figure, x, y, zoom) {
  figure.dataset.x = x; figure.dataset.y = y; figure.dataset.zoom = zoom;
  figure.style.setProperty('--x', x + 'px'); figure.style.setProperty('--y', y + 'px');
  figure.style.setProperty('--zoom', zoom);
}
function zoomBy(control) {
  const figure = control.closest('.phone').querySelector('.orbit');
  if (!figure) return;
  const delta = Number(control.dataset.zoom);
  const zoom = Math.min(1.45, Math.max(1, Number(figure.dataset.zoom ?? 1) + delta * .13));
  updateView(figure, 0, 0, delta ? zoom : 1);
}
document.addEventListener('click', (event) => {
  const control = event.target.closest('button');
  if (!control) return;
  const data = control.dataset;
  const card = control.closest('[data-concept]');
  if (data.demoUpload !== undefined) {
    control.closest('.upload-zone').querySelector('[data-upload-status]').textContent = 'Synthetic workbook selected.';
  } else if (data.step !== undefined) {
    const station = control.closest('[data-admin]');
    const step = Number(data.step);
    const section = station.querySelector('.admin-content');
    section.innerHTML = adminContent(art.find(({ id }) => id === station.dataset.admin), step);
    for (const entry of station.querySelector('.step-strip').children) entry.setAttribute('aria-pressed', Number(entry.dataset.step) === step);
    const heading = section.querySelector('h4');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  } else if (data.inspect) {
    state.concept = chooseConcept.value = data.inspect;
    state.appearance = appearance.value = concepts.find(({ id }) => id === state.concept).mode;
    show('home');
    document.querySelector('#resident-inspect').scrollIntoView();
  } else if (card && (data.card || data.screen)) {
    const screen = data.card || data.screen;
    card.querySelector('.concept-phone').innerHTML = phone(concepts.find(({ id }) => id === card.dataset.concept), screen);
    for (const entry of card.querySelectorAll('[data-card]')) entry.setAttribute('aria-pressed', entry.dataset.card === screen);
  } else if (data.screen) {
    playId++; show(data.screen);
  } else if (data.zoom !== undefined) {
    zoomBy(control);
  } else if (data.bay) {
    state.bay = data.bay;
    const phoneElement = control.closest('.phone');
    for (const entry of phoneElement.querySelectorAll('[data-bay]')) entry.setAttribute('aria-pressed', entry === control);
    phoneElement.querySelector('[data-bay-text]').innerHTML =
      panel(state.bay, state.bay === 'A-12' ? 'Your assigned bay · Covered' : 'Another bay in Section A');
  } else if (data.scenario) { state.scenario = data.scenario; show('states'); }
});
document.addEventListener('input', (event) => {
  const field = event.target.closest('[data-chart-filter]');
  if (!field) return;
  for (const line of field.closest('.desk').querySelectorAll('tbody tr')) {
    line.hidden = !line.textContent.toLowerCase().includes(field.value.trim().toLowerCase());
  }
});
document.addEventListener('pointerdown', (event) => {
  const target = event.target.closest('.orbit');
  if (!target || describeMotion()) return;
  target.setPointerCapture(event.pointerId);
  drag = { target, id: event.pointerId, x: event.clientX, y: event.clientY };
});
document.addEventListener('pointermove', (event) => {
  if (!drag || drag.id !== event.pointerId) return;
  const clamp = (value) => Math.max(-22, Math.min(22, value * .17));
  updateView(drag.target, clamp(event.clientX - drag.x), clamp(event.clientY - drag.y), Math.max(1.16, Number(drag.target.dataset.zoom || 1)));
});
for (const name of ['pointerup', 'pointercancel']) document.addEventListener(name, () => { drag = undefined; });
document.addEventListener('keydown', (event) => {
  const target = event.target.closest('.orbit');
  if (!target || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  const x = Math.max(-22, Math.min(22, Number(target.dataset.x || 0) + (event.key === 'ArrowLeft' ? -6 : event.key === 'ArrowRight' ? 6 : 0)));
  const y = Math.max(-22, Math.min(22, Number(target.dataset.y || 0) + (event.key === 'ArrowUp' ? -6 : event.key === 'ArrowDown' ? 6 : 0)));
  updateView(target, x, y, Math.max(1.16, Number(target.dataset.zoom || 1)));
});
