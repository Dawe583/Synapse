/* ============ SYNAPSE — fx: barevný wipe přechod mezi stránkami ============ */
/* Globální, robustní page-transition. Injektuje fixed fullscreen overlay v modré
   (z-index 250, pointer-events:none, aria-hidden). Při odchodu z interního odkazu
   overlay vyjede zdola nahoru přes obsah a teprve pak proběhne navigace; na nově
   načtené stránce (příchod) overlay odjede nahoru pryč a odkryje obsah.

   PRIORITA Č.1 — navigace musí VŽDY fungovat:
     • každý odchozí wipe má tvrdou časovou pojistku, která navigaci provede,
       i kdyby GSAP onComplete nikdy nenastal;
     • každý příchozí wipe má tvrdou pojistku, která overlay vždy schová;
     • reduced-motion nezachytává kliky vůbec (čistě nativní navigace);
     • externí / tel: / mailto: / download / _blank / modifikované kliky jdou
       nativně beze změny. */

import '../../styles/fx/navTransitions.css'
import gsap from 'gsap'
import { REDUCED } from '../effects.js'

const FLAG = 'synapse_wipe' // sessionStorage — signál "právě probíhá přechod"
const DUR = 0.5 // s — délka wipe animace (odchod i příchod)
const EASE = 'power3.inOut'
const OUT_FALLBACK = 700 // ms — natvrdo naviguj, i kdyby onComplete nenastal
const IN_FALLBACK = 900 // ms — natvrdo schovej overlay po příchodu

/* --- bezpečný sessionStorage (private mode může házet výjimky) --- */
function readFlag() {
  try {
    return sessionStorage.getItem(FLAG) === '1'
  } catch (e) {
    return false
  }
}
function setFlag() {
  try {
    sessionStorage.setItem(FLAG, '1')
  } catch (e) {
    /* bez sessionStorage prostě nebude příchozí wipe — navigace stále funguje */
  }
}
function clearFlag() {
  try {
    sessionStorage.removeItem(FLAG)
  } catch (e) {
    /* no-op */
  }
}

export function initNavTransitions(root = document) {
  // reduced-motion: NEZACHYTÁVEJ kliky (nech nativní navigaci), příchozí wipe přeskoč
  if (REDUCED) {
    clearFlag()
    return
  }

  const host = document.body
  if (!host) return

  // idempotence — nikdy nevznikne druhý overlay ani druhá delegace
  if (document.querySelector('.fx-nav-wipe')) return

  const overlay = document.createElement('div')
  overlay.className = 'fx-nav-wipe'
  overlay.setAttribute('aria-hidden', 'true')

  const incoming = readFlag()
  // příchod: overlay ať zakryje obrazovku už při prvním paintu (origin top),
  // aby mezi načtením a animací nevznikl záblesk obsahu
  if (incoming) {
    clearFlag()
    overlay.style.transformOrigin = 'center top'
    overlay.style.transform = 'scaleY(1)'
  }
  host.appendChild(overlay)

  /* ---------- PŘÍCHOD: overlay odjede nahoru pryč ---------- */
  if (incoming) {
    let hidden = false
    const forceHide = () => {
      if (hidden) return
      hidden = true
      clearTimeout(inTimer)
      gsap.killTweensOf(overlay)
      gsap.set(overlay, { scaleY: 0 })
      overlay.style.pointerEvents = 'none'
      overlay.style.willChange = 'auto'
    }
    // TVRDÁ POJISTKA — overlay se vždy schová, ať se stane cokoli
    const inTimer = setTimeout(forceHide, IN_FALLBACK)

    overlay.style.willChange = 'transform'
    gsap.set(overlay, { scaleY: 1, transformOrigin: 'center top' })
    gsap.to(overlay, {
      scaleY: 0,
      duration: DUR,
      ease: EASE,
      onComplete: forceHide,
    })
  }

  /* ---------- ODCHOD: delegovaný click na interní <a> ---------- */
  let leaving = false // jakmile jednou spustíme odchozí wipe, další kliky ignorujeme
  let leftPage = false // pagehide potvrdí, že jsme reálně odešli (nebo do bfcache)

  // Overlay do výchozího (skrytého) stavu + odemknutí navigace.
  const resetOverlay = () => {
    leaving = false
    gsap.killTweensOf(overlay)
    gsap.set(overlay, { scaleY: 0, transformOrigin: 'center bottom' })
    overlay.style.pointerEvents = 'none'
    overlay.style.willChange = 'auto'
  }

  // Tlačítko Zpět může stránku obnovit z bfcache i s overlayem (scaleY 1) a se
  // zamčeným leaving → bez resetu by web uvázl pod modrým překryvem. Reset i flag.
  window.addEventListener('pagehide', () => {
    leftPage = true
  })
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return
    leftPage = false
    clearFlag()
    resetOverlay()
  })

  root.addEventListener('click', (e) => {
    // někdo jiný už klik zpracoval (např. jiný handler) — nech být
    if (e.defaultPrevented) return
    // jen čisté levé kliknutí bez modifikátorů (jinak nech nativní: nová karta/okno/stažení)
    if (e.button !== 0) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null
    if (!a || !(a instanceof HTMLAnchorElement)) return
    if (a.hasAttribute('download')) return
    if (a.target && a.target.toLowerCase() === '_blank') return

    let url
    try {
      url = new URL(a.href, location.href)
    } catch (err) {
      return // nevalidní URL — nech nativní chování
    }

    // jen http/https (tel:, mailto: apod. nech projít nativně)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return
    // externí origin nech projít nativně
    if (url.origin !== location.origin) return
    // odkaz na tutéž stránku (jen #hash / totožná URL) — nech nativní skok, žádný wipe
    if (
      url.pathname === location.pathname &&
      url.search === location.search &&
      (url.hash || url.href === location.href)
    ) {
      return
    }

    // od teď to bereme jako interní přechod → řízená navigace s wipe
    e.preventDefault()
    if (leaving) return // wipe už běží; cílíme na první kliknutý odkaz
    leaving = true
    setFlag()

    const target = a.href
    let navigated = false
    const go = () => {
      if (navigated) return
      navigated = true
      window.location.href = target
    }

    // POJISTKA — i kdyby GSAP onComplete nikdy nenastal, navigaci provedeme
    setTimeout(go, OUT_FALLBACK)

    // POJISTKA 2 — kdyby navigace vůbec neproběhla (download / HTTP 204 / zrušeno)
    // a jsme pořád na téže stránce, odemkni web, ať nezůstane zamrzlý pod overlayem
    setTimeout(() => {
      if (leftPage) return // pagehide potvrdil odchod → nic neresetuj
      resetOverlay()
    }, 1500)

    // overlay vyjede zdola nahoru přes obsah, pak teprve navigace
    overlay.style.willChange = 'transform'
    gsap.set(overlay, { scaleY: 0, transformOrigin: 'center bottom' })
    gsap.to(overlay, {
      scaleY: 1,
      duration: DUR,
      ease: EASE,
      onComplete: go,
    })
  })
}
