const articleBody = document.querySelector("#article-body");
const progressBar = document.querySelector(".reading-progress span");

function addParagraph(line, index, total, state) {
  if (line === "引子" || line === "正文") {
    const heading = document.createElement("h2");
    heading.className = "manuscript-section";
    heading.innerHTML = `<span>${line === "引子" ? "PROLOGUE" : "STORY"}</span>${line}`;
    articleBody.appendChild(heading);
    state.inPrelude = line === "引子";
    return;
  }

  const paragraph = document.createElement("p");
  paragraph.textContent = line;

  if (state.inPrelude) paragraph.classList.add("prologue-line");
  if (line.startsWith("说完，老板")) state.inPrelude = false;
  if (/^(处暑|霜降|立冬)，/.test(line)) paragraph.classList.add("season-mark");
  if (line === "宁博苍穹御风鹰，勿惹浪中惊风燕。") paragraph.classList.add("inscription");

  if (line === "何处是归途" && index > total - 12) {
    state.inClosingVerse = true;
    state.verseLinesLeft = 6;
    paragraph.classList.add("closing-poem-title");
  } else if (state.inClosingVerse && state.verseLinesLeft > 0) {
    paragraph.classList.add("closing-poem-line");
    state.verseLinesLeft -= 1;
    if (state.verseLinesLeft === 0) state.inClosingVerse = false;
  }

  articleBody.appendChild(paragraph);
}

if (articleBody) {
  fetch("article-where-is-home.txt?v=20260701")
    .then((response) => {
      if (!response.ok) throw new Error("Article could not be loaded");
      return response.text();
    })
    .then((text) => {
      const lines = text.split(/\r\n?|\n/).map((line) => line.trim()).filter(Boolean);
      articleBody.replaceChildren();
      const state = { inPrelude: false, inClosingVerse: false, verseLinesLeft: 0 };
      lines.forEach((line, index) => addParagraph(line, index, lines.length, state));
    })
    .catch(() => {
      articleBody.innerHTML = '<p class="article-loading">正文暂时无法载入，请稍后刷新。</p>';
    });
}

function updateReadingProgress() {
  if (!progressBar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
}

window.addEventListener("scroll", updateReadingProgress, { passive: true });
window.addEventListener("resize", updateReadingProgress);
updateReadingProgress();
