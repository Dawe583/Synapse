/* ============ SYNAPSE — fx: horizontální parallax drift koláže ============ */
/* Homepage sekce projektů: tři obrázky v .work-collage se při scrollu sekce
   .work jemně rozjedou/sblíží horizontálně. Bez pinu, beze změny gridu —
   pouze transform: x v rozsahu ±30px (body má overflow-x: hidden). */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { REDUCED } from '../effects.js'

const RANGE = 30 // ±px horizontálního driftu krajních dlaždic
const MID = 8 // jemný pohyb prostřední dlaždice (klidnější než krajní)

export function initCollageDrift(root = document) {
  // běží na všech velikostech; no-op jen když koláž na stránce není
  if (REDUCED) return

  const collage = root.querySelector('.work-collage')
  if (!collage) return

  const section = collage.closest('.work') || root.querySelector('.work')
  if (!section) return

  const items = collage.querySelectorAll(':scope > div')
  if (!items.length) return

  const [left, mid, right] = items

  // jeden ScrollTrigger pro celou koláž; každá dlaždice má vlastní x-dráhu
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })

  // levá dlaždice: -30 → +30 (rozjezd doprava se scrollem dolů)
  if (left) tl.fromTo(left, { x: -RANGE }, { x: RANGE, ease: 'none' }, 0)
  // prostřední: klidný, jen jemný protipohyb
  if (mid) tl.fromTo(mid, { x: MID }, { x: -MID, ease: 'none' }, 0)
  // pravá dlaždice: +30 → -30 (zrcadlí levou, dlaždice se sbíhají)
  if (right) tl.fromTo(right, { x: RANGE }, { x: -RANGE, ease: 'none' }, 0)
}
