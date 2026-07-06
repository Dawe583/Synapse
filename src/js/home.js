import { boot, gsap, ScrollTrigger } from './main.js'
import '../styles/home.css'

boot()

/* ---------- hero: cyklující balíček fotek ---------- */
function initDeckCycle(selector, interval = 2.2) {
  const imgs = document.querySelectorAll(`${selector} img`)
  if (!imgs.length) return null
  let i = 0
  return setInterval(() => {
    const prev = imgs[i]
    i = (i + 1) % imgs.length
    gsap.to(prev, { opacity: 0, duration: 0.5, ease: 'power2.inOut' })
    gsap.fromTo(imgs[i], { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.inOut' })
  }, interval * 1000)
}
initDeckCycle('.hero-deck')

/* ---------- služby: scroll-řízený stack (pin + cyklus obrázků) ---------- */
const deck = document.querySelector('.services-deck')
const labels = document.querySelectorAll('.services-labels li')
if (deck) {
  const imgs = deck.querySelectorAll('img')
  let current = 0
  labels[0].classList.add('is-active')
  ScrollTrigger.create({
    trigger: '.services-stage',
    start: 'top 20%',
    end: '+=1600',
    pin: true,
    scrub: true,
    onUpdate(self) {
      const idx = Math.min(imgs.length - 1, Math.floor(self.progress * imgs.length))
      if (idx === current) return
      gsap.to(imgs[current], { opacity: 0, duration: 0.35 })
      gsap.fromTo(imgs[idx], { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.35 })
      labels[current].classList.remove('is-active')
      labels[idx].classList.add('is-active')
      current = idx
    },
  })
}

/* ---------- projekty: plovoucí náhled u kurzoru ---------- */
const floatImg = document.querySelector('.work-float')
if (floatImg && matchMedia('(pointer: fine)').matches) {
  const xTo = gsap.quickTo(floatImg, 'x', { duration: 0.4, ease: 'power3' })
  const yTo = gsap.quickTo(floatImg, 'y', { duration: 0.4, ease: 'power3' })
  document.querySelectorAll('.work-list a').forEach((a) => {
    a.addEventListener('mouseenter', () => {
      floatImg.src = a.dataset.img
      gsap.to(floatImg, { opacity: 1, scale: 1, duration: 0.3 })
    })
    a.addEventListener('mouseleave', () => gsap.to(floatImg, { opacity: 0, scale: 0.9, duration: 0.3 }))
  })
  window.addEventListener('mousemove', (e) => {
    xTo(e.clientX + 30)
    yTo(e.clientY - 120)
  })
}

/* ---------- reference: automatická rotace citací ---------- */
const voices = document.querySelectorAll('.voice')
if (voices.length) {
  let v = 0
  setInterval(() => {
    const prev = voices[v]
    v = (v + 1) % voices.length
    gsap.to(prev, { opacity: 0, y: -14, duration: 0.5, ease: 'power2.in', onComplete: () => prev.classList.remove('is-active') })
    gsap.fromTo(voices[v], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.45, ease: 'power2.out', onStart: () => voices[v].classList.add('is-active') })
  }, 5000)
}

/* ---------- entrance: nav + hero deck ---------- */
gsap.from('.site-nav', { y: -24, opacity: 0, duration: 0.7, ease: 'power2.out' })
gsap.from('.hero-deck', { scale: 0.94, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.15 })

/* ---------- wordmark: písmena po jednom + jemná parallaxa ---------- */
const wm = document.querySelector('.wordmark')
wm.innerHTML = [...wm.textContent].map((c) => `<span class="wm-l">${c}</span>`).join('')
gsap.from('.wordmark .wm-l', {
  yPercent: 60,
  opacity: 0,
  duration: 0.9,
  ease: 'power4.out',
  stagger: 0.05,
  scrollTrigger: { trigger: wm, start: 'top 92%' },
})
gsap.fromTo(wm, { yPercent: 12 }, {
  yPercent: 0,
  ease: 'none',
  scrollTrigger: { trigger: wm, start: 'top bottom', end: 'top 40%', scrub: true },
})
