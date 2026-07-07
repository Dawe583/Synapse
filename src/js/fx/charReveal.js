/* ============ SYNAPSE — znakový reveal velkých DISPLAY nápisů ============ */
/* Rozdělí velké verzálky na jednotlivé znaky a nechá je vyjet zpod masky
   s jemným rozostřením. Cíle: '.ab-name' (about) a '.finale-contact' (home).
   U '.finale-contact' se splituje POUZE textový uzel ("Kontakt"); inline
   <svg class="finale-arrow"> zůstává beze změny na svém místě. */

import '../../styles/fx/charReveal.css'
import gsap from 'gsap'
import { REDUCED, EASE } from '../effects.js'

const SELECTOR = '.ab-name, .finale-contact'

// Textový uzel rozdělí na znaky. Každý viditelný znak dostane masku
// (.cr-mask) s vnitřním <span>; mezery zůstanou jako čisté textové uzly.
// Vše je zabaleno do jednoho .cr-line, aby se u flex kontejneru
// (.finale-contact) nezmnožily flex položky a nerozjel se gap.
function splitTextNode(node) {
  const line = document.createElement('span')
  line.className = 'cr-line'
  for (const ch of Array.from(node.textContent)) {
    if (/\s/.test(ch)) {
      line.appendChild(document.createTextNode(ch)) // mezeru zachováme
      continue
    }
    const mask = document.createElement('span')
    mask.className = 'cr-mask'
    const inner = document.createElement('span')
    inner.textContent = ch
    mask.appendChild(inner)
    line.appendChild(mask)
  }
  return line
}

export function initCharReveal(root = document) {
  // reduced-motion: nesplitujeme, text zůstává staticky viditelný (není v CSS skrytý)
  if (REDUCED) return

  const els = root.querySelectorAll(SELECTOR)
  if (!els.length) return // bezpečný no-op, když na stránce cíle nejsou

  els.forEach((el) => {
    if (el.dataset.crSplit) return // idempotence — nesplituj podruhé

    // splitujeme JEN textové uzly; elementy (např. <svg>) necháme být
    let hasChars = false
    for (const n of [...el.childNodes]) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue
      const line = splitTextNode(n)
      if (line.querySelector('.cr-mask')) hasChars = true
      n.replaceWith(line)
    }
    if (!hasChars) return

    el.dataset.crSplit = '1'
    el.classList.add('is-char-split') // aktivuje overflow:hidden na maskách

    const inners = el.querySelectorAll('.cr-mask > span')
    gsap.fromTo(
      inners,
      { yPercent: 115, filter: 'blur(6px)', opacity: 0 },
      {
        yPercent: 0,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.9,
        ease: EASE.hero,
        stagger: { each: 0.03, from: 'start' },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onComplete: () => {
          // sundáme masku i will-change a uklidíme dočasné inline styly
          el.classList.remove('is-char-split')
          gsap.set(inners, { clearProps: 'filter,transform,opacity' })
        },
      }
    )
  })
}
