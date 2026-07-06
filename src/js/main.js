import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import '../styles/main.css'

gsap.registerPlugin(ScrollTrigger)

/* ---------- Lenis smooth scroll (celý web) ---------- */
export const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

/* ---------- nav + footer (sdílené na všech stránkách) ---------- */
const base = import.meta.env.BASE_URL

const swap = (label) =>
  `<span class="swap"><span class="swap-inner"><span>${label}</span><span>${label}</span></span></span>`

const navHTML = `
<nav class="site-nav">
  <div class="nav-1"><a href="${base}about.html">${swap('O nás')}</a></div>
  <div class="nav-2"><a href="${base}work.html">${swap('Práce')}</a></div>
  <div class="nav-logo"><a href="${base}">( SYNAPSE )</a></div>
  <div class="nav-3"><a href="${base}blog.html">${swap('Blog')}</a></div>
  <div class="nav-4"><a href="${base}contact.html">${swap('Kontakt')}</a></div>
</nav>`

const footerHTML = `
<footer class="site-footer">
  <div class="footer-grid">
    <p class="footer-desc">Synapse je kreativní studio zaměřené na promyšlené digitální zážitky — UI/UX design, vývoj webů, branding a ilustraci. Toto portfolio představuje vybrané projekty a kreativní průzkumy, v nichž se potkává strategie, estetika a funkčnost.</p>
    <div class="footer-col">
      <h4>Podstránky</h4>
      <ul>
        <li><a href="${base}about.html">${swap('O nás')}</a></li>
        <li><a href="${base}contact.html">${swap('Kontakt')}</a></li>
        <li><a href="${base}404.html">${swap('404')}</a></li>
        <li><a href="${base}pricing.html">${swap('Ceník')}</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Podstránky</h4>
      <ul>
        <li><a href="${base}blog.html">${swap('Blog')}</a></li>
        <li><a href="${base}work.html">${swap('Projekty')}</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Sociální sítě</h4>
      <ul>
        <li><a href="https://instagram.com/" target="_blank" rel="noopener">${swap('Instagram')}</a></li>
        <li><a href="https://facebook.com/" target="_blank" rel="noopener">${swap('Facebook')}</a></li>
        <li><a href="https://linkedin.com/" target="_blank" rel="noopener">${swap('LinkedIn')}</a></li>
        <li><a href="https://twitter.com/" target="_blank" rel="noopener">${swap('Twitter X')}</a></li>
        <li><a href="https://behance.net/" target="_blank" rel="noopener">${swap('Behance')}</a></li>
      </ul>
    </div>
  </div>
  <p class="footer-copy">© 2026 Synapse. Všechna práva vyhrazena.</p>
</footer>`

export function injectChrome({ footer = true } = {}) {
  document.body.insertAdjacentHTML('afterbegin', navHTML)
  if (footer) document.body.insertAdjacentHTML('beforeend', footerHTML)

  // schování nav při scrollu dolů
  let last = 0
  const nav = document.querySelector('.site-nav')
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('is-hidden', scroll > 120 && scroll > last)
    last = scroll
  })
}

/* ---------- sdílené sekce (FAQ, blog) ---------- */

const FAQ_ITEMS = [
  ['Jaké služby nabízíte?', 'Specializujeme se na UI/UX design, vývoj webů, branding a ilustraci.'],
  ['S jakými obory pracujete?', 'Přizpůsobujeme se různým odvětvím — od technologií přes kreativní studia po startupy — aby výsledek vždy sedl publiku a kontextu značky.'],
  ['Jak vypadá váš designový proces?', 'Začínáme pochopením problému a jasnými cíli, pak řešíme strukturu, vizuál a použitelnost. Vše ladíme skrze zpětnou vazbu a iterace.'],
  ['Jak pracujete se zpětnou vazbou?', 'Zpětná vazba je pro nás klíčová. Návrhy otevřeně posuzujeme, slaďujeme je s cíli projektu a práci zpřesňujeme, aniž by ztratila jasnost.'],
  ['Jaké nástroje používáte?', 'Figmu pro design a Adobe Creative Suite pro vizuály. Podle potřeb projektu volíme nástroje tak, aby práce byla efektivní a kvalitní.'],
  ['Jak řešíte harmonogram projektu?', 'Harmonogram plánujeme podle rozsahu, brzy nastavíme milníky a průběžně komunikujeme — postup je tak plynulý a flexibilní.'],
  ['Pomůžete s brandingem pro startupy?', 'Ano. Se startupy stavíme pevné základy značky s důrazem na vizuální identitu a škálovatelný brand systém.'],
  ['Děláte ilustrace na míru?', 'Tvoříme autorské ilustrace, které posilují vyprávění značky a drží konzistenci napříč všemi vizuálními touchpointy.'],
]

const faqSectionHTML = `
  <div class="faq-head">
    <p class="label">FAQ</p>
    <h2 class="h-section">Užitečné <span class="fw" data-word="postřehy"></span> a odpovědi pro klienty, <span class="fw" data-word="spolupracovníky"></span> i <span class="fw" data-word="zvědavé"></span> návštěvníky.</h2>
  </div>
  <div class="faq-list">
    ${FAQ_ITEMS.map(([q, a], i) => `
    <div class="faq-item${i === 0 ? ' open' : ''}">
      <button class="faq-q">${q}<span class="faq-icon"></span></button>
      <div class="faq-a"><div><p>${a}</p></div></div>
    </div>`).join('')}
  </div>`

const BLOG_CARDS = [
  ['navrhovani-se-zamerem', 'blog-1.webp', 'Design se záměrem: jak z nápadů vznikají smysluplné digitální zážitky', 'Jak jednoduchost a struktura zlepšují uživatelský zážitek digitálních produktů.'],
  ['jasnost-misto-slozitosti', 'blog-2.webp', 'Design se záměrem: jasnost místo složitosti', 'Strategie pro navigaci, která uživatele vede bez námahy a bez bloudění.'],
  ['proc-na-strukture-zalezi', 'blog-3.webp', 'Proč na struktuře v digitálním designu záleží', 'Jak volba barev ovlivňuje emoce a chování uživatelů v designu.'],
  ['kreativita-a-pouzitelnost', 'blog-4.webp', 'Rovnováha mezi kreativitou a použitelností', 'Jak adaptabilní layouty zlepšují použitelnost napříč zařízeními.'],
]

const blogSectionHTML = `
  <p class="label">Blog & postřehy</p>
  <div class="blog-head">
    <h2 class="h-section">Myšlenky, <span class="fw" data-word="postřehy"></span> a osobní poznámky o designu, <span class="fw" data-word="vývoji"></span> a <span class="fw" data-word="kreativních"></span> procesech.</h2>
    <p class="body-sm" data-fade>Prostor, kde sdílíme myšlenky, postřehy a lekce z práce napříč UI/UX designem, vývojem webů, brandingem a ilustrací. Od designových procesů po kreativní průzkumy — poznámky o tom, jak se nápady mění ve smysluplné digitální zážitky.</p>
  </div>
  <div class="blog-grid">
    ${BLOG_CARDS.map(([slug, img, title, desc]) => `
    <a class="blog-card" href="${base}blog/${slug}.html">
      <div data-reveal><img src="${base}assets/${img}" alt="" /></div>
      <h3>${title}</h3>
      <p>${desc}</p>
    </a>`).join('')}
  </div>`

function mountSections() {
  const faqMount = document.querySelector('[data-mount-faq]')
  if (faqMount) faqMount.innerHTML = faqSectionHTML
  const blogMount = document.querySelector('[data-mount-blog]')
  if (blogMount) blogMount.innerHTML = blogSectionHTML
}

/* ---------- efekty ---------- */

// flip slova: <span class="fw" data-word="slovo"></span> naplní + animuje na scroll
export function initFlipWords(root = document) {
  root.querySelectorAll('.fw[data-word]').forEach((el) => {
    const w = el.dataset.word
    el.innerHTML = `<span class="fw-a">${w}</span><span class="fw-b">${w}</span>`
    const a = el.querySelector('.fw-a')
    const b = el.querySelector('.fw-b')
    gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 85%' },
      delay: 0.15,
    })
      .to(a, { yPercent: -110, duration: 0.7, ease: 'power3.inOut' })
      .to(b, { yPercent: -110, duration: 0.7, ease: 'power3.inOut' }, '<')
  })
}

// slovní reveal nadpisů: každé slovo vyjede zpoza masky
export function initHeadReveals(root = document) {
  root.querySelectorAll('.h-section, .page-hero h1, .wd-sec h2').forEach((h) => {
    ;[...h.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment()
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return }
          const m = document.createElement('span')
          m.className = 'wmask'
          const i = document.createElement('span')
          i.textContent = part
          m.append(i)
          frag.append(m)
        })
        n.replaceWith(frag)
      } else if (n.nodeType === 1 && !n.classList.contains('wmask')) {
        const m = document.createElement('span')
        m.className = 'wmask'
        n.replaceWith(m)
        m.append(n)
      }
    })
    h.classList.add('is-splitting')
    gsap.from(h.querySelectorAll('.wmask > *'), {
      yPercent: 120,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.035,
      scrollTrigger: { trigger: h, start: 'top 88%' },
      onComplete: () => h.classList.remove('is-splitting'),
    })
  })
}

// jemná parallaxa velkých obrázků
export function initParallax(root = document) {
  root.querySelectorAll('.about-photo-big, .process-img, .work-collage > div, .wd-wide, .bp-cover, .ab-exp-img').forEach((el) => {
    gsap.fromTo(el, { y: 40 }, {
      y: -40,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })
}

// reveal obrázků zespodu (clip-path)
export function initReveals(root = document) {
  root.querySelectorAll('[data-reveal]').forEach((el) => {
    const img = el.querySelector('img')
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 88%' },
    })
    tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power3.out' })
    if (img) tl.to(img, { scale: 1, duration: 1.1, ease: 'power3.out' }, '<')
  })
}

// fade-up bloků
export function initFades(root = document) {
  root.querySelectorAll('[data-fade]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: parseFloat(el.dataset.fade) || 0,
      scrollTrigger: { trigger: el, start: 'top 88%' },
    })
  })
}

// marquee: zduplikuje obsah tracku (potřeba pro plynulou smyčku -50 %)
export function initMarquees(root = document) {
  root.querySelectorAll('.marquee-track, .marquee-v-track').forEach((track) => {
    track.innerHTML += track.innerHTML
  })
}

// FAQ akordeon
export function initFaq(root = document) {
  root.querySelectorAll('.faq-item').forEach((item) => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open')
      item.closest('.faq-list').querySelectorAll('.faq-item.open').forEach((o) => o.classList.remove('open'))
      if (!wasOpen) item.classList.add('open')
    })
  })
}

// společný boot pro všechny stránky
export function boot(opts) {
  injectChrome(opts)
  mountSections()
  initHeadReveals()
  initParallax()
  initFlipWords()
  initReveals()
  initFades()
  initMarquees()
  initFaq()
}

export { gsap, ScrollTrigger }
