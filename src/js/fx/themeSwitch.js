/* ============ SYNAPSE — fx: adaptivní navigace nad tmavými sekcemi ============ */
/* Pro každou '.section-dark' vytvoří ScrollTrigger, který přebarví odkazy
   navigace na krémovou (třída 'nav-dark' na <html>) právě tehdy, když se pod
   horním pruhem navigace (~60px od vršku) nachází tmavá sekce.
   Využívá existující CSS pravidlo '.nav-dark .site-nav a { color: var(--cream) }'.
   Přepnutí více překrývajících se tmavých sekcí je řešeno přepočtem z aktivních
   triggerů — třída se tak nesundá předčasně. Toto je přepínání třídy (ne pohyb),
   proto zůstává aktivní i při prefers-reduced-motion. */

import '../../styles/fx/themeSwitch.css'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initThemeSwitch(root = document) {
  const doc = root.documentElement || document.documentElement
  const sections = root.querySelectorAll('.section-dark')
  if (!sections.length) return // bezpečný no-op, když na stránce žádná tmavá sekce není

  const triggers = []

  // Třída je aktivní, dokud je aktivní alespoň jeden trigger (tj. pod navigací
  // je aspoň jedna tmavá sekce). Přepočet z živých triggerů je odolný proti
  // dvojím/rychlým přepnutím při překryvu sousedních tmavých sekcí.
  const sync = () => {
    const anyDark = triggers.some((t) => t.isActive)
    doc.classList.toggle('nav-dark', anyDark)
  }

  sections.forEach((section) => {
    const t = ScrollTrigger.create({
      trigger: section,
      start: 'top 60px', // vršek sekce protne pruh navigace
      end: 'bottom 60px', // spodek sekce opustí pruh navigace
      onToggle: sync, // isActive se přepnul → přepočítej stav
    })
    triggers.push(t)
  })

  // počáteční stav (např. tmavá sekce hned pod navigací po načtení / obnově)
  sync()
}
