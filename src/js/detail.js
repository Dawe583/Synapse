import { boot } from './main.js'
import { PROJECTS, POSTS } from './data.js'
import '../styles/pages.css'
import '../styles/home.css'

// slug z názvu souboru: /work/stellar-webovy-dashboard.html -> stellar-webovy-dashboard
const slug = location.pathname.split('/').pop().replace('.html', '')
const isWork = location.pathname.includes('/work/')

const mount = document.getElementById('detail')

if (isWork && PROJECTS[slug]) {
  const p = PROJECTS[slug]
  document.title = `${p.title} – Synapse`
  mount.innerHTML = `
  <section class="page container">
    <p class="wd-cat">${p.title}</p>
    <div class="page-hero"><h1 class="wd-title">${p.lead}</h1></div>

    <div class="wd-hero-grid">
      <div class="wd-side">
        <img src="/assets/detail-side.webp" alt="" />
        <h3>Přístup zaměřený na uživatele</h3>
      </div>
      <div class="wd-main" data-reveal><img src="/assets/${p.hero}" alt="${p.title}" /></div>
    </div>

    <div class="wd-meta">
      <div><h4>Klient</h4><p>${p.client}</p></div>
      <div><h4>Rok</h4><p>${p.year}</p></div>
      <div><h4>Doba trvání</h4><p>${p.duration}</p></div>
      <div><h4>Role</h4><p>${p.role}</p></div>
    </div>
  </section>

  <section class="wd-body container">
    <p class="label">Jak pracujeme</p>
    <p class="wd-lead">${p.overview}</p>
    <div class="wd-wide" data-reveal><img src="/assets/detail-wide-1.webp" alt="" /></div>

    <div class="wd-sec">
      <p class="label">Výzva</p>
      <h2>${p.challengeTitle}</h2>
      <p class="txt" data-fade>${p.challenge}</p>
      <div class="wd-two">
        <div data-reveal><img src="/assets/detail-challenge-1.webp" alt="" /></div>
        <div data-reveal><img src="/assets/detail-challenge-2.webp" alt="" /></div>
      </div>
    </div>

    <div class="wd-sec">
      <p class="label">Řešení</p>
      <p class="txt" data-fade>${p.solution}</p>
      <div class="wd-wide" data-reveal><img src="/assets/detail-wide-2.webp" alt="" /></div>
      <div class="wd-wide" data-reveal><img src="/assets/detail-wide-3.webp" alt="" /></div>
    </div>
  </section>

  <section class="wd-next container">
    <p class="label">Další projekt</p>
    <a class="wd-next-grid" href="/work/${p.next.slug}.html">
      <div class="wd-next-img" data-reveal><img src="/assets/${p.next.img}" alt="${p.next.title}" /></div>
      <div>
        <h2>${p.next.title}</h2>
        <p class="desc">Soudržná identita a promyšlený digitální zážitek — strategie, vizuál a exekuce v jednom celku.</p>
        <span class="link-arrow">Zobrazit projekt</span>
      </div>
    </a>
  </section>`
} else if (POSTS[slug]) {
  const a = POSTS[slug]
  document.title = `${a.title} – Synapse`
  mount.innerHTML = `
  <section class="page container">
    <p class="bp-crumb"><a href="/blog.html">Blog</a><span>/</span><span>Článek</span></p>
    <div class="page-hero"><h1 class="bp-title">${a.title}</h1></div>
    <p class="bp-perex">${a.perex}</p>

    <div class="bp-row">
      <div class="bp-share">
        <span>Sdílet</span>
        <img src="/assets/icon-facebook.svg" alt="Facebook" />
        <img src="/assets/icon-linkedin.svg" alt="LinkedIn" />
        <img src="/assets/icon-twitter.svg" alt="X" />
      </div>
      <p class="bl-meta"><span>${a.category}</span><span>${a.date}</span><span>${a.minutes} min</span></p>
    </div>

    <div class="bp-cover" data-reveal><img src="/assets/${a.cover}" alt="" /></div>
    <p class="bp-author">Napsalo: studio Synapse</p>

    <article class="bp-article">
      ${a.body.map(([h, t]) => `<h2>${h}</h2><p>${t}</p>`).join('')}
      <h2>Závěrem</h2>
      <p>Smysluplné digitální zážitky vznikají skrze záměr, strukturu a průběžné ladění. Když kreativitu vede strategie a empatie, design přestává být jen vizuálem — stává se komunikací.</p>
    </article>
  </section>

  <section class="blog container" data-mount-blog></section>`
} else {
  location.href = '/404.html'
}

boot()
