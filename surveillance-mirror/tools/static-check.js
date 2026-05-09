
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'public', 'js', 'sketch.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public', 'css', 'style.css'), 'utf8');

const requiredIds = [
  'dominant-pattern-value',
  'assigned-label-value',
  'misread-risk-value',
  'classification-value',
  'classification-caption',
  'log-list',
  'mirror-stage'
];

const requiredJsMarkers = [
  'classificationRules',
  'evaluateProfile',
  'profileShift',
  'contradictionCheck',
  'misreadRiskValue'
];

const requiredCssMarkers = [
  '.classification-card',
  '.classification-value',
  '.log-profile'
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

console.log('Static integration check passed: Phase 3 fake profiling engine is wired into HTML, CSS, and JS.');
