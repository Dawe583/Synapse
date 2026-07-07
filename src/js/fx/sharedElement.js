/* ============ SYNAPSE — fx: odlehčený "shared element" reveal hero obrázku ============ */
/* ADITIVNÍ, MPA-bezpečný shared-element mezi work listingem a detailem projektu.
   NEZASAHUJE do navigace — o tu se stará navTransitions (barevný page-wipe).

   ČÁST A (work listing): capture-phase, PASSIVE listener na kliky. Když klik padne
   na 'a.wk-card', uložíme do sessionStorage src + rect thumbnailu + href + čas.
   Žádný preventDefault, žádné blokování — pouze zápis. Kliky dál zpracuje
   navTransitions v bubble fázi.

   ČÁST B (work detail): pokud existuje hero '.wd-main img' a v sessionStorage je
   čerstvý (< ~3000 ms) záznam, který sedí na tento hero, provedeme po malém
   zpoždění (~0.35 s, aby dojel příchozí page-wipe) jednoduchý FLIP: hero se objeví
   v místě/velikosti thumbnailu z karty a "doroste" na své místo (transform-origin
   top-left, ~0.7 s power3.out). Po dokončení flag smažeme.

   BEZPEČNOST (rule 4): při JAKÉKOLI nejistotě (chybí prvek, nesouhlasí src/href,
   starý záznam, nenačtený obrázek, výjimka) jen smažeme flag a NIC neanimujeme —
   hero se pak odkryje standardně přes svůj data-reveal. Nic nezůstane skryté:
   před FLIP i v případě chyby nastavíme hero do plně viditelného koncového stavu. */

import gsap from 'gsap'
import { REDUCED, EASE } from '../effects.js'

const FLAG = 'synapse_shared'
const FRESH_MS = 3000 // maximální stáří záznamu, jinak ho ignorujeme
const START_DELAY = 0.35 // s — počkat, než dojede příchozí page-wipe
const DUR = 0.7 // s — délka doběhu heroa na místo
const HERO_SEL = '.wd-main img' // hero obrázek na detailu projektu
const CARD_SEL = 'a.wk-card' // karta na work listingu

/* --- bezpečný sessionStorage (private mode může házet výjimky) --- */
function readRecord() {
  try {
    const raw = sessionStorage.getItem(FLAG)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}
function writeRecord(obj) {
  try {
    sessionStorage.setItem(FLAG, JSON.stringify(obj))
  } catch (e) {
    /* bez sessionStorage prostě nebude shared-element — navigace stále funguje */
  }
}
function clearRecord() {
  try {
    sessionStorage.removeItem(FLAG)
  } catch (e) {
    /* no-op */
  }
}

/* --- hero natvrdo do plně viditelného koncového stavu (fallback / pojistka) --- */
// Kdyby cokoli selhalo, obsah NIKDY nesmí zůstat skrytý (data-reveal ho drží na
// clip-path: inset(100%) + img scale 1.15). Tady ho případně odemkneme.
function revealHero(container, img) {
  try {
    gsap.set(container, { clipPath: 'inset(0% 0 0 0)', clearProps: 'transform,willChange' })
    if (img) gsap.set(img, { scale: 1 })
  } catch (e) {
    /* no-op */
  }
}

export function initSharedElement(root = document) {
  // reduced-motion: neukládat ani neanimovat, jen uklidit případný starý flag
  if (REDUCED) {
    clearRecord()
    return
  }

  /* ---------- ČÁST A: záznam kliku na kartu (capture, passive) ---------- */
  // Guard proti dvojí delegaci (init může teoreticky proběhnout víckrát).
  if (!document.__synapseSharedBound) {
    document.__synapseSharedBound = true
    document.addEventListener(
      'click',
      (e) => {
        // NIKDY nezasahujeme do eventu (passive) — jen čteme a ukládáme.
        const t = e.target
        const card = t && t.closest ? t.closest(CARD_SEL) : null
        if (!card) return
        const img = card.querySelector('img')
        if (!img) return
        try {
          const r = img.getBoundingClientRect()
          if (!r.width || !r.height) return // nezměřitelný thumbnail — přeskoč
          writeRecord({
            src: img.src,
            rect: { x: r.x, y: r.y, width: r.width, height: r.height },
            href: card.href,
            t: performance.now(), // dle zadání (informativní)
            ts: Date.now(), // absolutní čas pro korektní cross-document freshness
          })
        } catch (err) {
          /* cokoli selže → prostě neuložíme, karta se otevře normálně */
        }
      },
      { capture: true, passive: true },
    )
  }

  /* ---------- ČÁST B: FLIP hero na detailu projektu ---------- */
  const heroImg = root.querySelector(HERO_SEL)
  if (!heroImg) return // nejsme na detailu projektu (nebo hero chybí)

  const rec = readRecord()
  if (!rec || !rec.rect) {
    clearRecord()
    return
  }

  // freshness přes absolutní čas (performance.now() je per-document, cross-page
  // nepoužitelný); když chybí ts, bereme jako nečerstvé.
  const age = typeof rec.ts === 'number' ? Date.now() - rec.ts : Infinity
  const fresh = age >= 0 && age < FRESH_MS
  if (!fresh) {
    clearRecord()
    return
  }

  // musí sedět src heroa NEBO cílová URL (href z karty === aktuální stránka)
  let hrefMatch = false
  try {
    hrefMatch = rec.href && new URL(rec.href, location.href).pathname === location.pathname
  } catch (e) {
    hrefMatch = false
  }
  const srcMatch = rec.src && rec.src === heroImg.src
  if (!srcMatch && !hrefMatch) {
    clearRecord()
    return
  }

  // od teď se o hero staráme sami — flag už nikdy nebude potřeba
  clearRecord()

  const container = heroImg.closest('[data-reveal]') || heroImg.parentElement || heroImg

  // Necháme page-wipe dojet a teprve pak měříme + animujeme.
  gsap.delayedCall(START_DELAY, () => {
    try {
      // musí pořád existovat a být rozvržený (obrázek načtený → nenulová výška)
      if (!heroImg.isConnected) return
      if (!heroImg.complete) {
        revealHero(container, heroImg)
        return
      }
      // převezmeme reveal: zabijeme jeho tweeny a nastavíme hero do finálního
      // (plně viditelného) stavu, ať FLIP morfuje kompletní obrázek, ne výseč.
      gsap.killTweensOf(container)
      gsap.killTweensOf(heroImg)
      revealHero(container, heroImg)

      const target = container.getBoundingClientRect()
      const from = rec.rect
      if (!target.width || !target.height || !from.width || !from.height) {
        revealHero(container, heroImg)
        return
      }

      // uniform scale dle šířky + posun levého horního rohu (origin top-left)
      const scale = from.width / target.width
      const dx = from.x - target.x
      const dy = from.y - target.y

      // sanity: nesmyslné hodnoty (obří skoky / degenerovaný scale) → nic
      if (!isFinite(scale) || scale <= 0 || scale > 8) {
        revealHero(container, heroImg)
        return
      }

      gsap.set(container, { transformOrigin: 'top left', willChange: 'transform' })
      gsap.from(container, {
        x: dx,
        y: dy,
        scale,
        duration: DUR,
        ease: EASE.in, // 'power3.out'
        onComplete: () => gsap.set(container, { clearProps: 'transform,willChange' }),
        onInterrupt: () => gsap.set(container, { clearProps: 'transform,willChange' }),
      })
    } catch (err) {
      // jakákoli chyba → jen zajistíme viditelný hero, nic neanimujeme
      revealHero(container, heroImg)
    }
  })
}
