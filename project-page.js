const projectStore = window.DIM_LIGHT_PROJECTS;
const parameters = new URLSearchParams(window.location.search);
const requestedId = parameters.get("id");
const projectId = projectStore.items[requestedId] ? requestedId : projectStore.order[0];
const project = projectStore.items[projectId];

document.title = `${project.title} — DIM LIGHT`;
document.querySelector("#project-number").textContent = `${project.number} / Photography`;
document.querySelector("#project-title").textContent = project.title;
document.querySelector("#project-en").textContent = project.english;
document.querySelector("#project-description").textContent = project.description;
document.querySelector("#project-details").textContent =
  `${project.year} · ${project.place} · ${String(project.count).padStart(2, "0")} images`;

const gallery = document.querySelector("#gallery");
const imageSources = [];

for (let number = 1; number <= project.count; number += 1) {
  const paddedNumber = String(number).padStart(2, "0");
  const source = `assets/projects/${projectId}/${paddedNumber}.webp`;
  imageSources.push(source);

  const button = document.createElement("button");
  button.className = "gallery-item reveal";
  button.type = "button";
  button.dataset.index = String(number - 1);
  button.setAttribute("aria-label", `查看${project.title}第${number}张照片`);

  const image = document.createElement("img");
  image.src = source;
  image.alt = `${project.alt}，第${number}张`;
  image.loading = number <= 2 ? "eager" : "lazy";

  const label = document.createElement("span");
  label.textContent = `${paddedNumber} / ${String(project.count).padStart(2, "0")}`;

  button.append(image, label);
  gallery.append(button);
}

const order = projectStore.order;
const currentPosition = order.indexOf(projectId);
const previousId = order[(currentPosition - 1 + order.length) % order.length];
const nextId = order[(currentPosition + 1) % order.length];
const previousProject = projectStore.items[previousId];
const nextProject = projectStore.items[nextId];

const previousLink = document.querySelector("#previous-project");
previousLink.href = `project.html?id=${previousId}`;
previousLink.innerHTML = `<span>Previous</span>${previousProject.title} ←`;

const nextLink = document.querySelector("#next-project");
nextLink.href = `project.html?id=${nextId}`;
nextLink.innerHTML = `<span>Next</span>${nextProject.title} →`;

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("figcaption");
let activeIndex = 0;

function showImage(index) {
  activeIndex = (index + imageSources.length) % imageSources.length;
  lightboxImage.src = imageSources[activeIndex];
  lightboxImage.alt = `${project.alt}，第${activeIndex + 1}张`;
  lightboxCaption.textContent =
    `${project.title} — ${String(activeIndex + 1).padStart(2, "0")} / ${String(project.count).padStart(2, "0")}`;
}

function openLightbox(index) {
  showImage(index);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
  lightbox.querySelector(".lightbox-close").focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
}

gallery.addEventListener("click", (event) => {
  const item = event.target.closest(".gallery-item");
  if (!item) return;
  openLightbox(Number(item.dataset.index));
});

lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showImage(activeIndex - 1));
lightbox.querySelector(".lightbox-next").addEventListener("click", () => showImage(activeIndex + 1));

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showImage(activeIndex - 1);
  if (event.key === "ArrowRight") showImage(activeIndex + 1);
});

requestAnimationFrame(() => {
  document.querySelectorAll(".gallery-item").forEach((item) => item.classList.add("is-visible"));
});
