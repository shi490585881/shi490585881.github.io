(function () {
  const storageKey = "dim-light-sound";
  let enabled = localStorage.getItem(storageKey) === "on";
  let audioContext;
  let noiseBuffer;
  let lastSoundAt = 0;

  function ensureContext() {
    if (!audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) audioContext = new Context();
    }
    if (audioContext?.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function getNoiseBuffer(context) {
    if (noiseBuffer) return noiseBuffer;
    noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.3), context.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  function noiseBurst(context, at, duration, frequency, volume, resonance = 1.4) {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = getNoiseBuffer(context);
    source.playbackRate.value = 0.94 + Math.random() * 0.12;
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = resonance;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(at, Math.random() * 0.08, duration + 0.01);
  }

  function metalClick(context, at, frequency, duration, volume) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, at);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.46, at + duration);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.01);
  }

  function playShutter(context) {
    const at = context.currentTime + 0.004;
    const variance = 0.94 + Math.random() * 0.12;

    noiseBurst(context, at, 0.018, 3300 * variance, 0.026, 2.4);
    metalClick(context, at, 1180 * variance, 0.02, 0.014);
    noiseBurst(context, at + 0.034, 0.028, 1750 * variance, 0.038, 1.7);
    metalClick(context, at + 0.034, 540 * variance, 0.04, 0.019);
    noiseBurst(context, at + 0.071, 0.017, 2700 * variance, 0.014, 2.1);
  }

  function playFilmAdvance(context) {
    const at = context.currentTime + 0.004;
    const variance = 0.95 + Math.random() * 0.1;

    noiseBurst(context, at, 0.135, 720 * variance, 0.012, 0.7);
    for (let index = 0; index < 6; index += 1) {
      const tickAt = at + index * 0.019;
      noiseBurst(
        context,
        tickAt,
        0.011,
        (2450 - index * 120) * variance,
        0.019 + (index % 2) * 0.005,
        2.6,
      );
      metalClick(context, tickAt, (760 + index * 42) * variance, 0.012, 0.006);
    }
    noiseBurst(context, at + 0.124, 0.022, 1900 * variance, 0.031, 2.1);
    metalClick(context, at + 0.124, 430 * variance, 0.032, 0.015);
  }

  function playTone(kind = "link") {
    if (!enabled) return;
    const context = ensureContext();
    if (!context) return;

    if (kind === "page") playFilmAdvance(context);
    else playShutter(context);
  }

  function updateButtons() {
    document.querySelectorAll("[data-sound-toggle]").forEach((button) => {
      button.textContent = enabled ? "Sound on" : "Sound off";
      button.setAttribute("aria-pressed", String(enabled));
    });
  }

  function toggleSound() {
    enabled = !enabled;
    localStorage.setItem(storageKey, enabled ? "on" : "off");
    if (enabled) {
      ensureContext();
      window.setTimeout(() => playTone("enter"), 20);
    }
    updateButtons();
  }

  function bind() {
    updateButtons();
    document.querySelectorAll("[data-sound-toggle]").forEach((button) => {
      button.addEventListener("click", toggleSound);
    });

    let lastHover;
    document.addEventListener("pointerover", (event) => {
      const link = event.target.closest("a, button, [data-sound-link]");
      const now = window.performance.now();
      if (
        event.pointerType === "touch" ||
        !link ||
        link.matches(".viewer-zone") ||
        link === lastHover ||
        now - lastSoundAt < 130
      ) {
        return;
      }
      lastHover = link;
      lastSoundAt = now;
      playTone("link");
    });
    document.addEventListener("pointerout", (event) => {
      const next = event.relatedTarget?.closest?.("a, button, [data-sound-link]");
      if (next !== lastHover) lastHover = null;
    });
  }

  window.DimSound = { bind, play: playTone, isEnabled: () => enabled };
})();
