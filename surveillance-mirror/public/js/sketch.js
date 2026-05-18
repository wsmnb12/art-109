

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    statusPill: document.querySelector('#status-pill'),
    calibrationButton: document.querySelector('#calibration-button'),
    mirrorStage: document.querySelector('#mirror-stage'),
    behaviorCanvas: document.querySelector('#behavior-canvas'),
    mirrorContent: document.querySelector('#mirror-content'),
    mirrorTitle: document.querySelector('#mirror-title'),
    mirrorMessage: document.querySelector('#mirror-message'),
    logList: document.querySelector('#log-list'),
    traceLayer: document.querySelector('#trace-layer'),
    coordinateReadout: document.querySelector('#coordinate-readout'),
    profileSeed: document.querySelector('#profile-seed'),
    reflectionType: document.querySelector('#reflection-type'),
    profileCaption: document.querySelector('#profile-caption'),
    attentionValue: document.querySelector('#attention-value'),
    clickConfidenceValue: document.querySelector('#click-confidence-value'),
    predictabilityValue: document.querySelector('#predictability-value'),
    noiseValue: document.querySelector('#noise-value'),
    idleValue: document.querySelector('#idle-value'),
    scrollValue: document.querySelector('#scroll-value'),
    dominantPatternValue: document.querySelector('#dominant-pattern-value'),
    assignedLabelValue: document.querySelector('#assigned-label-value'),
    misreadRiskValue: document.querySelector('#misread-risk-value'),
    profileTraceDensityValue: document.querySelector('#profile-trace-density-value'),
    traceDensityValue: document.querySelector('#trace-density-value'),
    residueIndexValue: document.querySelector('#residue-index-value'),
    heatDriftValue: document.querySelector('#heat-drift-value'),
    classificationValue: document.querySelector('#classification-value'),
    classificationCaption: document.querySelector('#classification-caption'),
    anonymousInput: document.querySelector('#anonymous-input'),
    webcamButton: document.querySelector('#webcam-button'),
    webcamVideo: document.querySelector('#webcam-video'),
    webcamOverlay: document.querySelector('#webcam-overlay'),
    webcamPlaceholder: document.querySelector('#webcam-placeholder'),
    webcamStatusValue: document.querySelector('#webcam-status-value'),
    webcamAttentionStateValue: document.querySelector('#webcam-attention-state-value'),
    webcamSignalValue: document.querySelector('#webcam-signal-value'),
    webcamAttentionValue: document.querySelector('#webcam-attention-value'),
    screenFacingTimeValue: document.querySelector('#screen-facing-time-value'),
    awayTimeValue: document.querySelector('#away-time-value')
  };

  const state = {
    startedAt: Date.now(),
    mouseMoves: 0,
    clicks: 0,
    keyStrokes: 0,
    maxScrollPercent: 0,
    idleSeconds: 0,
    longestIdleSeconds: 0,
    lastInteractionAt: Date.now(),
    lastClickAt: 0,
    lastMousePosition: null,
    recentSpeeds: [],
    repeatedRegionHits: new Map(),
    messagesShown: new Set(),
    profileConfidence: 0,
    traceCount: 0,
    lastIdleLogAt: 0,
    lastEscalationAt: 0,
    lastProfileShiftAt: 0,
    lastTypingAt: 0,
    profileHistory: [],
    visualSamples: [],
    heatBlooms: [],
    clickRipples: [],
    idleRings: [],
    scanSweep: 0,
    residueIndex: 0,
    traceDensity: 0,
    webcamStream: null,
    webcamEnabled: false,
    faceDetector: null,
    faceDetectionSupported: false,
    attentionState: 'Opt-in',
    lastAttentionState: 'Opt-in',
    lastAttentionSampleAt: 0,
    lastAttentionTickAt: Date.now(),
    lookingAtScreenSeconds: 0,
    lookingAwaySeconds: 0,
    attentionSamples: [],
    currentClassification: 'Awaiting Behavior'
  };

  const messagePools = {
    movement: [
      'Cursor movement detected.',
      'Movement path stored as behavioral residue.',
      'The mirror is learning the shape of your attention.',
      'A pattern is forming from ordinary motion.'
    ],
    fastMovement: [
      'Movement instability increased.',
      'Rapid cursor acceleration detected.',
      'Subject is crossing zones faster than expected.',
      'The system mistakes speed for intent.'
    ],
    hesitation: [
      'Subject paused before choosing.',
      'Stillness detected. The system interprets silence as data.',
      'Hesitation has been classified.',
      'The pause has been assigned meaning.',
      'Nothing happened. The system recorded it anyway.'
    ],
    click: [
      'Click event stored.',
      'Decision point recorded.',
      'The system has converted a click into evidence.',
      'Selection behavior added to profile.'
    ],
    repeatedClick: [
      'Repeated decision pattern recorded.',
      'Click confidence appears unstable.',
      'Multiple selections detected in the same behavioral window.',
      'The system calls repetition a preference.'
    ],
    scroll: [
      'Scroll depth increased.',
      'Attention moved below the visible frame.',
      'Vertical scan pattern recorded.',
      'The page measures curiosity as distance.'
    ],
    typing: [
      'Input rhythm captured.',
      'Text signal detected; identity still unavailable.',
      'The system is measuring rhythm instead of meaning.',
      'Keystrokes converted into behavioral texture.'
    ],
    profileShift: [
      'Classification changed. The system rewrote the subject.',
      'A new label has been assigned from incomplete evidence.',
      'Profile model updated without understanding the person.',
      'The mirror has replaced uncertainty with a category.'
    ],
    contradiction: [
      'Contradictory behavior detected. Confidence remains unchanged.',
      'The profile absorbs inconsistency as useful noise.',
      'Uncertainty detected. Prediction layer continues anyway.',
      'The system treats ambiguity as another signal.'
    ],
    visual: [
      'Ghost trail rendered from cursor residue.',
      'Heat bloom added to behavioral map.',
      'The trace layer is converting movement into evidence.',
      'Data residue is now visible inside the mirror.'
    ],
    attention: [
      'Camera attention signal activated locally.',
      'The mirror is now reading screen-facing presence as attention.',
      'A face position has become another behavioral signal.',
      'Looking away has been converted into an absence event.',
      'The system treats visible attention as measurable compliance.'
    ],
    escalation: [
      'Profile confidence increasing.',
      'The system does not need your name.',
      'A pattern can become an identity.',
      'The profile does not need to be accurate to be useful.',
      'You are being reflected as data.',
      'The mirror is not showing you. It is showing what can be extracted from you.'
    ]
  };

  const classificationRules = [
    {
      label: 'The Hesitant Subject',
      pattern: 'Pause-Driven',
      risk: 'Severe',
      caption: 'A long pause has been interpreted as uncertainty, even though the system cannot know why you stopped.',
      match: () => state.longestIdleSeconds >= 8 || state.idleSeconds >= 6,
      message: 'Your stillness has been labeled as hesitation.'
    },
    {
      label: 'The Restless Scanner',
      pattern: 'Rapid Movement',
      risk: 'High',
      caption: 'Fast movement has been translated into restlessness. The interpretation is confident, not necessarily true.',
      match: () => averageSpeed() > 1.25 && state.mouseMoves > 35,
      message: 'Your movement speed has been labeled as restlessness.'
    },
    {
      label: 'The Repeating Decider',
      pattern: 'Click Loop',
      risk: 'High',
      caption: 'Repeated clicks are treated as a decision loop. The system turns repetition into personality.',
      match: () => state.clicks >= 5 || maxRegionHits() >= 3,
      message: 'Your clicks are now being read as a preference pattern.'
    },
    {
      label: 'The Deep Scroller',
      pattern: 'Vertical Search',
      risk: 'Moderate',
      caption: 'Scroll depth has been mistaken for curiosity. The page converts distance into intent.',
      match: () => state.maxScrollPercent >= 65,
      message: 'Your scrolling has been labeled as investigative behavior.'
    },
    {
      label: 'The Textual Trace',
      pattern: 'Rhythmic Input',
      risk: 'Moderate',
      caption: 'Typing rhythm is being measured without reading identity. The mirror still invents meaning.',
      match: () => state.keyStrokes >= 10,
      message: 'Your typing rhythm has been added to the profile.'
    },
    {
      label: 'The Watched Observer',
      pattern: 'Screen-Facing Signal',
      risk: 'Severe',
      caption: 'The webcam proxy turns face presence into attention, even though attention is more complex than visibility.',
      match: () => state.webcamEnabled && state.lookingAtScreenSeconds >= 6,
      message: 'Your screen-facing time has been treated as proof of attention.'
    },
    {
      label: 'The Absent Subject',
      pattern: 'Attention Gap',
      risk: 'Severe',
      caption: 'Looking away or losing face detection is labeled as absence, even when the system cannot know why.',
      match: () => state.webcamEnabled && state.lookingAwaySeconds >= 5,
      message: 'Your attention gap has been added to the profile.'
    },
    {
      label: 'The Measurable Visitor',
      pattern: 'Mixed Signals',
      risk: 'High',
      caption: 'Different signals have been merged into one simplified data identity.',
      match: () => calculatePredictability() >= 45,
      message: 'The system has enough traces to create a simplified version of you.'
    },
    {
      label: 'Awaiting Behavior',
      pattern: 'Insufficient Data',
      risk: 'High',
      caption: 'The system has not yet invented enough certainty.',
      match: () => true,
      message: 'Profile engine is waiting for ordinary actions.'
    }
  ];


  const canvasContext = elements.behaviorCanvas?.getContext('2d') || null;

  function resizeBehaviorCanvas() {
    if (!elements.behaviorCanvas || !elements.mirrorStage || !canvasContext) return;
    const rect = elements.mirrorStage.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    elements.behaviorCanvas.width = Math.max(1, Math.floor(rect.width * pixelRatio));
    elements.behaviorCanvas.height = Math.max(1, Math.floor(rect.height * pixelRatio));
    elements.behaviorCanvas.style.width = `${rect.width}px`;
    elements.behaviorCanvas.style.height = `${rect.height}px`;
    canvasContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function localPointFromViewport(x, y) {
    if (!elements.mirrorStage) return null;
    const rect = elements.mirrorStage.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;
    if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) return null;
    return { x: localX, y: localY, width: rect.width, height: rect.height };
  }

  function addVisualSample(x, y, speed = 0, kind = 'move') {
    const local = localPointFromViewport(x, y);
    if (!local) return;

    const sample = {
      x: local.x,
      y: local.y,
      speed,
      kind,
      createdAt: Date.now(),
      life: kind === 'click' ? 2600 : kind === 'typing' ? 2100 : 5200
    };

    state.visualSamples.push(sample);
    if (state.visualSamples.length > 260) state.visualSamples.splice(0, state.visualSamples.length - 260);

    state.heatBlooms.push({
      x: local.x,
      y: local.y,
      radius: kind === 'click' ? 22 : 10 + Math.min(20, speed * 10),
      createdAt: Date.now(),
      life: kind === 'click' ? 3200 : 4600,
      intensity: kind === 'click' ? 1 : Math.min(1, 0.35 + speed)
    });
    if (state.heatBlooms.length > 120) state.heatBlooms.shift();

    if (kind === 'click') {
      state.clickRipples.push({ x: local.x, y: local.y, createdAt: Date.now(), life: 1400 });
      if (state.clickRipples.length > 18) state.clickRipples.shift();
    }

    state.residueIndex = Math.min(999, state.residueIndex + (kind === 'click' ? 6 : kind === 'typing' ? 4 : 1));
    updateTraceDiagnostics();
  }

  function addIdleRing() {
    if (!elements.mirrorStage) return;
    const rect = elements.mirrorStage.getBoundingClientRect();
    state.idleRings.push({
      x: rect.width / 2,
      y: rect.height / 2,
      createdAt: Date.now(),
      life: 2600
    });
    if (state.idleRings.length > 8) state.idleRings.shift();
    updateTraceDiagnostics();
  }

  function updateTraceDiagnostics() {
    const density = Math.min(100, Math.round((state.visualSamples.length / 240) * 100));
    state.traceDensity = density;
    const heatLabel = density > 78 ? 'Saturated' : density > 48 ? 'Accumulating' : density > 18 ? 'Emerging' : 'Dormant';
    safeSet(elements.traceDensityValue, `${density}%`);
    safeSet(elements.profileTraceDensityValue, `${density}%`);
    safeSet(elements.residueIndexValue, String(state.residueIndex));
    safeSet(elements.heatDriftValue, heatLabel);
  }

  function drawGridInterference(width, height, time) {
    if (!canvasContext) return;
    canvasContext.save();
    canvasContext.globalAlpha = 0.12;
    canvasContext.lineWidth = 1;
    canvasContext.strokeStyle = 'rgba(139, 255, 220, 0.45)';
    const offset = (time / 90) % 44;
    for (let x = -44 + offset; x < width + 44; x += 44) {
      canvasContext.beginPath();
      canvasContext.moveTo(x, 0);
      canvasContext.lineTo(x + Math.sin(time / 900 + x) * 8, height);
      canvasContext.stroke();
    }
    canvasContext.restore();
  }

  function drawBehaviorLayer() {
    if (!canvasContext || !elements.behaviorCanvas || !elements.mirrorStage) return;
    const rect = elements.mirrorStage.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const now = Date.now();

    canvasContext.clearRect(0, 0, width, height);
    drawGridInterference(width, height, now);

    state.scanSweep = (state.scanSweep + 0.85) % Math.max(height, 1);
    canvasContext.save();
    canvasContext.globalAlpha = 0.18;
    const sweepGradient = canvasContext.createLinearGradient(0, state.scanSweep - 28, 0, state.scanSweep + 28);
    sweepGradient.addColorStop(0, 'rgba(139, 255, 220, 0)');
    sweepGradient.addColorStop(0.5, 'rgba(139, 255, 220, 0.38)');
    sweepGradient.addColorStop(1, 'rgba(139, 255, 220, 0)');
    canvasContext.fillStyle = sweepGradient;
    canvasContext.fillRect(0, state.scanSweep - 28, width, 56);
    canvasContext.restore();

    state.heatBlooms = state.heatBlooms.filter((bloom) => now - bloom.createdAt < bloom.life);
    for (const bloom of state.heatBlooms) {
      const age = (now - bloom.createdAt) / bloom.life;
      const radius = bloom.radius + age * 58;
      const gradient = canvasContext.createRadialGradient(bloom.x, bloom.y, 0, bloom.x, bloom.y, radius);
      gradient.addColorStop(0, `rgba(139, 255, 220, ${0.18 * (1 - age) * bloom.intensity})`);
      gradient.addColorStop(0.52, `rgba(255, 77, 109, ${0.055 * (1 - age) * bloom.intensity})`);
      gradient.addColorStop(1, 'rgba(139, 255, 220, 0)');
      canvasContext.fillStyle = gradient;
      canvasContext.beginPath();
      canvasContext.arc(bloom.x, bloom.y, radius, 0, Math.PI * 2);
      canvasContext.fill();
    }

    state.visualSamples = state.visualSamples.filter((sample) => now - sample.createdAt < sample.life);
    if (state.visualSamples.length > 1) {
      canvasContext.save();
      canvasContext.lineWidth = 1;
      for (let i = 1; i < state.visualSamples.length; i += 1) {
        const previous = state.visualSamples[i - 1];
        const current = state.visualSamples[i];
        const distance = Math.hypot(current.x - previous.x, current.y - previous.y);
        if (distance > 95) continue;
        const age = (now - current.createdAt) / current.life;
        canvasContext.strokeStyle = `rgba(139, 255, 220, ${Math.max(0, 0.24 * (1 - age))})`;
        canvasContext.beginPath();
        canvasContext.moveTo(previous.x, previous.y);
        canvasContext.lineTo(current.x, current.y);
        canvasContext.stroke();
      }
      canvasContext.restore();
    }

    for (const sample of state.visualSamples) {
      const age = (now - sample.createdAt) / sample.life;
      const alpha = Math.max(0, 1 - age);
      const radius = sample.kind === 'click' ? 4.8 : sample.kind === 'typing' ? 3.6 : 2.4 + Math.min(3, sample.speed * 2);
      canvasContext.beginPath();
      canvasContext.fillStyle = sample.kind === 'click'
        ? `rgba(255, 77, 109, ${0.62 * alpha})`
        : `rgba(216, 255, 245, ${0.42 * alpha})`;
      canvasContext.arc(sample.x, sample.y, radius, 0, Math.PI * 2);
      canvasContext.fill();
    }

    state.clickRipples = state.clickRipples.filter((ripple) => now - ripple.createdAt < ripple.life);
    for (const ripple of state.clickRipples) {
      const age = (now - ripple.createdAt) / ripple.life;
      canvasContext.save();
      canvasContext.globalAlpha = Math.max(0, 0.75 * (1 - age));
      canvasContext.strokeStyle = 'rgba(255, 77, 109, 0.86)';
      canvasContext.lineWidth = 1.5;
      canvasContext.beginPath();
      canvasContext.arc(ripple.x, ripple.y, 8 + age * 70, 0, Math.PI * 2);
      canvasContext.stroke();
      canvasContext.restore();
    }

    state.idleRings = state.idleRings.filter((ring) => now - ring.createdAt < ring.life);
    for (const ring of state.idleRings) {
      const age = (now - ring.createdAt) / ring.life;
      canvasContext.save();
      canvasContext.globalAlpha = Math.max(0, 0.28 * (1 - age));
      canvasContext.strokeStyle = 'rgba(255, 230, 109, 0.9)';
      canvasContext.setLineDash([4, 8]);
      canvasContext.lineWidth = 1;
      canvasContext.beginPath();
      canvasContext.arc(ring.x, ring.y, 40 + age * 160, 0, Math.PI * 2);
      canvasContext.stroke();
      canvasContext.restore();
    }

    requestAnimationFrame(drawBehaviorLayer);
  }

  function safeSet(element, value) {
    if (element) element.textContent = value;
  }

  function formatTime() {
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    return `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  }

  function pickMessage(poolName) {
    const pool = messagePools[poolName] || ['Signal received.'];
    const unseen = pool.filter((message) => !state.messagesShown.has(message));
    const source = unseen.length ? unseen : pool;
    const message = source[Math.floor(Math.random() * source.length)];
    state.messagesShown.add(message);
    return message;
  }

  function addLog(message, tone = 'normal') {
    if (!elements.logList) return;
    const item = document.createElement('li');
    item.className = tone === 'alert' ? 'log-alert' : tone === 'profile' ? 'log-profile' : tone === 'attention' ? 'log-attention' : '';
    item.innerHTML = `<span>[${formatTime()}]</span> ${message}`;
    elements.logList.prepend(item);
    while (elements.logList.children.length > 14) {
      elements.logList.removeChild(elements.logList.lastElementChild);
    }
  }

  function updateMirrorMessage(title, message, alert = false) {
    safeSet(elements.mirrorTitle, title);
    safeSet(elements.mirrorMessage, message);
    if (elements.mirrorContent) elements.mirrorContent.classList.toggle('mirror-alert', alert);
  }

  function averageSpeed() {
    if (!state.recentSpeeds.length) return 0;
    return state.recentSpeeds.reduce((sum, speed) => sum + speed, 0) / state.recentSpeeds.length;
  }

  function maxRegionHits() {
    return Math.max(0, ...state.repeatedRegionHits.values());
  }

  function elapsedSeconds() {
    return Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
  }

  function calculatePredictability() {
    const movementScore = Math.min(24, state.mouseMoves / 10);
    const clickScore = Math.min(18, state.clicks * 3.5);
    const timeScore = Math.min(18, elapsedSeconds() / 2.3);
    const scrollScore = Math.min(14, state.maxScrollPercent / 7);
    const typingScore = Math.min(12, state.keyStrokes / 2.2);
    const repetitionScore = Math.min(8, maxRegionHits() * 2);
    const idleScore = Math.min(5, state.longestIdleSeconds / 2);
    const attentionScore = state.webcamEnabled ? Math.min(12, (state.lookingAtScreenSeconds + state.lookingAwaySeconds) / 1.8) : 0;
    state.profileConfidence = Math.min(99, Math.round(movementScore + clickScore + timeScore + scrollScore + typingScore + repetitionScore + idleScore + attentionScore));
    return state.profileConfidence;
  }

  function getAttentionLabel() {
    if (state.idleSeconds >= 7) return 'Paused';
    if (state.keyStrokes > 0 && state.mouseMoves > 40) return 'Divided';
    if (state.keyStrokes > 0) return 'Focused';
    if (state.mouseMoves > 15) return 'Active';
    return 'Unmeasured';
  }

  function getClickConfidenceLabel() {
    if (state.clicks === 0) return 'Pending';
    if (maxRegionHits() >= 3) return 'Looping';
    if (state.clicks >= 6) return 'Unstable';
    if (state.idleSeconds >= 3) return 'Delayed';
    return 'Measured';
  }

  function getNoiseLabel() {
    const speed = averageSpeed();
    if (speed > 1.3) return 'High';
    if (speed > 0.55) return 'Moderate';
    if (state.mouseMoves > 5) return 'Low';
    return 'Unknown';
  }

  function evaluateProfile() {
    calculatePredictability();
    return classificationRules.find((rule) => rule.match());
  }

  function updateProfile() {
    const predictability = calculatePredictability();
    const profile = evaluateProfile();

    safeSet(elements.attentionValue, getAttentionLabel());
    safeSet(elements.clickConfidenceValue, getClickConfidenceLabel());
    safeSet(elements.predictabilityValue, `${predictability}%`);
    safeSet(elements.noiseValue, getNoiseLabel());
    safeSet(elements.idleValue, state.idleSeconds >= 3 ? `${state.idleSeconds}s` : 'None');
    safeSet(elements.scrollValue, `${state.maxScrollPercent}%`);
    safeSet(elements.dominantPatternValue, profile.pattern);
    safeSet(elements.assignedLabelValue, profile.label);
    safeSet(elements.misreadRiskValue, profile.risk);
    updateTraceDiagnostics();
    updateAttentionMetrics();
    safeSet(elements.classificationValue, profile.label);
    safeSet(elements.classificationCaption, profile.caption);

    if (predictability > 78) {
      safeSet(elements.reflectionType, 'Predictive');
      safeSet(elements.profileCaption, 'The mirror now trusts the profile more than the person.');
    } else if (predictability > 44) {
      safeSet(elements.reflectionType, 'Behavioral');
      safeSet(elements.profileCaption, 'Small traces are being assembled into a data identity.');
    } else {
      safeSet(elements.reflectionType, 'Algorithmic');
      safeSet(elements.profileCaption, 'Waiting for behavior to become data.');
    }

    if (profile.label !== state.currentClassification) {
      const previous = state.currentClassification;
      state.currentClassification = profile.label;
      state.profileHistory.push({ at: formatTime(), from: previous, to: profile.label });
      if (Date.now() - state.lastProfileShiftAt > 2200 && previous !== 'Awaiting Behavior') {
        state.lastProfileShiftAt = Date.now();
        addLog(`${pickMessage('profileShift')} New label: ${profile.label}.`, 'profile');
        updateMirrorMessage('PROFILE REWRITTEN', profile.message, true);
      }
    }
  }

  function createTracePoint(x, y, speed = 0) {
    if (!elements.traceLayer || !elements.mirrorStage) return;
    const rect = elements.mirrorStage.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;
    if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) return;

    const point = document.createElement('span');
    point.className = speed > 1.2 ? 'trace-point trace-fast' : 'trace-point';
    point.style.left = `${localX}px`;
    point.style.top = `${localY}px`;
    elements.traceLayer.appendChild(point);
    state.traceCount += 1;
    addVisualSample(x, y, speed, speed > 1.6 ? 'fast' : 'move');

    if (state.traceCount % 16 === 0) {
      const label = document.createElement('span');
      label.className = 'trace-label';
      label.style.left = `${Math.max(10, Math.min(localX + 10, rect.width - 190))}px`;
      label.style.top = `${Math.max(10, Math.min(localY - 10, rect.height - 34))}px`;
      label.textContent = speed > 1.2 ? 'misread as urgency' : 'trace becomes identity';
      elements.traceLayer.appendChild(label);
      setTimeout(() => label.remove(), 2500);
    }
    setTimeout(() => point.remove(), 4400);
  }

  function updateCoordinates(x, y) {
    if (!elements.coordinateReadout || !elements.mirrorStage) return;
    const rect = elements.mirrorStage.getBoundingClientRect();
    elements.coordinateReadout.textContent = `x: ${Math.round(x - rect.left)} / y: ${Math.round(y - rect.top)}`;
  }

  function recordInteraction() {
    state.lastInteractionAt = Date.now();
    state.idleSeconds = 0;
    updateProfile();
  }

  function handleMovement(event) {
    state.mouseMoves += 1;
    const now = Date.now();
    const current = { x: event.clientX, y: event.clientY, time: now };
    let speed = 0;

    if (state.lastMousePosition) {
      const dx = current.x - state.lastMousePosition.x;
      const dy = current.y - state.lastMousePosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const deltaTime = Math.max(16, current.time - state.lastMousePosition.time);
      speed = distance / deltaTime;
      state.recentSpeeds.push(speed);
      if (state.recentSpeeds.length > 24) state.recentSpeeds.shift();
    }

    state.lastMousePosition = current;
    recordInteraction();
    updateCoordinates(event.clientX, event.clientY);
    if (state.mouseMoves % 5 === 0) createTracePoint(event.clientX, event.clientY, speed);

    if (state.mouseMoves === 1) {
      addLog('Cursor movement detected. Calibration has begun.');
      updateMirrorMessage('REFLECTION ACTIVE', 'Your movement is now being translated into a profile.');
    } else if (speed > 1.55 && state.mouseMoves % 12 === 0) {
      addLog(pickMessage('fastMovement'), 'alert');
      updateMirrorMessage('MOVEMENT MISREAD', 'The mirror assigns urgency to speed.', true);
    } else if (state.mouseMoves % 45 === 0) {
      addLog(pickMessage('movement'));
    }
  }

  function handleClick(event) {
    const now = Date.now();
    const timeSinceLastClick = now - state.lastClickAt;
    state.clicks += 1;
    state.lastClickAt = now;
    recordInteraction();
    createTracePoint(event.clientX, event.clientY, 2);
    addVisualSample(event.clientX, event.clientY, 2, 'click');

    const regionKey = `${Math.floor(event.clientX / 160)}:${Math.floor(event.clientY / 160)}`;
    const regionHits = (state.repeatedRegionHits.get(regionKey) || 0) + 1;
    state.repeatedRegionHits.set(regionKey, regionHits);
    updateProfile();

    if (timeSinceLastClick < 850 || regionHits >= 3) {
      addLog(pickMessage('repeatedClick'), 'alert');
      updateMirrorMessage('DECISION LOOP DETECTED', 'The system sees repetition and calls it personality.', true);
    } else {
      addLog(pickMessage('click'));
      updateMirrorMessage('DECISION POINT RECORDED', 'A single click has become part of your data identity.');
    }
  }

  function handleScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable <= 0 ? 0 : Math.round((window.scrollY / scrollable) * 100);
    if (percent > state.maxScrollPercent) {
      state.maxScrollPercent = Math.min(100, percent);
      recordInteraction();
      if (elements.mirrorStage) {
        const rect = elements.mirrorStage.getBoundingClientRect();
        addVisualSample(rect.left + rect.width * 0.5, rect.top + rect.height * Math.min(0.88, 0.18 + state.maxScrollPercent / 125), 0.7, 'scroll');
      }
      if (state.maxScrollPercent % 20 < 4 || state.maxScrollPercent > 90) {
        addLog(pickMessage('scroll'));
      }
    }
  }

  function handleTyping() {
    const now = Date.now();
    const typingGap = state.lastTypingAt ? now - state.lastTypingAt : 0;
    state.keyStrokes += 1;
    state.lastTypingAt = now;
    recordInteraction();

    if (elements.mirrorStage) {
      const rect = elements.mirrorStage.getBoundingClientRect();
      const jitterX = Math.sin(state.keyStrokes * 1.7) * rect.width * 0.18;
      const jitterY = Math.cos(state.keyStrokes * 1.1) * rect.height * 0.12;
      addVisualSample(rect.left + rect.width / 2 + jitterX, rect.top + rect.height / 2 + jitterY, 0.35, 'typing');
    }

    if (typingGap > 1400 && state.keyStrokes > 1) {
      addLog('Typing pause recorded. The system treats rhythm as intention.', 'alert');
    }
    if (state.keyStrokes === 1 || state.keyStrokes % 8 === 0) {
      addLog(pickMessage('typing'));
      updateMirrorMessage('INPUT SIGNAL DETECTED', 'The mirror watches rhythm, not meaning.');
    }
  }


  function resizeWebcamOverlay() {
    if (!elements.webcamOverlay || !elements.webcamVideo) return;
    const rect = elements.webcamOverlay.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    elements.webcamOverlay.width = Math.max(1, Math.floor(rect.width * pixelRatio));
    elements.webcamOverlay.height = Math.max(1, Math.floor(rect.height * pixelRatio));
    const ctx = elements.webcamOverlay.getContext('2d');
    if (ctx) ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function updateAttentionMetrics() {
    safeSet(elements.webcamAttentionValue, state.attentionState);
    safeSet(elements.webcamAttentionStateValue, state.attentionState);
    safeSet(elements.screenFacingTimeValue, `${state.lookingAtScreenSeconds}s`);
    safeSet(elements.awayTimeValue, `${state.lookingAwaySeconds}s`);
  }

  function setAttentionState(nextState, signal = '') {
    const now = Date.now();
    const elapsed = Math.max(0, Math.round((now - state.lastAttentionTickAt) / 1000));
    if (state.webcamEnabled && elapsed > 0) {
      if (state.attentionState === 'Screen-facing') state.lookingAtScreenSeconds += elapsed;
      if (state.attentionState === 'Looking away' || state.attentionState === 'Face absent') state.lookingAwaySeconds += elapsed;
    }
    state.lastAttentionTickAt = now;
    state.attentionState = nextState;
    safeSet(elements.webcamSignalValue, signal || nextState);
    updateAttentionMetrics();

    if (nextState !== state.lastAttentionState) {
      state.lastAttentionState = nextState;
      if (state.webcamEnabled) {
        addLog(`${pickMessage('attention')} Current webcam attention proxy: ${nextState}.`, 'attention');
        updateMirrorMessage('ATTENTION SIGNAL UPDATED', `The mirror now classifies your camera signal as: ${nextState}.`, nextState !== 'Screen-facing');
      }
    }
  }

  function drawWebcamOverlay(face = null, label = 'No face signal') {
    if (!elements.webcamOverlay) return;
    const ctx = elements.webcamOverlay.getContext('2d');
    if (!ctx) return;
    const rect = elements.webcamOverlay.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();
    ctx.strokeStyle = 'rgba(139, 255, 220, 0.34)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.strokeRect(rect.width * 0.28, rect.height * 0.18, rect.width * 0.44, rect.height * 0.64);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(216, 255, 245, 0.72)';
    ctx.font = '10px monospace';
    ctx.fillText(label, 10, 18);
    if (face) {
      const { x, y, width, height } = face;
      ctx.strokeStyle = 'rgba(255, 230, 109, 0.88)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 230, 109, 0.88)';
      ctx.fill();
    }
    ctx.restore();
  }

  function normalizeDetectedFace(face, videoWidth, videoHeight, overlayWidth, overlayHeight) {
    const box = face?.boundingBox;
    if (!box) return null;
    // Video is mirrored with CSS, so mirror the detector box for the overlay.
    const scaleX = overlayWidth / videoWidth;
    const scaleY = overlayHeight / videoHeight;
    const width = box.width * scaleX;
    const height = box.height * scaleY;
    const x = overlayWidth - ((box.x * scaleX) + width);
    const y = box.y * scaleY;
    return { x, y, width, height };
  }

  function classifyFaceAttention(faceBox, overlayWidth, overlayHeight) {
    if (!faceBox) return { state: 'Face absent', signal: 'No face detected' };
    const centerX = faceBox.x + faceBox.width / 2;
    const centerY = faceBox.y + faceBox.height / 2;
    const centeredX = centerX > overlayWidth * 0.28 && centerX < overlayWidth * 0.72;
    const centeredY = centerY > overlayHeight * 0.14 && centerY < overlayHeight * 0.86;
    const faceArea = faceBox.width * faceBox.height;
    const frameArea = Math.max(1, overlayWidth * overlayHeight);
    const areaRatio = faceArea / frameArea;
    if (centeredX && centeredY && areaRatio > 0.035) {
      return { state: 'Screen-facing', signal: 'Face centered in frame' };
    }
    return { state: 'Looking away', signal: 'Face off-center or partially absent' };
  }

  async function sampleWebcamAttention() {
    if (!state.webcamEnabled || !elements.webcamVideo || !elements.webcamOverlay) return;
    const overlayRect = elements.webcamOverlay.getBoundingClientRect();
    const ctx = elements.webcamOverlay.getContext('2d');

    if (document.hidden) {
      setAttentionState('Looking away', 'Tab hidden');
      drawWebcamOverlay(null, 'Tab hidden');
      return;
    }

    if (!state.faceDetectionSupported || !state.faceDetector) {
      // Honest fallback: without native face detection, the artwork cannot infer gaze locally.
      setAttentionState('Camera active', 'FaceDetector unavailable');
      drawWebcamOverlay(null, 'Detection unavailable');
      return;
    }

    try {
      const faces = await state.faceDetector.detect(elements.webcamVideo);
      const detected = faces[0] || null;
      const faceBox = normalizeDetectedFace(
        detected,
        elements.webcamVideo.videoWidth || 320,
        elements.webcamVideo.videoHeight || 240,
        overlayRect.width,
        overlayRect.height
      );
      const result = classifyFaceAttention(faceBox, overlayRect.width, overlayRect.height);
      setAttentionState(result.state, result.signal);
      drawWebcamOverlay(faceBox, result.signal);
      if (faceBox && elements.mirrorStage) {
        const rect = elements.mirrorStage.getBoundingClientRect();
        addVisualSample(rect.left + rect.width * 0.5, rect.top + rect.height * 0.18, 0.45, 'webcam');
      }
    } catch (error) {
      setAttentionState('Camera active', 'Detection paused');
      if (ctx) ctx.clearRect(0, 0, overlayRect.width, overlayRect.height);
    }
  }

  async function enableWebcamAttention() {
    if (!navigator.mediaDevices?.getUserMedia) {
      safeSet(elements.webcamStatusValue, 'Unsupported Browser');
      safeSet(elements.webcamSignalValue, 'getUserMedia unavailable');
      addLog('Camera attention unavailable in this browser.', 'alert');
      return;
    }

    try {
      if (elements.webcamButton) {
        elements.webcamButton.disabled = true;
        elements.webcamButton.textContent = 'Requesting...';
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false });
      state.webcamStream = stream;
      state.webcamEnabled = true;
      state.lastAttentionTickAt = Date.now();
      if (elements.webcamVideo) {
        elements.webcamVideo.srcObject = stream;
        await elements.webcamVideo.play();
        elements.webcamVideo.classList.add('webcam-active');
      }
      elements.webcamPlaceholder?.classList.add('hidden');
      safeSet(elements.webcamStatusValue, 'Camera Active');
      if ('FaceDetector' in window) {
        state.faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        state.faceDetectionSupported = true;
        setAttentionState('Calibrating', 'Native FaceDetector available');
      } else {
        state.faceDetectionSupported = false;
        setAttentionState('Camera active', 'FaceDetector unavailable');
      }
      if (elements.webcamButton) elements.webcamButton.textContent = 'Camera Active';
      resizeWebcamOverlay();
      addLog('Opt-in webcam attention layer enabled. Video remains local to the browser.', 'attention');
      updateMirrorMessage('WEBCAM LAYER ACTIVE', 'The mirror adds face presence and screen-facing position as another unstable signal.', true);
      updateProfile();
    } catch (error) {
      state.webcamEnabled = false;
      safeSet(elements.webcamStatusValue, 'Permission Denied');
      safeSet(elements.webcamSignalValue, 'Camera not available');
      if (elements.webcamButton) {
        elements.webcamButton.disabled = false;
        elements.webcamButton.textContent = 'Enable Camera';
      }
      addLog('Camera permission was not granted. The mirror continues without webcam attention.', 'alert');
    }
  }

  function startCalibration() {
    if (elements.statusPill) {
      elements.statusPill.innerHTML = '<span class="status-dot status-dot-active"></span> Monitoring Interface: Active';
    }
    if (elements.calibrationButton) {
      elements.calibrationButton.textContent = 'Calibration Active';
      elements.calibrationButton.disabled = true;
    }
    safeSet(elements.profileSeed, `Profile Seed: ${Math.floor(Math.random() * 9000 + 1000)}-C`);
    addLog('Calibration started. Ordinary behavior will now be interpreted.');
    addLog('Trace renderer active. Movement and camera attention will leave visible residue.', 'profile');
    updateMirrorMessage('CALIBRATION ACTIVE', 'Move, click, pause, scroll, type, or enable the webcam. The system will overread everything.');
    updateProfile();
  }

  function idleCheck() {
    const secondsIdle = Math.floor((Date.now() - state.lastInteractionAt) / 1000);
    if (secondsIdle !== state.idleSeconds) {
      state.idleSeconds = secondsIdle;
      state.longestIdleSeconds = Math.max(state.longestIdleSeconds, secondsIdle);
      updateProfile();
    }
    if (secondsIdle > 0 && secondsIdle % 5 === 0 && Date.now() - state.lastIdleLogAt > 4200) {
      state.lastIdleLogAt = Date.now();
      addLog(pickMessage('hesitation'), 'alert');
      addIdleRing();
      updateMirrorMessage('HESITATION DETECTED', 'Stillness has been turned into evidence.', true);
    }
  }

  function contradictionCheck() {
    const mixedSignals = state.keyStrokes > 8 && state.maxScrollPercent > 50 && state.longestIdleSeconds > 5;
    const restlessAndIdle = averageSpeed() > 1.1 && state.longestIdleSeconds > 6;
    if ((mixedSignals || restlessAndIdle) && Date.now() - state.lastEscalationAt > 7500) {
      state.lastEscalationAt = Date.now();
      addLog(pickMessage('contradiction'), 'alert');
    }
  }

  function escalationCheck() {
    const confidence = calculatePredictability();
    if (confidence >= 25 && confidence % 25 < 3 && Date.now() - state.lastEscalationAt > 9000) {
      state.lastEscalationAt = Date.now();
      addLog(pickMessage('escalation'), confidence > 70 ? 'alert' : 'normal');
    }
    contradictionCheck();
    updateProfile();
  }

  elements.calibrationButton?.addEventListener('click', startCalibration);
  window.addEventListener('mousemove', handleMovement, { passive: true });
  window.addEventListener('click', handleClick);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', () => {
    resizeBehaviorCanvas();
    resizeWebcamOverlay();
  });
  elements.anonymousInput?.addEventListener('input', handleTyping);
  elements.webcamButton?.addEventListener('click', enableWebcamAttention);

  resizeBehaviorCanvas();
  resizeWebcamOverlay();
  drawBehaviorLayer();
  updateTraceDiagnostics();

  setInterval(idleCheck, 1000);
  setInterval(sampleWebcamAttention, 900);
  setInterval(escalationCheck, 3000);
  updateProfile();
});
