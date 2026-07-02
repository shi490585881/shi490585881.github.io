document.addEventListener("DOMContentLoaded", () => {
  const store = window.DIM_LIGHT_PROJECTS;
  document.title = "DIM LIGHT / 微明";
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      "content",
      "DIM LIGHT / 微明——在微光中，从不会有绝望。摄影、文章与个人观察。",
    );

  const card = (id) => {
    const item = store.items[id];
    return `
      <a class="contact-card reveal" href="project.html?id=${id}&image=01">
        <figure class="contact-image">
          <img
            src="assets/covers/${id}.webp"
            alt="${item.title} / ${item.english}"
            loading="lazy"
          />
        </figure>
        <div class="contact-caption">
          <span>${item.number}</span>
          <div>
            <h3>${item.title}</h3>
            <p>${item.english}</p>
          </div>
          <time>${item.year}</time>
        </div>
      </a>
    `;
  };

  const works = store.order.filter((id) => store.items[id].type === "work");
  const notes = store.order.filter((id) => store.items[id].type === "note");

  document.body.className = "edition-index";
  document.body.innerHTML = `
    <header class="edition-header">
      <a class="edition-brand" href="#top" aria-label="DIM LIGHT 首页">
        <span>DIM LIGHT</span><small>微明</small>
      </a>
      <nav aria-label="主要导航">
        <a href="#portfolio">portfolio</a>
        <a href="#journal">journal</a>
        <a href="#information">information</a>
        <button type="button" data-sound-toggle aria-pressed="false">Sound off</button>
      </nav>
    </header>

    <main id="top">
      <section class="edition-hero" aria-labelledby="hero-title">
        <div class="hero-title">
          <p>Photography / Words / Life</p>
          <h1 id="hero-title">DIM LIGHT</h1>
          <div>
            <strong>微明</strong>
            <span>在微光中，从不会有绝望。</span>
          </div>
        </div>
        <nav class="hero-nav" aria-label="首页入口">
          <a href="#portfolio">portfolio</a>
          <a href="#information">information</a>
        </nav>
      </section>

      <section class="portfolio-edition" id="portfolio">
        <header class="section-label reveal">
          <p>01 / Portfolio</p>
          <h2>Selected Works</h2>
        </header>
        <div class="contact-grid">
          ${works.map(card).join("")}
        </div>
      </section>

      <section class="notes-edition">
        <header class="section-label reveal">
          <p>02 / Photographic Notes</p>
          <h2>Fragments</h2>
        </header>
        <div class="contact-grid contact-grid--notes">
          ${notes.map(card).join("")}
        </div>
      </section>

      <section class="journal-edition" id="journal">
        <header class="section-label reveal">
          <p>03 / Journal</p>
          <h2>Words & Notes</h2>
        </header>
        <a class="journal-entry reveal" href="article.html?id=where-is-home">
          <time datetime="2026">2026</time>
          <div>
            <h3>何处是归途？</h3>
            <p>Fiction / Longform</p>
          </div>
          <span>Read</span>
        </a>
      </section>

      <section class="information-edition" id="information">
        <figure class="information-portrait reveal">
          <img src="assets/profile.webp" alt="DIM LIGHT 创作者肖像" loading="lazy" />
        </figure>
        <div class="information-copy reveal">
          <p>04 / Information</p>
          <h2>在微光中，<br />从不会有绝望。</h2>
          <p class="information-text">
            生活于重庆璧山。记录小城、远行、人物与那些容易从日常中消失的光线。
          </p>
          <div class="elsewhere">
            <span>Elsewhere / 即将开放</span>
            <p>Instagram　Douyin　YouTube</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="edition-footer">
      <p>© <span>${new Date().getFullYear()}</span> DIM LIGHT / 微明</p>
      <a href="#top">Back to top</a>
    </footer>
  `;

  window.DimSound.bind();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  if (window.location.hash) {
    requestAnimationFrame(() => {
      document.querySelector(window.location.hash)?.scrollIntoView();
    });
  }
});
