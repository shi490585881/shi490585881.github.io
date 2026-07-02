(function () {
  const storageKey = "dim-light-sound";
  const sources = {
    shutter: ["assets/sound/interaction-shutter.mp3"],
    film: ["assets/sound/photo-change.mp3"],
  };
  const volumes = { shutter: 1, film: 1 };
  const pools = { shutter: [], film: [] };
  const positions = { shutter: 0, film: 0 };
  let enabled = localStorage.getItem(storageKey) === "on";
  let unlocked = false;
  let lastHover;
  let lastSoundAt = 0;

  function makePool(kind) {
    if (pools[kind].length) return pools[kind];
    for (let index = 0; index < 6; index += 1) {
      const audio = new Audio(sources[kind][index % sources[kind].length]);
      audio.preload = "auto";
      audio.volume = volumes[kind];
      audio.load();
      pools[kind].push(audio);
    }
    return pools[kind];
  }

  function playSample(kind, force = false) {
    if (!enabled && !force) return;
    const pool = makePool(kind);
    const audio = pool[positions[kind] % pool.length];
    positions[kind] += 1;

    audio.pause();
    audio.currentTime = 0;
    audio.volume = volumes[kind];
    audio.playbackRate = 1;
    const playback = audio.play();
    if (playback) {
      playback
        .then(() => {
          unlocked = true;
        })
        .catch(() => {
          unlocked = false;
        });
    }
  }

  function play(kind = "link") {
    playSample(kind === "page" || kind === "film" ? "film" : "shutter");
  }

  function updateButtons() {
    document.querySelectorAll("[data-sound-toggle]").forEach((button) => {
      button.textContent = enabled ? "Sound on" : "Sound off";
      button.setAttribute("aria-pressed", String(enabled));
      button.setAttribute(
        "aria-label",
        enabled ? "关闭相机机械声音" : "开启相机机械声音",
      );
    });
  }

  function toggleSound() {
    enabled = !enabled;
    localStorage.setItem(storageKey, enabled ? "on" : "off");
    updateButtons();
    if (enabled) playSample("shutter", true);
  }

  function bind() {
    makePool("shutter");
    makePool("film");
    updateButtons();

    document.querySelectorAll("[data-sound-toggle]").forEach((button) => {
      button.addEventListener("click", toggleSound);
    });

    document.addEventListener("pointerover", (event) => {
      const target = event.target.closest("a, button, [data-sound-link]");
      const now = window.performance.now();
      if (
        event.pointerType === "touch" ||
        !target ||
        target.matches(".viewer-zone, [data-sound-toggle]") ||
        target === lastHover ||
        now - lastSoundAt < 115
      ) {
        return;
      }
      lastHover = target;
      lastSoundAt = now;
      playSample("shutter");
    });

    document.addEventListener("pointerout", (event) => {
      const next = event.relatedTarget?.closest?.("a, button, [data-sound-link]");
      if (next !== lastHover) lastHover = null;
    });
  }

  window.DimSound = {
    bind,
    play,
    isEnabled: () => enabled,
    isUnlocked: () => unlocked,
  };
})();
