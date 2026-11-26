chooseConcept.options[0].text = 'Loggia · parking first';
chooseConcept.options[2].text = 'Motor court · garage first';
chooseConcept.options[1].remove();
state.appearance = appearance.value;
const baseScreen = screenBody;
screenBody = function arrivalScreen(concept, screen) {
  if (screen === 'garage') return baseScreen(concepts[2], screen);
  if (screen !== 'map') return baseScreen(concept, screen);
  const bays = Array.from({length:8}, (_,i) => {
    const id = 'A-' + String(i+9).padStart(2,'0');
    const x = 40 + (i%4)*58, y = i<4 ? 28 : 146;
    return '<g><rect x="'+x+'" y="'+y+'" width="54" height="52" fill="'+(i===3?'#bfab82':'#faf7ee')+'" stroke="#444d42"/><text x="'+(x+8)+'" y="'+(y+29)+'">'+id+'</text></g>';
  });
  return '<div class="padded"><p class="caps">Synthetic plan · Level B1</p><h4>Assigned bay A-12</h4><div class="plan" tabindex="0"><svg viewBox="0 0 320 220" width="100%" role="img" aria-label="Two rows of four bays either side of an eastbound aisle. A-12 is the fourth north bay."><rect x="2" y="6" width="316" height="204" fill="none" stroke="#62695c" stroke-width="4"/>'+bays.join('')+'<path d="M0 113H320" stroke="#657161" stroke-dasharray="10 6"/><text x="8" y="106">Entry →</text><text x="245" y="106">→ Exit</text></svg></div><label>Plan zoom <input type="range" min="100" max="250" value="100" oninput="this.closest(\'.padded\').querySelector(\'svg\').style.width=this.value+\'%\'"></label><details><summary>Accessible bay list</summary>North row A-09, A-10, A-11, A-12 (assigned). South row A-13 through A-16. Enter west, exit east.</details></div>';
};
show('home');
const stages = ['Prepare','Review','Confirm','Publish','Communicate'];
const descriptions = ['Select the December cycle, preview the synthetic workbook and confirm Flat → Residence and Bay → Assignment.', 'Check coverage for flat 012 and resolve the missing bay in the chart.', 'Compare the corrected assignment with the previous cycle and approve the revision.', 'Publish the approved revision and schedule the mock activation.', 'Review the simulated delivery outcome for this allocation.'];
let stage = 0, corrected = false;
const stageNav = document.querySelector('#stages'), dossier = document.querySelector('#dossier'), editor = document.querySelector('#editor');
function renderStage() {
  stageNav.innerHTML = stages.map((label,i)=>'<button disabled aria-current="'+(stage===i?'step':'false')+'">'+(i+1)+' · '+label+'</button>').join('');
  const blocked = stage===1 && !corrected;
  dossier.innerHTML = '<h3>'+stages[stage]+'</h3><p>'+descriptions[stage]+'</p>' + (stage===1?'<p>'+ (corrected?'Coverage complete · '+document.querySelector('#slot').value:'1 unresolved row · Flat 012')+'</p><button id="edit">Open chart drawer</button>':'') + (stage===4?'<p>1 simulated delivery · 0 failures</p>':'<button id="next" '+(blocked?'disabled':'')+'>'+['Confirm mapping','Accept review','Approve revision','Publish and schedule'][stage]+'</button>');
  dossier.querySelector('#edit')?.addEventListener('click',()=>editor.showModal());
  dossier.querySelector('#next')?.addEventListener('click',()=>{stage++;renderStage()});
}
editor.querySelector('form').addEventListener('submit',()=>{corrected=true;renderStage()});
renderStage();
