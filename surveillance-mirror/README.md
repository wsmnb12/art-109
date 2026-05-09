# The Surveillance Mirror — Phase 3

Phase 3 builds on Phase 2 by adding a stronger fake profiling engine. The artwork still does **not** collect names, emails, faces, or real identities. It only reacts to interaction data created inside the browser session.

## Run the project

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Test syntax and integration

```bash
npm run check
```

## Phase 3 includes

- Everything from Phase 2:
  - Node.js/Express local server
  - surveillance dashboard interface
  - mouse movement tracking
  - click tracking
  - idle/hesitation detection
  - scroll-depth tracking
  - optional typing rhythm tracking
  - coordinate readout
  - cursor trace points
  - live system-log messages
- New fake profiling engine with behavior-derived classifications:
  - The Hesitant Subject
  - The Restless Scanner
  - The Repeating Decider
  - The Deep Scroller
  - The Textual Trace
  - The Measurable Visitor
- New profile fields:
  - Dominant Pattern
  - Assigned Label
  - Misread Risk
- New classification card in the system log panel
- Profile-shift messages when the system changes its label
- Contradiction messages when the user's behavior does not fit neatly
- More conceptual language about algorithmic misreading

## Conceptual behavior

The system intentionally makes exaggerated claims from limited signals. Phase 3 makes that critique more visible: the site assigns labels, changes classifications, and presents false certainty even when the data is shallow or contradictory.

## Phase 4 recommendation

Phase 4 should add a true visual behavior layer with Canvas API or p5.js. The current trace points are DOM-based; a canvas layer can create smoother ghost trails, heatmaps, fingerprints, and accumulated behavioral residue.
