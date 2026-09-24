const status = document.getElementById('status');
const photo = document.getElementById('photo');
const cam = document.getElementById('cam');
const frame = document.getElementById('frame');
const preview = document.getElementById('preview');
const fileInput = document.getElementById('file');
const webcamBtn = document.getElementById('webcam');
const captureBtn = document.getElementById('capture');
const analyzeBtn = document.getElementById('analyze');
const resetBtn = document.getElementById('reset');
const results = document.getElementById('results');

// what the classifier looks at (img, video or canvas)
let source = null;
let stream = null;
let classifier = null;
let minConfidence = 0.5;
let modelReady = false;

const READY_MSG = 'Modele chargé';

/** update status text, type is bootstrap alert color */
function setStatus(text, type) {
  status.textContent = text;
  status.className = `alert alert-${type} text-center fs-4`;
}

/** load the model one time, reuse after */
async function init() {
  const config = await fetch('/config').then((r) => r.json());
  minConfidence = config.minConfidence;

  if (typeof ml5 === 'undefined') {
    setStatus('La librairie ml5 ne charge pas, vérifiez la connexion.', 'danger');
    return;
  }

  // ml5 1.x no p5, this gives a promise of the instance
  try {
    classifier = await ml5.imageClassifier('MobileNet');
    if (classifier.ready) await classifier.ready;
  } catch (err) {
    setStatus('Le modèle MobileNet ne charge pas, vérifiez la connexion.', 'danger');
    return;
  }

  modelReady = true;
  setStatus(READY_MSG, 'success');
  if (source) analyzeBtn.disabled = false;
}

/** show one element, hide the rest, null hides zone */
function showInPreview(el) {
  [photo, cam, frame].forEach((node) => { node.hidden = node !== el; });
  preview.hidden = !el;
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  // todo stop webcam if user picks a file while it runs
  analyzeBtn.disabled = true;
  photo.onload = () => {
    source = photo;
    analyzeBtn.disabled = !modelReady;
  };
  photo.src = URL.createObjectURL(file);
  showInPreview(photo);
});

webcamBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch (err) {
    // usually no permission, or no camera at all
    setStatus('Webcam refusée ou introuvable, essayez avec une image.', 'danger');
    return;
  }

  cam.srcObject = stream;
  showInPreview(cam);
  captureBtn.hidden = false;
});

// freeze frame in the canvas, this is what gets analyzed
captureBtn.addEventListener('click', () => {
  frame.width = cam.videoWidth;
  frame.height = cam.videoHeight;
  frame.getContext('2d').drawImage(cam, 0, 0);

  showInPreview(frame);
  captureBtn.hidden = true;
  source = frame;
  analyzeBtn.disabled = !modelReady;
});

/** mobilenet label has commas, just keep the first word */
function cleanLabel(label) {
  return label.split(',')[0].trim();
}

/** show top results as progress bars */
function showResults(list) {
  results.innerHTML = '';

  list.forEach((r, i) => {
    const pct = (r.confidence * 100).toFixed(1);
    const item = document.createElement('div');
    item.className = 'mb-3';
    item.innerHTML = `
      <div class="d-flex justify-content-between">
        <span class="result-label">${i + 1}. ${cleanLabel(r.label)}</span>
        <span class="result-label">${pct} %</span>
      </div>
      <div class="progress">
        <div class="progress-bar" role="progressbar" style="width: ${pct}%"
             aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
      </div>`;
    results.appendChild(item);
  });
}

analyzeBtn.addEventListener('click', async () => {
  if (!source || !modelReady) return;

  analyzeBtn.disabled = true;
  setStatus('Analyse...', 'info');

  // classify returns a promise, top 3 results by default
  let raw;
  try {
    raw = await classifier.classify(source);
  } catch (err) {
    console.error(err);
    setStatus('Erreur pendant l\'analyse : ' + err.message, 'danger');
    analyzeBtn.disabled = false;
    return;
  }
  const top = raw.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  // console.log(top);

  showResults(top);

  // still show results below threshold, just greyed out
  const unsure = top[0].confidence < minConfidence;
  results.classList.toggle('results-low', unsure);
  setStatus(unsure ? 'Terminé, peu fiable, essayez une autre image ou un meilleur éclairage.' : 'Terminé', unsure ? 'warning' : 'success');
  analyzeBtn.disabled = false;
});

/** reset everything for a new image */
function reset() {
  // camera light stays on if we dont stop it
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
    cam.srcObject = null;
  }

  source = null;
  fileInput.value = '';
  photo.removeAttribute('src');
  showInPreview(null);

  results.innerHTML = '';
  results.classList.remove('results-low');
  captureBtn.hidden = true;
  analyzeBtn.disabled = true;

  // keep error message if model not ready yet
  if (modelReady) setStatus(READY_MSG, 'success');
}

resetBtn.addEventListener('click', reset);

init();
