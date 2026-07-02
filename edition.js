(function () {
  const storageKey = "dim-light-sound";
  let enabled = localStorage.getItem(storageKey) === "on";
  let audioContext;

  function ensureContext() {
    if (!audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) audioContext = new Context();
    }
    if (audioContext?.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playTone(kind = "link") {
    if (!enabled) return;
    const context = ensureContext();
    if (!context) return;

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const isPage = kind === "page";
    const isEnter = kind === "enter";

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(isPage ? 165 : isEnter ? 260 : 520, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      isPage ? 105 : isEnter ? 190 : 410,
      now + (isPage ? 0.085 : 0.045),
    );
    filter.type = "lowpass";
    filter.frequency.value = isPage ? 720 : 1250;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(isPage ? 0.032 : 0.016, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isPage ? 0.1 : 0.055));

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.12);
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
      const link = event.target.closest("a, [data-sound-link]");
      if (!link || link === lastHover) return;
      lastHover = link;
      playTone("link");
    });
    document.addEventListener("pointerout", (event) => {
      if (!event.relatedTarget?.closest?.("a, [data-sound-link]")) lastHover = null;
    });
  }

  window.DimSound = { bind, play: playTone, isEnabled: () => enabled };
})();
