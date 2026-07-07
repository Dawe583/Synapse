/* ============ SYNAPSE — fx: 3D tilt karet na hover ============ */
/* Karta se podle pozice kurzoru jemně naklopí ve 3D (rotateX/rotateY, max ±4°)
   a lehce se nadzvedne (translateZ). Perspektiva je vlastní pro každou kartu
   (gsap transformPerspective) — každá má svůj střed úběžníku, takže se karty
   navzájem neovlivňují a nemusíme sahat na rodičovský grid.
   Aktivní JEN při jemném pointeru (myš) a bez reduced-motion, jinak čistý no-op.
   Náklon jede na KARTĚ; zoom obrázku, grayscale→barva a overlay .wk-view běží
   na vnitřních prvcích (.wk-img / img), takže se transformy nebijí.
   Animuje jen transform (rule 6). */

import '../../styles/fx/tilt.css'
import gsap from 'gsap'
import { REDUCED, FINE, EASE } from '../effects.js'

const SELECTORS = '.wk-card, .blog-card, .bl-card'
const MAX = 4 // ± stupňů náklonu (rotateX i rotateY)
const PERSP = 900 // px perspektivy (vyšší = subtilnější zkreslení)
const LIFT = 8 // px translateZ při hoveru — jemné nadzvednutí karty

export function initTilt(root = document) {
  // jen jemný pointer (myš) a bez reduced-motion; jinak no-op (nic se nenaváže)
  if (!FINE || REDUCED) return

  const cards = root.querySelectorAll(SELECTORS)
  if (!cards.length) return

  cards.forEach((card) => {
    // idempotence — nikdy nenavázat dvakrát (init může běžet víckrát / po mountu)
    if (card.dataset.fxTilt) return
    card.dataset.fxTilt = '1'
    card.classList.add('fx-tilt')

    // perspektivu a osu náklonu nastavíme jednou; rotace jedou přes quickTo
    gsap.set(card, { transformPerspective: PERSP, transformOrigin: 'center center' })

    // hladké, nezávislé dojíždění jednotlivých os (levné — žádné nové tweeny na pohyb)
    const rxTo = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: EASE.ui })
    const ryTo = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: EASE.ui })

    let rect = null // rozměry čteme jen při vstupu, ne na každý pohyb myši

    const onEnter = () => {
      rect = card.getBoundingClientRect()
      gsap.to(card, { z: LIFT, duration: 0.4, ease: EASE.ui, overwrite: 'auto' })
    }

    const onMove = (e) => {
      if (!rect) rect = card.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width // 0..1 vodorovně
      const py = (e.clientY - rect.top) / rect.height // 0..1 svisle
      // střed karty => 0°, kraje => ±MAX°. rotY podle X, rotX podle Y
      // (invertované, aby se karta „nakláněla ke kurzoru" přirozeně)
      ryTo((px - 0.5) * 2 * MAX)
      rxTo((0.5 - py) * 2 * MAX)
    }

    const onLeave = () => {
      rect = null
      rxTo(0)
      ryTo(0)
      gsap.to(card, { z: 0, duration: 0.5, ease: EASE.ui, overwrite: 'auto' })
    }

    card.addEventListener('mouseenter', onEnter)
    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
  })
}
