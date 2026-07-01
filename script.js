const menuButton = document.querySelector(".menu-button");
const menuPanel = document.querySelector(".menu-panel");
const menuLinks = document.querySelectorAll(".menu-nav a");
const soundButtons = document.querySelectorAll(".sound-toggle");
const projectRows = document.querySelectorAll(".project-row");
const previewImages = document.querySelectorAll(".preview-image");
const previewCaption = document.querySelector(".project-preview figcaption");

let soundEnabled = false;
let audioContext = null;
let activePreview = 0;
let previewSequence = 0;
let lastToneAt = 0;

function setMenu(open) {
  if (!menuButton || !menuPanel) return;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  menuPanel.setAttribute("aria-hidden", String(!open));
  menuPanel.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  playTone(open ? 520 : 440, 0.045);
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playTone(frequency = 480, duration = 0.035) {
  if (!soundEnabled) return;
  const now = Date.now();
  if (now - lastToneAt < 90) return;
  lastToneAt = now;

  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") context.resume();

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime;
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.018, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.01);
}

function setSound(enabled) {
  soundEnabled = enabled;
  soundButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(enabled));
    button.textContent = enabled ? "Sound ●" : "Sound ○";
  });
  if (enabled) {
    getAudioContext();
    playTone(620, 0.055);
  }
}

function setPreview(row) {
  if (!previewImages.length || !previewCaption || row.classList.contains("is-current")) return;

  const sequence = ++previewSequence;
  const incomingIndex = activePreview === 0 ? 1 : 0;
  const incoming = previewImages[incomingIndex];
  const outgoing = previewImages[activePreview];
  const source = row.dataset.preview;

  projectRows.forEach((item) => item.classList.toggle("is-current", item === row));
  incoming.src = source;
  incoming.alt = row.dataset.previewAlt;

  const revealIncoming = () => {
    if (sequence !== previewSequence) return;
    incoming.classList.add("is-visible");
    outgoing.classList.remove("is-visible");
    activePreview = incomingIndex;
    previewCaption.textContent = row.dataset.previewTitle;
  };

  if (incoming.complete) {
    revealIncoming();
  } else {
    incoming.addEventListener("load", revealIncoming, { once: true });
  }
  playTone(470 + Number(row.querySelector(":scope > span").textContent) * 18, 0.032);
}

if (menuButton) {
  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });
}

menuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
  link.addEventListener("mouseenter", () => playTone(520, 0.035));
});

soundButtons.forEach((button) => {
  button.addEventListener("click", () => setSound(!soundEnabled));
});

projectRows.forEach((row) => {
  const preload = new Image();
  preload.src = row.dataset.preview;
  row.addEventListener("mouseenter", () => setPreview(row));
  row.addEventListener("focus", () => setPreview(row));
  row.addEventListener("click", () => playTone(680, 0.05));
});

document.querySelectorAll(".index-link, .project-nav a").forEach((link) => {
  link.addEventListener("mouseenter", () => playTone(540, 0.035));
  link.addEventListener("click", () => playTone(680, 0.05));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -5% 0px", threshold: 0.04 },
  );
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
