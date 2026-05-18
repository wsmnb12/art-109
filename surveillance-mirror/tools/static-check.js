// Static integration check script for the surveillance-mirror project.
// It verifies that expected HTML elements, JavaScript functions, and CSS selectors
// are present in the public-facing files before the app is considered properly wired.

const fs = require('fs');
const path = require('path');

// Root path is the project directory above this tools folder.
const root = path.join(__dirname, '..');

// Read the HTML, JavaScript, and CSS files that should contain the integration points.
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'public', 'js', 'sketch.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public', 'css', 'style.css'), 'utf8');

// Required HTML element IDs used by the application for rendering and UI updates.
const requiredIds = [
  'behavior-canvas',
  'trace-layer',
  'trace-density-value',
  'residue-index-value',
  'heat-drift-value',
  'profile-trace-density-value',
  'classification-value',
  'classification-caption',
  'mirror-stage',
  'webcam-button',
  'webcam-video',
  'webcam-overlay',
  'webcam-attention-value',
  'screen-facing-time-value',
  'away-time-value',
  'webcam-status-value',
  'webcam-attention-state-value',
  'webcam-signal-value'
];

// JavaScript markers indicate that the application logic is present, including webcam attention,
// drawing routines, and diagnostic updates.
const requiredJsMarkers = [
  'resizeBehaviorCanvas',
  'drawBehaviorLayer',
  'addVisualSample',
  'heatBlooms',
  'clickRipples',
  'idleRings',
  'updateTraceDiagnostics',
  'requestAnimationFrame(drawBehaviorLayer)',
  'enableWebcamAttention',
  'sampleWebcamAttention',
  'FaceDetector',
  'getUserMedia',
  'classifyFaceAttention',
  'Video remains local to the browser'
];

// CSS markers ensure styling exists for the behavior canvas, webcam UI, animations,
// and attention logging overlays.
const requiredCssMarkers = [
  '.behavior-canvas',
  '.trace-diagnostics',
  '@keyframes surveillanceBreath',
  '.classification-card',
  '.webcam-card',
  '.webcam-video',
  '.webcam-overlay',
  '.log-attention'
];

const missing = [];

// Check that each required HTML ID exists in the index.html file.
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) {
    missing.push(`missing HTML id: ${id}`);
  }
}

// Check that each required JavaScript marker exists in the sketch.js file.
for (const marker of requiredJsMarkers) {
  if (!js.includes(marker)) {
    missing.push(`missing JS marker: ${marker}`);
  }
}

// Check that each required CSS marker exists in the style.css file.
for (const marker of requiredCssMarkers) {
  if (!css.includes(marker)) {
    missing.push(`missing CSS marker: ${marker}`);
  }
}

// If anything is missing, print the errors and exit with a failing status.
if (missing.length) {
  console.error('Static integration check failed:');
  for (const issue of missing) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

// Success message for the static check.
console.log('Static integration check passed: Webcam attention layer is wired into HTML, CSS, and JS.');
