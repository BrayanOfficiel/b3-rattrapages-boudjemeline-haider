const status = document.getElementById('status');
const photo = document.getElementById('photo');
const cam = document.getElementById('cam');
const frame = document.getElementById('frame');
const placeholder = document.getElementById('placeholder');
const fileInput = document.getElementById('file');
const webcamBtn = document.getElementById('webcam');
const captureBtn = document.getElementById('capture');
const analyzeBtn = document.getElementById('analyze');

// what the classifier will look at (img, video or canvas)
let source = null;
let stream = null;

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
  analyzeBtn.disabled = false;
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
  analyzeBtn.disabled = false;
});
