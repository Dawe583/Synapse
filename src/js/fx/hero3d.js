/* ============ SYNAPSE — fx: dekorativní 3D wireframe (404) ============ */
/* Lehký dekorativní prvek POUZE na 404 stránce — bez externích knihoven,
   čistě Canvas 2D. Do sekce '.nf' injektuje <canvas> jako dekoraci ZA obsah
   (nízký z-index, obsah nad ním). Vykresluje pomalu rotující drátěný
   ikosaedr — vrcholy jsou ručně promítnuty z 3D do 2D (rotace kolem os X/Y
   + perspektivní projekce). Tenké tahy v barvě značky (--blue) s nízkou až
   střední opacitou dle hloubky — vkusné, editorial, nenápadné.

   Aktivní jen když existuje '.nf' (jinak okamžitý no-op) a jen když je k
   dispozici 2D kontext. Animace přes requestAnimationFrame; rotace pomalá;
   jemná reakce na pozici myši (naklonění) — jen na jemném pointeru (FINE).
   Respektuje devicePixelRatio (ostrost) a má resize handler (ResizeObserver).
   REDUCED: vykreslí jediný statický snímek, žádná RAF smyčka.
   Canvas je aria-hidden a pointer-events:none — nikdy neruší obsah 404. */

import '../../styles/fx/hero3d.css'
import { REDUCED, FINE } from '../effects.js'

/* ---------- geometrie ikosaedru (čistá matematika, bez DOM) ---------- */
// 12 vrcholů pomocí zlatého řezu; hrany dopočítáme podle nejkratší vzdálenosti.
const PHI = (1 + Math.sqrt(5)) / 2

const RAW = [
  [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
  [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
]

// normalizace na jednotkový poloměr, ať model sedí do promítacího prostoru
const NORM = Math.hypot(1, PHI) // = √(1+φ²) ≈ 1.902
const VERTS = RAW.map(([x, y, z]) => [x / NORM, y / NORM, z / NORM])

// hrany = dvojice vrcholů v minimální (hranové) vzdálenosti; ta je v RAW = 2
const EDGES = []
for (let i = 0; i < RAW.length; i++) {
  for (let j = i + 1; j < RAW.length; j++) {
    const dx = RAW[i][0] - RAW[j][0]
    const dy = RAW[i][1] - RAW[j][1]
    const dz = RAW[i][2] - RAW[j][2]
    if (Math.abs(dx * dx + dy * dy + dz * dz - 4) < 0.1) EDGES.push([i, j])
  }
}

export function initHero3d(root = document) {
  // aktivní jen na 404 — poznáme podle '.nf'; jinde okamžitý no-op
  const host = root.querySelector('.nf')
  if (!host) return
  // idempotence — nikdy nevznikne druhý canvas (init běží v boot() na každé stránce)
  if (host.querySelector(':scope > .fx-hero3d')) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return // bez 2D kontextu nic neinjektujeme — čistý no-op

  canvas.className = 'fx-hero3d'
  canvas.setAttribute('aria-hidden', 'true')
  // jako první dítě sekce; vizuální řazení (za obsah) řeší z-index/isolation v CSS
  host.insertBefore(canvas, host.firstChild)

  // barvu tahů bereme z tokenu značky, ať zůstane v souladu s :root
  const cs = getComputedStyle(document.documentElement)
  const BLUE = (cs.getPropertyValue('--blue').trim() || '#0D3479')

  let w = 0
  let h = 0
  let dpr = 1

  function resize() {
    const rect = host.getBoundingClientRect()
    w = rect.width
    h = rect.height
    // dpr kvůli ostrosti, ale strop 2 kvůli výkonu (retina/HiDPI)
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.round(w * dpr))
    canvas.height = Math.max(1, Math.round(h * dpr))
    // veškeré kreslení pak počítáme v CSS pixelech
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  // ---------- vykreslení jednoho snímku pro dané úhly rotace ----------
  function draw(ax, ay) {
    if (w <= 0 || h <= 0) return
    ctx.clearRect(0, 0, w, h)

    const cx = w / 2
    const cy = h / 2
    const radius = Math.min(w, h) * 0.26 // poloměr modelu v px
    const focal = 2.7 // vzdálenost kamery (v jednotkách poloměru modelu)

    const sinX = Math.sin(ax)
    const cosX = Math.cos(ax)
    const sinY = Math.sin(ay)
    const cosY = Math.cos(ay)

    // promítnutí všech vrcholů: rotace kolem Y, pak X, pak perspektiva
    const P = new Array(VERTS.length)
    for (let i = 0; i < VERTS.length; i++) {
      const vx = VERTS[i][0]
      const vy = VERTS[i][1]
      const vz = VERTS[i][2]
      // rotace kolem osy Y
      const x1 = vx * cosY + vz * sinY
      const z1 = -vx * sinY + vz * cosY
      // rotace kolem osy X
      const y2 = vy * cosX - z1 * sinX
      const z2 = vy * sinX + z1 * cosX
      // perspektivní projekce (vyšší z = blíž kameře = větší)
      const scale = focal / (focal - z2)
      P[i] = {
        x: cx + x1 * radius * scale,
        y: cy - y2 * radius * scale,
        z: z2, // -1..1, hloubka pro fade
      }
    }

    // hrany — tenké modré linky, opacita dle hloubky (bližší = sytější)
    ctx.strokeStyle = BLUE
    ctx.lineWidth = 1.1
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    for (let e = 0; e < EDGES.length; e++) {
      const a = P[EDGES[e][0]]
      const b = P[EDGES[e][1]]
      const zMid = (a.z + b.z) / 2 // -1..1
      // nízká až střední opacita: ~0.10 (vzadu) → ~0.40 (vepředu)
      ctx.globalAlpha = 0.1 + ((zMid + 1) / 2) * 0.3
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }

    // jemné tečky ve vrcholech — drobný editorial detail
    ctx.fillStyle = BLUE
    for (let i = 0; i < P.length; i++) {
      ctx.globalAlpha = 0.16 + ((P[i].z + 1) / 2) * 0.34
      ctx.beginPath()
      ctx.arc(P[i].x, P[i].y, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = 1
  }

  // výchozí naklopení — hezký, čitelný pohled na tvar
  const baseX = 0.35
  const baseY = 0.6

  resize()

  // ResizeObserver drží canvas i model v souladu s velikostí sekce
  const ro = new ResizeObserver(() => {
    resize()
    if (REDUCED) draw(baseX, baseY) // po resize přerýsuj statický snímek
  })
  ro.observe(host)

  // REDUCED: jediný statický snímek, žádná smyčka
  if (REDUCED) {
    draw(baseX, baseY)
    return
  }

  // ---------- animace ----------
  let rotX = baseX
  let rotY = baseY
  // cílový a aktuální náklon od myši (jen FINE) — jemný lerp
  let tiltTargetX = 0
  let tiltTargetY = 0
  let tiltX = 0
  let tiltY = 0

  if (FINE) {
    window.addEventListener(
      'mousemove',
      (ev) => {
        const nx = (ev.clientX / window.innerWidth) * 2 - 1 // -1..1
        const ny = (ev.clientY / window.innerHeight) * 2 - 1
        tiltTargetY = nx * 0.45 // náklon kolem Y podle vodorovné pozice
        tiltTargetX = ny * 0.35 // náklon kolem X podle svislé pozice
      },
      { passive: true }
    )
  }

  let raf = 0
  function loop() {
    // pomalá základní rotace (tumbling kolem dvou os)
    rotY += 0.0016
    rotX += 0.0009
    // dojíždění náklonu myši k cíli
    tiltX += (tiltTargetX - tiltX) * 0.06
    tiltY += (tiltTargetY - tiltY) * 0.06
    draw(rotX + tiltX, rotY + tiltY)
    raf = requestAnimationFrame(loop)
  }

  const start = () => {
    if (!raf) raf = requestAnimationFrame(loop)
  }
  const stop = () => {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  // šetři výkon, když je záložka skrytá
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else start()
  })

  start()
}
