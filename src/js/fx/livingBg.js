/* ============ SYNAPSE — fx: living background (hero + finale) ============ */
/* Jemné "živé" pozadí homepage. Do .hero (světlé) a .finale (tmavé) vloží
   dekorativní vrstvu s velmi jemnou driftující mřížkou v barvách značky.
   Barvy i pomalý pohyb řídí výhradně CSS (@keyframes + prefers-reduced-motion).
   Vrstva je aria-hidden, pointer-events:none a leží POD obsahem (negativní
   z-index + isolation na sekci) — nikdy neruší čitelnost ani interakci.
   Bezpečný no-op mimo homepage (detekce podle .hero). */

import '../../styles/fx/livingBg.css'

const SECTIONS = ['.hero', '.finale']

export function initLivingBg(root = document) {
  // aktivní jen na homepage — poznáme podle .hero; jinde okamžitý no-op
  if (!root.querySelector('.hero')) return

  SECTIONS.forEach((sel) => {
    const section = root.querySelector(sel)
    if (!section) return
    // idempotence — nikdy nevznikne druhá vrstva
    if (section.querySelector(':scope > .fx-livingbg')) return

    const layer = document.createElement('div')
    layer.className = 'fx-livingbg'
    layer.setAttribute('aria-hidden', 'true')
    // jako první dítě sekce; vizuální řazení řeší z-index/isolation v CSS
    section.insertBefore(layer, section.firstChild)
  })
}
