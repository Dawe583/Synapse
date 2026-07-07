/* ============ SYNAPSE — fx: intro preloader (homepage) ============ */
/* Krátké intro jen na homepage a jen při první návštěvě v rámci session.
   Injektuje fixed fullscreen overlay v modré s vycentrovaným "( SYNAPSE )",
   po prodlevě ho vytransformuje nahoru (transform, rule 6) a z DOM odstraní.
   Tvrdá časová pojistka garantuje, že obsah nikdy nezůstane zablokovaný. */

import '../../styles/fx/preloader.css'
import gsap from 'gsap'
import { REDUCED } from '../effects.js'

const KEY = 'synapse_intro' // sessionStorage flag — jen první návštěva v session
const HARD_TIMEOUT = 2500 // ms — natvrdo odstraní overlay, i kdyby GSAP selhal

export function initPreloader(root = document) {
  // aktivní JEN na homepage — poznáme podle hero decku; jinde no-op
  if (!root.querySelector('.hero-deck')) return

  // jen první návštěva v session; sessionStorage může být nedostupné (private mode)
  try {
    if (sessionStorage.getItem(KEY) === '1') return
    sessionStorage.setItem(KEY, '1')
  } catch (e) {
    /* bez sessionStorage prostě spustíme intro pro tento load */
  }

  const host = document.body
  if (!host) return
  // idempotence — nikdy nevznikne druhý overlay
  if (document.querySelector('.fx-preloader')) return

  const overlay = document.createElement('div')
  overlay.className = 'fx-preloader'
  overlay.setAttribute('aria-hidden', 'true')

  const word = document.createElement('span')
  word.className = 'fx-preloader__word'
  word.textContent = '( SYNAPSE )'
  overlay.appendChild(word)
  host.appendChild(overlay)

  let removed = false
  const remove = () => {
    if (removed) return
    removed = true
    clearTimeout(hard)
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }

  // TVRDÁ POJISTKA — obsah nesmí nikdy zůstat pod overlayem zablokovaný
  const hard = setTimeout(remove, HARD_TIMEOUT)

  // bfcache: kdyby Zpět obnovilo stránku s overlayem uprostřed intra, odstraň ho
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) remove()
  })

  // reduced-motion: jen rychlý fade a pryč
  if (REDUCED) {
    gsap.to(overlay, { opacity: 0, duration: 0.3, ease: 'power1.out', onComplete: remove })
    return
  }

  // prodleva ~0.25s → wipe nahoru (transform yPercent) → odstranit
  gsap
    .timeline({ onComplete: remove })
    .to(overlay, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, 0.25)
}
