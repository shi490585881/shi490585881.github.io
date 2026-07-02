document.addEventListener("DOMContentLoaded", () => {
  const store = window.DIM_LIGHT_PROJECTS;
  const parameters = new URLSearchParams(window.location.search);
  const requestedId = parameters.get("id");
  const projectId = store.items[requestedId] ? requestedId : store.order[0];
  const project = store.items[projectId];
  let activeIndex = Math.max(
    0,
    Math.min(project.count - 1, Number(parameters.get("image") || 1) - 1),
  );

  document.title = `${project.title} / DIM LIGHT`;
  document.body.className = "photo-viewer";
  document.body.innerHTML = `
    <header class="viewer-header">
      <a class="viewer-brand" href="index.html">
        <span>DIM LIGHT</span><small>微明</small>
      </a>
      <p><a href="index.html#portfolio">portfolio</a> / ${project.english}</p>
    </header>

    <main class="viewer-main">
      <figure class="viewer-figure">
        <img alt="" />
      </figure>
      <button class="viewer-zone viewer-zone--previous" type="button" aria-label="上一张"></button>
      <button class="viewer-zone viewer-zone--next" type="button" aria-label="下一张"></button>
      <div class="viewer-cursor" aria-hidden="true">›</div>
    </main>

    <footer class="viewer-footer">
      <div class="viewer-title">
        <strong>${project.title}</strong>
        <span>${project.english}</span>
      </div>
      <p class="viewer-count" aria-live="polite"></p>
      <div class="viewer-actions">
        <button type="button" data-info-toggle aria-expanded="false">Info</button>
        <button type="button" data-fullscreen>Fullscreen</button>
        <button type="button" data-sound-toggle aria-pressed="false">Sound off</button>
      </div>
    </footer>

    <aside class="viewer-info" aria-hidden="true">
      <button type="button" data-info-close aria-label="关闭作品说明">Close</button>
      <div>
        <p>${project.number} / ${project.year}</p>
        <h1>${project.title}</h1>
        <p class="viewer-info-en">${project.english}</p>
        <p>${project.description}</p>
        <p>${project.place} · ${String(project.count).padStart(2, "0")} images</p>
      </div>
    </aside>
  `;

  const image = document.querySelector(".viewer-figure img");
  const count = document.querySelector(".viewer-count");
  const cursor = document.querySelector(".viewer-cursor");
  const main = document.querySelector(".viewer-main");
  const info = document.querySelector(".viewer-info");
  const infoToggle = document.querySelector("[data-info-toggle]");

  function sourceAt(index) {
    return `assets/projects/${projectId}/${String(index + 1).padStart(2, "0")}.webp`;
  }

  function preload(index) {
    const preloaded = new Image();
    preloaded.src = sourceAt((index + project.count) % project.count);
  }

  function show(index, direction = "next") {
    activeIndex = (index + project.count) % project.count;
    image.classList.remove("is-ready");
    image.dataset.direction = direction;
    image.src = sourceAt(activeIndex);
    image.alt = `${project.title}，第 ${activeIndex + 1} 张`;
    count.textContent =
      `${String(activeIndex + 1).padStart(2, "0")} / ${String(project.count).padStart(2, "0")}`;

    const url = new URL(window.location.href);
    url.searchParams.set("id", projectId);
    url.searchParams.set("image", String(activeIndex + 1).padStart(2, "0"));
    history.replaceState(null, "", url);

    const reveal = () => image.classList.add("is-ready");
    if (image.complete) image.decode().then(reveal).catch(reveal);
    else image.addEventListener("load", reveal, { once: true });

    preload(activeIndex + 1);
    preload(activeIndex - 1);
  }

  function previous() {
    window.DimSound.play("page");
    show(activeIndex - 1, "previous");
  }

  function next() {
    window.DimSound.play("page");
    show(activeIndex + 1, "next");
  }

  document.querySelector(".viewer-zone--previous").addEventListener("click", previous);
  document.querySelector(".viewer-zone--next").addEventListener("click", next);

  main.addEventListener("pointermove", (event) => {
    cursor.classList.add("is-visible");
    cursor.textContent = event.clientX < window.innerWidth / 2 ? "‹" : "›";
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  });
  main.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));

  function setInfo(open) {
    info.classList.toggle("is-open", open);
    info.setAttribute("aria-hidden", String(!open));
    infoToggle.setAttribute("aria-expanded", String(open));
  }

  infoToggle.addEventListener("click", () => setInfo(!info.classList.contains("is-open")));
  document.querySelector("[data-info-close]").addEventListener("click", () => setInfo(false));

  document.querySelector("[data-fullscreen]").addEventListener("click", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") previous();
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      next();
    }
    if (event.key === "Escape" && info.classList.contains("is-open")) setInfo(false);
  });

  window.DimSound.bind();
  show(activeIndex);
});
