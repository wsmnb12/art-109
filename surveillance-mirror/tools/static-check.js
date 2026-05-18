const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'public', 'js', 'sketch.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public', 'css', 'style.css'), 'utf8');

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
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) missing.push(`missing HTML id: ${id}`);
}
for (const marker of requiredJsMarkers) {
  if (!js.includes(marker)) missing.push(`missing JS marker: ${marker}`);
}
for (const marker of requiredCssMarkers) {
  if (!css.includes(marker)) missing.push(`missing CSS marker: ${marker}`);
}

if (missing.length) {
  console.error('Static integration check failed:');
  for (const issue of missing) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Static integration check passed: Phase 5 webcam attention layer is wired into HTML, CSS, and JS.');
