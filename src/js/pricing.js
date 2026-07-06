import { boot, gsap } from './main.js'
import '../styles/pages.css'
import '../styles/home.css'

boot()

// rotace citací (stejná jako na homepage)
const voices = document.querySelectorAll('.voice')
if (voices.length) {
  let v = 0
  setInterval(() => {
    const prev = voices[v]
    v = (v + 1) % voices.length
    gsap.to(prev, { opacity: 0, y: -14, duration: 0.5, ease: 'power2.in', onComplete: () => prev.classList.remove('is-active') })
    gsap.fromTo(voices[v], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.45, ease: 'power2.out', onStart: () => voices[v].classList.add('is-active') })
  }, 5000)
}
