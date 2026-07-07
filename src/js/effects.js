/* ============ SYNAPSE — animační efekty (fáze 1) ============ */
/* Navazuje na stávající GSAP + ScrollTrigger stack z main.js.
   gsap i ScrollTrigger jsou singletony — ScrollTrigger je registrován v main.js. */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ---------- sdílené lešení ---------- */

// Efekty a animace běží na PŘÁNÍ na každém zařízení bez výjimky — nezohledňujeme
// OS preferenci „omezit pohyb". (Zpět respektovat: přepni na matchMedia níže.)
export const REDUCED = false
// eslint-disable-next-line no-unused-vars
const OS_REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches
export const FINE = matchMedia('(pointer: fine)').matches

// sjednocené easingy pro celý web
export const EASE = {
  in: 'power3.out', // běžné vstupy
  hero: 'power4.out', // výraznější hero momenty
  ui: 'cubic-bezier(0.65,0,0.35,1)', // UI / hover
}

/* ---------- 3.2 batch reveal řádků (seznamy, tabulky) ---------- */
// Řádky nalétnou zdola se stagger, jak sekce vstupuje do viewportu.
export function initRowReveals(root = document) {
  const groups = ['.work-list li', '.xp-row', '.ab-jr']
  groups.forEach((sel) => {
    const els = root.querySelectorAll(sel)
    if (!els.length) return
    if (REDUCED) return // bez animace zůstávají viditelné (nejsou skryté v CSS)
    gsap.set(els, { opacity: 0, y: 26 })
    ScrollTrigger.batch(els, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: EASE.in,
          stagger: 0.06,
          overwrite: true,
        }),
    })
  })
}

/* ---------- 3.3 count-up statistik ---------- */
// Robustní parse čísla: mezery i tisícové oddělovače pryč, desetinný oddělovač
// = poslední čárka/tečka následovaná 1–2 číslicemi. Vrací hodnotu + počet desetin.
function parseNumber(input) {
  let s = String(input).trim().replace(/[\s ]/g, '')
  if (!/\d/.test(s)) return null
  const neg = /^-/.test(s)
  s = s.replace(/^-/, '')
  const lastSep = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'))
  let value
  let decimals = 0
  if (lastSep === -1) {
    value = parseInt(s.replace(/\D/g, ''), 10)
  } else {
    const dec = s.slice(lastSep + 1)
    if (/^\d{1,2}$/.test(dec)) {
      const int = s.slice(0, lastSep).replace(/\D/g, '') || '0'
      value = parseFloat(`${int}.${dec}`)
      decimals = dec.length
    } else {
      value = parseInt(s.replace(/\D/g, ''), 10) // vše je tisícové oddělení
    }
  }
  if (!isFinite(value)) return null
  return { value: neg ? -value : value, decimals }
}

// Čísla naskáčou z 0 na cílovou hodnotu; zachovává prefix i příponu (%, +, …).
// Cíl lze určit explicitně přes data-count (strojově čitelné číslo), jinak z textu.
export function initCounters(root = document) {
  const els = root.querySelectorAll('.ab-stat > p, [data-count]')
  els.forEach((el) => {
    const raw = el.textContent.trim()
    const hasDigit = /\d/.test(raw)
    const explicit = el.dataset.count != null
    if (!hasDigit && !explicit) return
    // prefix/přípona z textu (znaménko/měna vlevo, %/+/jednotka vpravo)
    const pre = hasDigit ? (raw.match(/^\D*/) || [''])[0] : ''
    const suf = hasDigit ? (raw.match(/\D*$/) || [''])[0] : ''
    const token = hasDigit ? raw.slice(pre.length, raw.length - suf.length) : ''
    const parsed = parseNumber(explicit ? el.dataset.count : token)
    if (!parsed) return
    const { value: target, decimals } = parsed
    if (REDUCED) return
    const fmt = new Intl.NumberFormat('cs-CZ', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    const obj = { v: 0 }
    const render = () => {
      el.textContent = `${pre}${fmt.format(obj.v)}${suf}`
    }
    render()
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: render,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  })
}

/* ---------- 3.4 scroll-progress / reading bar ---------- */
// Na blog detailu sleduje postup čtení článku, jinak postup celé stránky.
export function initScrollProgress() {
  if (document.querySelector('.scroll-progress')) return
  const bar = document.createElement('div')
  bar.className = 'scroll-progress'
  bar.setAttribute('aria-hidden', 'true')
  document.body.appendChild(bar)

  const article = document.querySelector('.bp-article')
  const st = article
    ? { trigger: article, start: 'top 20%', end: 'bottom bottom', scrub: true }
    : { start: 0, end: 'max', scrub: true }

  ScrollTrigger.create({
    ...st,
    onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
  })
}

/* ---------- 4.1 magnetická tlačítka / šipkové odkazy ---------- */
// Prvek se lehce přitáhne ke kurzoru; reset při opuštění. Jen jemný myší pointer.
export function initMagnetic(root = document) {
  if (REDUCED || !FINE) return
  const strength = 0.35
  root.querySelectorAll('.btn-pill, .link-arrow, [data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
    let rect = null // cache — čteme layout jen při vstupu, ne na každý pohyb
    el.addEventListener('mouseenter', () => {
      rect = el.getBoundingClientRect()
    })
    el.addEventListener('mousemove', (e) => {
      if (!rect) rect = el.getBoundingClientRect()
      xTo((e.clientX - (rect.left + rect.width / 2)) * strength)
      yTo((e.clientY - (rect.top + rect.height / 2)) * strength)
    })
    el.addEventListener('mouseleave', () => {
      rect = null
      xTo(0)
      yTo(0)
    })
  })
}

/* ---------- společné spuštění efektů fáze 1 ---------- */
export function initEffects(root = document) {
  initRowReveals(root)
  initCounters(root)
  initScrollProgress()
  initMagnetic(root)
}
