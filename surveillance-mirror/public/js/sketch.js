// The Surveillance Mirror — Phase 3
// Fake profiling engine for an interactive net art prototype.
// No names, emails, faces, or real identities are collected.

/*
  Phase 3 builds on Phase 2 by adding a visible fake profiling engine.
  The engine intentionally over-interprets small browser interactions.
  This is the critical point of the artwork: the profile sounds confident,
  but it is based on shallow, unstable behavioral signals.
*/

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    statusPill: document.querySelector('#status-pill'),
    calibrationButton: document.querySelector('#calibration-button'),
    mirrorStage: document.querySelector('#mirror-stage'),
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
    classificationValue: document.querySelector('#classification-value'),
    classificationCaption: document.querySelector('#classification-caption'),
    anonymousInput: document.querySelector('#anonymous-input')
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
    item.className = tone === 'alert' ? 'log-alert' : tone === 'profile' ? 'log-profile' : '';
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
    state.profileConfidence = Math.min(99, Math.round(movementScore + clickScore + timeScore + scrollScore + typingScore + repetitionScore + idleScore));
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

    if (typingGap > 1400 && state.keyStrokes > 1) {
      addLog('Typing pause recorded. The system treats rhythm as intention.', 'alert');
    }
    if (state.keyStrokes === 1 || state.keyStrokes % 8 === 0) {
      addLog(pickMessage('typing'));
      updateMirrorMessage('INPUT SIGNAL DETECTED', 'The mirror watches rhythm, not meaning.');
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
    addLog('Phase 3 profiling engine active. Labels may be wrong but will sound certain.', 'profile');
    updateMirrorMessage('CALIBRATION ACTIVE', 'Move, click, pause, scroll, or type. The system will overread everything.');
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
  elements.anonymousInput?.addEventListener('input', handleTyping);

  setInterval(idleCheck, 1000);
  setInterval(escalationCheck, 3000);
  updateProfile();
});
