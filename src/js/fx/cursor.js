/* ============ SYNAPSE — fx: vlastní kurzor ============ */
/* Malý kruh doprovázející nativní kurzor (ten NEschováváme — bezpečnější).
   Aktivní JEN při jemném pointeru (myš) a bez reduced-motion, jinak no-op.
   Následuje hrot přes gsap.quickTo (x/y). Nad interaktivními prvky se zvětší
   (scale 2.4) a dostane třídu 'is-hover' — hover stav je řešen delegací na
   document (mouseover/mouseout + .closest), aby fungoval i pro nav/footer a
   další obsah injektovaný až za běhu. Skryje se při opuštění okna, zas se
   ukáže při vstupu. Animuje jen transform/opacity (rule 6). */

import '../../styles/fx/cursor.css'
import gsap from 'gsap'
import { REDUCED, FINE } from '../effects.js'

// interaktivní prvky, nad nimiž se kurzor zvětší
const HOVER_SEL = 'a, button, .wk-card, .work-list a, .btn-pill, .link-arrow'

export function initCursor(root = document) {
  // jen jemný pointer (myš) a bez reduced-motion; na dotyku / RM čistý no-op
  if (!FINE || REDUCED) return
  if (!document.body) return
  // idempotence — nikdy nevznikne druhý kurzor
  if (document.querySelector('.fx-cursor')) return

  const dot = document.createElement('div')
  dot.className = 'fx-cursor'
  dot.setAttribute('aria-hidden', 'true')
  document.body.appendChild(dot)

  // kruh vycentrujeme na hrot (xPercent/yPercent) a začneme mimo obraz,
  // ať nezabliká v levém horním rohu, než přijde první pohyb myši
  gsap.set(dot, { xPercent: -50, yPercent: -50, x: -100, y: -100 })

  // hladké dojíždění za kurzorem (x/y jsou nezávislé na scale i opacity)
  const xTo = gsap.quickTo(dot, 'x', { duration: 0.18, ease: 'power3' })
  const yTo = gsap.quickTo(dot, 'y', { duration: 0.18, ease: 'power3' })

  // ---- zobrazení / skrytí (opacity) ----
  let visible = false
  const show = () => {
    if (visible) return
    visible = true
    gsap.to(dot, { opacity: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' })
  }
  const hide = () => {
    if (!visible) return
    visible = false
    gsap.to(dot, { opacity: 0, duration: 0.2, ease: 'power2.out', overwrite: 'auto' })
  }

  // ---- hover stav (scale + třída) ----
  let isHover = false
  const setHover = (on) => {
    if (on === isHover) return
    isHover = on
    dot.classList.toggle('is-hover', on)
    // scale je jiná vlastnost než x/y i opacity — overwrite 'auto' je nepodrazí
    gsap.to(dot, { scale: on ? 2.4 : 1, duration: 0.3, ease: 'power3.out', overwrite: 'auto' })
  }

  // ---- pohyb myši ----
  window.addEventListener(
    'mousemove',
    (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
      show() // první pohyb kurzor zobrazí
    },
    { passive: true }
  )

  // ---- skrytí při opuštění okna, znovuzobrazení při vstupu ----
  const docEl = document.documentElement
  docEl.addEventListener('mouseleave', hide)
  docEl.addEventListener('mouseenter', show)

  // ---- hover přes delegaci (funguje i pro později injektovaný obsah) ----
  document.addEventListener('mouseover', (e) => {
    const t = e.target
    if (t && t.closest && t.closest(HOVER_SEL)) setHover(true)
  })
  document.addEventListener('mouseout', (e) => {
    const t = e.target
    const from = t && t.closest ? t.closest(HOVER_SEL) : null
    if (!from) return
    // přechod na jiný prvek uvnitř téhož interaktivního prvku hover neruší
    const rt = e.relatedTarget
    const to = rt && rt.closest ? rt.closest(HOVER_SEL) : null
    if (to === from) return
    setHover(false)
  })
}
