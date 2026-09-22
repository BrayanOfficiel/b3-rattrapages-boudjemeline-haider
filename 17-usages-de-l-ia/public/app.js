const status = document.getElementById('status');
const photo = document.getElementById('photo');
const cam = document.getElementById('cam');
const frame = document.getElementById('frame');
const placeholder = document.getElementById('placeholder');
const fileInput = document.getElementById('file');
const webcamBtn = document.getElementById('webcam');
const captureBtn = document.getElementById('capture');
const analyzeBtn = document.getElementById('analyze');
const results = document.getElementById('results');
const warning = document.getElementById('warning');

// what the classifier will look at (img, video or canvas)
let source = null;
let stream = null;
let classifier = null;
let minConfidence = 0.5;
let modelReady = false;

/** Load the model once, reuse it after. */
async function init() {
  const config = await fetch('/config').then((r) => r.json());
  minConfidence = config.minConfidence;

  // ml5 1.x: the instance comes back right away, the weights arrive later
  classifier = ml5.imageClassifier('MobileNet');
  await classifier.ready;

  modelReady = true;
  status.textContent = 'Modèle prêt, choisissez une image ou lancez la webcam.';
  status.className = 'alert alert-success text-center fs-4';
  if (source) analyzeBtn.disabled = false;
}

/** Show one element in the preview zone, hide the others. */
function showInPreview(el) {
  [photo, cam, frame, placeholder].forEach((node) => { node.hidden = node !== el; });
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  photo.src = URL.createObjectURL(file);
  showInPreview(photo);
  source = photo;
  analyzeBtn.disabled = !modelReady;
});

webcamBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch (err) {
    // NotAllowedError most of the time, or no camera at all
    status.textContent = 'Webcam refusée ou introuvable, essayez avec une image.';
    status.className = 'alert alert-danger text-center fs-4';
    return;
  }

  cam.srcObject = stream;
  showInPreview(cam);
  captureBtn.hidden = false;
});

// freeze the current frame in the canvas, that is what gets analyzed
captureBtn.addEventListener('click', () => {
  frame.width = cam.videoWidth;
  frame.height = cam.videoHeight;
  frame.getContext('2d').drawImage(cam, 0, 0);

  showInPreview(frame);
  captureBtn.hidden = true;
  source = frame;
  analyzeBtn.disabled = !modelReady;
});

/** MobileNet labels look like "ice lolly, ice cream, popsicle", keep the first one. */
function cleanLabel(label) {
  return label.split(',')[0].trim();
}

/** Render the top results as Bootstrap progress bars. */
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
  status.textContent = 'Analyse en cours...';
  status.className = 'alert alert-info text-center fs-4';

  // classify() returns a promise in ml5 1.x, 3 results by default (topk)
  const raw = await classifier.classify(source);
  const top = raw.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  // console.log(top);

  showResults(top);

  // below the threshold we still show the results, but greyed out
  const unsure = top[0].confidence < minConfidence;
  results.classList.toggle('results-low', unsure);
  warning.hidden = !unsure;
  warning.textContent = unsure
    ? "Je ne suis pas sûr de ce que je vois, essayez une autre image ou un meilleur éclairage."
    : '';

  status.textContent = unsure ? 'Analyse terminée, résultat incertain.' : 'Analyse terminée.';
  status.className = 'alert alert-success text-center fs-4';
  analyzeBtn.disabled = false;
});

init();
