# Návrh animačních a efektových vylepšení — Synapse

Detailní, realizovatelný návrh, jak web posunout animačně a efektově.
Vše navazuje na **stávající stack** (GSAP 3 + ScrollTrigger + Lenis), aby se
nemusely přidávat nové závislosti a aby efekty držely jednotný „editorial"
charakter šablony (modrá `#0D3479` / krémová `#EEEDE4`, verzálky, ostrá typografie).

Každý bod má: **Kde** (sekce/soubor) · **Co** · **Jak** (implementace) ·
**Náročnost** (S/M/L) · **Dopad**.

---

## 0. Co web už umí (výchozí stav)

Aby návrh nezdvojoval hotové věci — tohle už běží:

| Efekt | Kde | Soubor |
|---|---|---|
| Smooth scroll (Lenis) | globálně | `main.js` |
| Word-by-word reveal nadpisů (maska) | `.h-section`, `.page-hero h1`, `.wd-sec h2` | `initHeadReveals` |
| Flip slov v nadpisech | `.fw[data-word]` | `initFlipWords` |
| Parallax velkých obrázků | `.about-photo-big`, `.process-img`, `.wd-wide`… | `initParallax` |
| Clip-path reveal obrázků zespodu | `[data-reveal]` | `initReveals` |
| Fade-up bloků | `[data-fade]` | `initFades` |
| Marquee (horizontální/vertikální) | `.marquee-track` | `initMarquees` |
| Skrytí navigace při scrollu dolů | `.site-nav` | `injectChrome` |
| Pin + scrub stack služeb | `.services-stage` | `home.js` |
| Plovoucí náhled u kurzoru | `.work-list` | `home.js` |
| Letter-stagger + parallax wordmarku | `.wordmark` | `home.js` |
| Cyklující decky, rotace referencí | hero, reference | `home.js` |

Základ je tedy silný. Návrh níže cílí na **místa, kde je scroll zatím „mrtvý"**
(podstránky, přechody), na **jemnější mikrointerakce** a na pár **efektních
„wow" momentů**, které web posunou z „hezké šablony" do „zapamatovatelného".

---

## 1. Principy (platí pro všechno níže)

1. **`prefers-reduced-motion`** — každý netriviální efekt musí mít fallback.
   Navrhuji jeden centrální helper (viz §7), který transformace/scrub vypne a
   nechá jen opacity, případně finální stav.
2. **Nikdy neblokovat obsah** — text musí být čitelný i bez JS. Reveal animace
   startují z viditelného/„skoro hotového" stavu, ne z `opacity: 0` napevno v CSS
   bez JS pojistky (dnes to řeší `[data-fade]`/`is-splitting` — držet ten vzor).
3. **Výkon** — animovat jen `transform` a `opacity` (GPU), `will-change` pouze po
   dobu animace. U scrubů používat `ScrollTrigger` s `scrub: true` a
   společný Lenis ticker (už je zapojený).
4. **Konzistence easingů** — sjednotit na 2–3 křivky: `power3.out` (vstupy),
   `power4.out` (výraznější), `cubic-bezier(0.65,0,0.35,1)` (UI/hover, už se
   používá). Zavést je jako konstanty.

---

## 2. Reveal textu (rozšíření toho, co už máme)

### 2.1 Znakový reveal klíčových nadpisů „display"
- **Kde:** `.wordmark` (už má letter-stagger), nově `.ab-name`, `.finale-contact`,
  `.page-hero h1` na detailech.
- **Co:** Písmena/části vyjíždějí zpoza masky s jemným rozostřením a `stagger`.
  Oproti dnešnímu word-revealu jde o **znakovou** granularitu jen u těch
  největších „hero" nápisů → působí prémiověji.
- **Jak:** Rozdělit na znaky (jako už `home.js` dělá u wordmarku), obalit
  `.wmask`, animovat `yPercent: 110 → 0` + `filter: blur(8px) → 0`,
  `stagger: { each: 0.03, from: 'start' }`. Sdílet s existující `initHeadReveals`
  přes parametr „granularita: word | char".
- **Náročnost:** S · **Dopad:** vysoký (hero momenty).

### 2.2 Řádkový „clip-wipe" u perexů a lead odstavců
- **Kde:** `.bp-perex`, `.wd-lead`, `.pr-hero p.sub`, `.ab-sub`.
- **Co:** Odstavec se odkryje po řádcích shora dolů (maska), místo prostého fade.
- **Jak:** Rozdělit na řádky (měřením `getClientRects()` nebo lehčí variantou:
  po slovech s `overflow: hidden` na řádkovém wrapperu), animovat `yPercent`
  s `stagger`. Alternativa bez měření: `clip-path: inset(0 0 100% 0) → inset(0)`.
- **Náročnost:** M · **Dopad:** střední (zjemní podstránky).

### 2.3 Zvýraznění „flip slov" barvou při dokončení
- **Kde:** `.fw` v nadpisech (dnes jen posun).
- **Co:** V momentě dopadu druhého slova krátce probliknout `--accent`
  (`#0000EE`) → doskočit na `--muted`. Malý detail, ale „oživí" nadpisy.
- **Jak:** Do timeline v `initFlipWords` přidat `.to(b, { color })` na konci.
- **Náročnost:** S · **Dopad:** nízký/kosmetický.

---

## 3. Scroll-driven efekty (největší prostor ke zlepšení)

### 3.1 Horizontální „pin" galerie u vybraných projektů
- **Kde:** `.work-collage` na homepage (dnes statická mřížka).
- **Co:** Sekce se připne a kolekce projektů projede **horizontálně** podle
  vertikálního scrollu (klasický editorial „pinned horizontal scroll").
- **Jak:** `ScrollTrigger` s `pin: true`, `scrub: 1`, `end: '+=' + trackWidth`,
  animace `x` tracku od 0 do `-(track - viewport)`. Na mobilu vypnout
  (`matchMedia`), nechat vertikální mřížku.
- **Náročnost:** M · **Dopad:** vysoký (signature moment).

### 3.2 Scrub „reveal řádků" v seznamu projektů / zkušeností
- **Kde:** `.work-list li`, `.xp-row`, `.ab-jr` (řádkové tabulky).
- **Co:** Řádky nalétnou zdola s `stagger`, jak sekce vstupuje do viewportu
  (batch, ne každý zvlášť).
- **Jak:** `ScrollTrigger.batch('.work-list li', { onEnter: b => gsap.from(b,
  { yPercent: 40, opacity: 0, stagger: 0.06, ease: 'power3.out' }) })`.
- **Náročnost:** S · **Dopad:** střední (podstránky ožijí).

### 3.3 Count-up statistik
- **Kde:** `.ab-stats .ab-stat p` (about), čísla v `.finale-year`.
- **Co:** Čísla „naskáčou" z 0 na cílovou hodnotu, když vjedou do viewportu.
- **Jak:** `gsap.to({v:0}, { v: target, snap:{v:1}, onUpdate, scrollTrigger })`.
  Cílovou hodnotu držet v `data-count`, aby to fungovalo i s příponami („+", „%").
- **Náročnost:** S · **Dopad:** střední (statistiky vždy táhnou pozornost).

### 3.4 Scroll-progress indikátor
- **Kde:** globálně (tenký proužek pod/nad navigací) + **na blog detailu**
  jako „reading progress".
- **Co:** Lineární ukazatel postupu čtení/stránky v `--accent`.
- **Jak:** `ScrollTrigger` na `body`/`.bp-article`, `scaleX` proužku podle
  `self.progress`. Napojit na Lenis (už je synchronní).
- **Náročnost:** S · **Dopad:** střední (UX + prémiový pocit).

### 3.5 Parallax vrstvení v hero a finále
- **Kde:** `.hero-deck` vs `.wordmark`, `.finale-col` sloupce.
- **Co:** Různé rychlosti scrollu pro popředí/pozadí → hloubka.
- **Jak:** Rozšířit `initParallax` o `data-parallax="0.2"` faktor (dnes má fixní
  ±40px). Každý prvek dostane vlastní rozsah.
- **Náročnost:** S · **Dopad:** střední.

### 3.6 Sticky „theme switch" mezi sekcemi
- **Kde:** přechod světlá → `.section-dark` (expertiza, hodnoty).
- **Co:** Barva pozadí + navigace plynule přechází, jak tmavá sekce vstupuje.
- **Jak:** `ScrollTrigger` mění CSS proměnnou pozadí a přepíná `nav-dark`
  třídu (už existuje) místo tvrdého střihu. `toggleClass`/`onToggle`.
- **Náročnost:** M · **Dopad:** střední/vysoký (plynulost celku).

---

## 4. Hover & mikrointerakce

### 4.1 Magnetická tlačítka a šipkové odkazy
- **Kde:** `.btn-pill`, `.link-arrow`, `.finale-contact` (šipka už reaguje).
- **Co:** Prvek se lehce „přitáhne" ke kurzoru (magnetic hover).
- **Jak:** `mousemove` v rámci prvku → `gsap.quickTo` na `x/y` s malým rozsahem
  (±6–10px), reset na `mouseleave`. Jen `pointer: fine`.
- **Náročnost:** S · **Dopad:** střední (prémiový pocit).

### 4.2 Řádkový hover v seznamech s „line wipe"
- **Kde:** `.work-list a` (dnes jen posun + barva), `.footer-col a`.
- **Co:** Zleva se podtáhne linka / prosvítí pozadí; text swap už existuje.
- **Jak:** Pseudo-element `::after` se `scaleX(0)→1` a `transform-origin`
  přehazovaný podle směru vstupu myši.
- **Náročnost:** S · **Dopad:** nízký/střední.

### 4.3 Obrázkové karty — „reveal detailu" na hover
- **Kde:** `.wk-card`, `.blog-card`, `.bl-card` (dnes grayscale→barva + zoom).
- **Co:** Přidat jemný náklon (tilt) podle pozice kurzoru a odkrytí titulku
  zpoza masky.
- **Jak:** `rotateX/rotateY` (max ±4°) z pozice myši, `perspective` na wrapperu;
  titulek `translateY` zpoza `overflow:hidden`. Vypnout na dotyku.
- **Náročnost:** M · **Dopad:** střední.

### 4.4 Vlastní kurzor (volitelně)
- **Kde:** globálně, primárně nad `.work-collage`, `.wk-card`.
- **Co:** Malý kruh/tečka následující kurzor, který se u odkazů zvětší a ukáže
  „Zobrazit" (navazuje na styl `.wk-view`).
- **Jak:** Fixed element + `gsap.quickTo`, `mix-blend-mode: difference` pro
  čitelnost na obou barvách. **Jen** `pointer: fine`, s reduced-motion vypnout.
- **Náročnost:** M · **Dopad:** vysoký vizuálně, ale „na efekt" — zvážit vkusně.

---

## 5. Přechody mezi stránkami & načítání

### 5.1 Preloader / intro homepage
- **Kde:** první návštěva `index.html`.
- **Co:** Krátká krycí vrstva v `--blue`, přes ni „SYNAPSE" (odkaz na wordmark),
  po `load` se vysune nahoru clip-wipe a spustí hero entrance (už existuje
  `gsap.from('.hero-deck'...)`).
- **Jak:** Fixed overlay, timeline na `window.load`; `sessionStorage` flag, aby
  se nespouštěl při každé navigaci zpět. Respektovat reduced-motion (jen fade).
- **Náročnost:** M · **Dopad:** vysoký (silný první dojem).

### 5.2 Přechody mezi stránkami (barevný wipe)
- **Kde:** všechny interní `<a>` (nav, karty projektů, „další projekt").
- **Co:** Při kliknutí přejede přes obsah barevná deska, pak se načte cílová
  stránka a deska odjede — plynulé místo tvrdého reloadu.
- **Jak:** Dvě cesty:
  - **Lehká (bez SPA):** overlay animace na `click` → po dokončení `location.href`;
    na nové stránce overlay „odjede" v `boot()`. Jednoduché, funguje s MPA.
  - **Plná:** doplnit lehký page-transition router (např. Taxi.js/Barba) —
    větší zásah, ale umožní i persistentní nav a „shared element" přechody.
  Doporučuji začít lehkou variantou.
- **Náročnost:** M (lehká) / L (plná) · **Dopad:** vysoký.

### 5.3 „Shared element" u detailu projektu (návazně na 5.2 plnou)
- **Kde:** `.wk-card` → `.wd-main` hero na detailu.
- **Co:** Kliknutý obrázek karty „doletí" na pozici hero obrázku detailu.
- **Jak:** FLIP (GSAP Flip plugin) — změřit start/cíl, animovat rozdíl.
  Vyžaduje page-transition router (5.2 plná).
- **Náročnost:** L · **Dopad:** velmi vysoký (portfolio „highlight").

---

## 6. Speciální momenty

### 6.1 „Živé" pozadí sekce hero / finále
- **Co:** Velmi jemný zrnitý/šumový gradient nebo pomalu se posouvající
  linky/mřížka v pozadí (respektuje barevnost).
- **Jak:** CSS `@keyframes` na `background-position` nebo lehké `<canvas>`
  zrno; držet nízkou intenzitu, `prefers-reduced-motion` → statické.
- **Náročnost:** M · **Dopad:** střední.

### 6.2 Interaktivní 3D prvek (volitelný „wow")
- **Kde:** hero nebo 404.
- **Co:** Lehký 3D objekt reagující na myš/scroll (např. rotující tvar v barvě
  značky). V projektu je dostupný **Three.js 3D Viewer** (MCP) pro prototypizaci.
- **Jak:** Samostatný `<canvas>`, líné načtení (dynamic import), fallback obrázek.
  Zvážit hmotnost — jen pokud to koncepčně sedne.
- **Náročnost:** L · **Dopad:** vysoký, ale drahý — až jako fáze 3.

---

## 7. Technické lešení (doporučeno udělat jako první)

Než se přidají efekty, vyplatí se drobná infrastruktura v `main.js`:

```js
// jedno místo pro reduced-motion
export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches

// sdílené easingy
export const EASE = {
  in:   'power3.out',
  hero: 'power4.out',
  ui:   'cubic-bezier(0.65,0,0.35,1)',
}

// bezpečný wrapper: s reduced-motion jen doskočí na cílový stav
export function anim(target, vars) {
  if (REDUCED) { const { scrollTrigger, ...end } = vars; return gsap.set(target, end) }
  return gsap.to(target, vars)
}
```

- Přidat `ScrollTrigger.config({ ignoreMobileResize: true })` a
  `gsap.config({ nullTargetWarn: false })`.
- `data-*` API pro nové efekty (`data-parallax`, `data-count`, `data-reveal="lines"`)
  → aby se efekty přidávaly do HTML deklarativně, bez psaní JS pro každý výskyt.
- Po každém dynamickém mountu (FAQ/blog) volat `ScrollTrigger.refresh()`.

---

## 8. Doporučené pořadí realizace (roadmapa)

**Fáze 1 — rychlé výhry (1 dávka, nízké riziko)**
- §7 lešení (reduced-motion, easingy, `anim()`)
- 3.2 batch-reveal řádků (work-list, xp, journey)
- 3.3 count-up statistik
- 3.4 scroll-progress (globální + blog reading progress)
- 4.1 magnetická tlačítka/odkazy
- 2.3 barevný záblesk flip-slov

**Fáze 2 — signature efekty**
- 3.1 horizontální pin galerie projektů
- 5.1 preloader / hero intro
- 5.2 (lehká) barevný wipe mezi stránkami
- 3.6 sticky theme-switch u tmavých sekcí
- 2.1 znakový reveal hero nápisů

**Fáze 3 — prémiové / dražší**
- 5.2 (plná) + 5.3 shared-element FLIP na detail projektu
- 4.4 vlastní kurzor
- 4.3 tilt karet
- 6.1 živé pozadí
- 6.2 3D prvek (jen pokud koncept sedne)

---

## 9. Odhad přínosu vs. náročnost (shrnutí)

| Efekt | Náročnost | Dopad | Fáze |
|---|:--:|:--:|:--:|
| Lešení (reduced-motion, easingy) | S | — (základ) | 1 |
| Batch reveal řádků | S | ●●○ | 1 |
| Count-up statistik | S | ●●○ | 1 |
| Scroll-progress / reading bar | S | ●●○ | 1 |
| Magnetická tlačítka | S | ●●○ | 1 |
| Horizontální pin galerie | M | ●●● | 2 |
| Preloader / hero intro | M | ●●● | 2 |
| Barevný wipe mezi stránkami (lehký) | M | ●●● | 2 |
| Sticky theme-switch | M | ●●○ | 2 |
| Znakový reveal hero nápisů | S | ●●● | 2 |
| Shared-element FLIP na detail | L | ●●● | 3 |
| Vlastní kurzor | M | ●●○ | 3 |
| Tilt karet | M | ●●○ | 3 |
| Živé pozadí / 3D | L | ●●○ | 3 |

Legenda dopadu: ●●● vysoký · ●●○ střední · ●○○ kosmetický.

---

Vše výše je stavěné na **stávajícím GSAP + ScrollTrigger + Lenis**, takže žádná
nová runtime závislost (kromě volitelných GSAP pluginů Flip/SplitText a případně
Three.js) není potřeba. Doporučuji začít **Fází 1** — je to nízké riziko, rychlé
a hned to zvedne „pocit" celého webu.
