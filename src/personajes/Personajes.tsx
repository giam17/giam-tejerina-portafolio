import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { decodeImages, responsiveImage } from '../assets/images'
import llorando from '../assets/personajes/warrior-crying.webp'
import enojado from '../assets/personajes/angry.webp'
import ataque from '../assets/personajes/warrior-attack.webp'
import asustado from '../assets/personajes/surprised.webp'
import triste from '../assets/personajes/sad.webp'
import defensa from '../assets/personajes/warrior-defense.webp'
import victoria from '../assets/personajes/warrior-victory.webp'
import feliz from '../assets/personajes/happy.webp'
import nube from '../assets/personajes/cloud.webp'
import trazos from '../assets/personajes/traces-emotions.svg?raw'
import trazos2 from '../assets/personajes/traces-warrior.svg?raw'
import separador from '../assets/shared/divider-wave-blue.svg'
import './personajes.css'

// The PNG exports already include Figma's flips and rotations.
const illustrations = [
  { id: 'victoria', group: 'header', order: 0, src: victoria, x: 580, y: 37, width: 604, height: 604, alt: 'Guerrero celebrando con su espada' },
  { id: 'asustado', group: 'header', order: 0, src: asustado, x: 993, y: 296, width: 425, height: 425, alt: 'Personaje con expresión de sorpresa' },
  { id: 'enojado', group: 'emotions', order: 0, src: enojado, x: 53, y: 800, width: 416.6, height: 416.6, alt: 'Personaje enojado' },
  { id: 'triste', group: 'emotions', order: 1, src: triste, x: 349, y: 845, width: 318, height: 318, alt: 'Personaje triste' },
  { id: 'feliz', group: 'emotions', order: 2, src: feliz, x: 591, y: 788, width: 431.8, height: 431.8, alt: 'Personaje feliz' },
  // SVG export bounds include one extra pixel for the centered 2 px strokes.
  { id: 'trazos', group: 'emotions', order: 0, src: trazos, x: 111.897491, y: 829.19873, width: 885, height: 371, alt: '' },
  { id: 'ataque', group: 'warrior', order: 1, src: ataque, x: 732, y: 1271, width: 339, height: 339, alt: 'Guerrero atacando' },
  { id: 'defensa', group: 'warrior', order: 2, src: defensa, x: 893, y: 1275, width: 335, height: 335, alt: 'Guerrero defendiéndose con su escudo' },
  { id: 'trazos2', group: 'warrior', order: 0, src: trazos2, x: 388.264954, y: 1261.351074, width: 901, height: 384, alt: '' },
  { id: 'llorando', group: 'warrior', order: 0, src: llorando, x: 349, y: 1271, width: 336, height: 336, alt: 'Guerrero llorando' },
] as const
const clouds = [
  { x: 986, y: 37, width: 430, height: 242, opacity: 1, mirror: false },
  { x: -33, y: 449, width: 430, height: 242, opacity: .9, mirror: false },
  { x: 477, y: 338, width: 430, height: 242, opacity: .78, mirror: false },
  { x: 807, y: 691, width: 425.5, height: 239.47, opacity: .7, mirror: false },
  { x: 48, y: 1110, width: 425.5, height: 239.47, opacity: .7, mirror: false },
  { x: 909, y: 1099, width: 430, height: 242, opacity: .9, mirror: false },
  { x: 160, y: 1498, width: 430, height: 242, opacity: .9, mirror: true },
  { x: 1124, y: 1549, width: 425.5, height: 239.47, opacity: .7, mirror: true },
]
const labels = [
  { id: 'enojado', text: 'ENOJADO', x: 1061, y: 871, width: 222 },
  { id: 'triste', text: 'TRISTE', x: 1061, y: 969, width: 222 },
  { id: 'feliz', text: 'FELIZ', x: 1061, y: 1067, width: 222 },
  { id: 'llorando', text: 'LLORANDO', x: 98, y: 1322, width: 244 },
  { id: 'ataque', text: 'ATAQUE', x: 98, y: 1420, width: 222 },
  { id: 'defensa', text: 'DEFENSA', x: 98, y: 1518, width: 222 },
]

type Art = typeof illustrations[number]
type Panel = 'emotions' | 'warrior'
const tracePaths = Object.fromEntries(illustrations.filter(art => !art.alt).map(art => [art.id,
  Array.from(art.src.matchAll(/<path\b[^>]*\bd="([^"]*)"/g), match => match[1]),
]))
const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

function HeroArtwork({ art, still }: { art: Art, still: boolean }) {
  const image = useRef<HTMLImageElement>(null)
  const targetRotate = useMotionValue(0)
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const rotate = useSpring(targetRotate, { stiffness: 150, damping: 24 })
  const x = useSpring(targetX, { stiffness: 150, damping: 24 })
  const y = useSpring(targetY, { stiffness: 150, damping: 24 })
  const reset = () => { targetRotate.set(0); targetX.set(0); targetY.set(0) }
  useEffect(() => {
    const clear = () => { targetRotate.set(0); targetX.set(0); targetY.set(0) }
    if (still) clear()
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    return () => { window.removeEventListener('blur', clear); document.removeEventListener('visibilitychange', clear) }
  }, [still, targetRotate, targetX, targetY])
  const track = (event: PointerEvent<HTMLImageElement>) => {
    if (still || event.pointerType !== 'mouse' || !canHover() || !image.current) return
    const bounds = image.current.parentElement!.parentElement!.getBoundingClientRect()
    const clamp = (value: number) => Math.max(-1, Math.min(1, value))
    const horizontal = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1)
    const vertical = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1)
    targetRotate.set(horizontal * 3)
    targetX.set(horizontal * 3)
    targetY.set(vertical * 2)
  }
  return <motion.div className="characters-tracking" style={{ rotate, x, y }}>
    <img ref={image} src={art.src} {...responsiveImage(art.src)} alt={art.alt} width={art.width} height={art.height} draggable={false} onPointerMove={track} onPointerLeave={reset} onPointerCancel={reset} />
  </motion.div>
}

export function Personajes() {
  const host = useRef<HTMLDivElement>(null)
  const emotionsPanel = useRef<HTMLDivElement>(null)
  const warriorPanel = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const reducedMotion = useReducedMotion()
  const still = Boolean(reducedMotion) || new URLSearchParams(window.location.search).get('motion') === 'off'
  const [visible, setVisible] = useState<Record<Panel, boolean>>({ emotions: false, warrior: false })
  const [inView, setInView] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const active = hovered ?? focused
  const highlight = (event: PointerEvent, id: string) => {
    if (event.pointerType === 'mouse' && canHover()) setHovered(id)
  }
  useLayoutEffect(() => {
    const element = host.current
    if (!element) return
    const measure = () => setScale(element.getBoundingClientRect().width / 1440)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (still || !host.current) return
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)))
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [still])
  useEffect(() => {
    if (still || !host.current) return
    let live = true
    const root = host.current
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const group: Panel = entry.target === emotionsPanel.current ? 'emotions' : 'warrior'
        observer.unobserve(entry.target)
        // Start only after the large exports are decoded, so their entrance is visible on first load.
        const images = [...root.querySelectorAll<HTMLImageElement>(`[data-group="${group}"] img`)]
        Promise.all([document.fonts.ready, decodeImages(images)]).then(() => {
          if (live) setVisible(previous => ({ ...previous, [group]: true }))
        })
      }
    }, { threshold: .18 })
    if (emotionsPanel.current) observer.observe(emotionsPanel.current)
    if (warriorPanel.current) observer.observe(warriorPanel.current)
    return () => { live = false; observer.disconnect() }
  }, [still])
  useEffect(() => {
    const clear = () => setHovered(null)
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    return () => { window.removeEventListener('blur', clear); document.removeEventListener('visibilitychange', clear) }
  }, [])
  useEffect(() => {
    if (window.location.hash !== '#personajes') return
    let active = true
    document.fonts.ready.then(() => {
      if (active) host.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    return () => { active = false }
  }, [])
  const renderArt = (art: Art) => {
    const entered = still || art.group === 'header' || visible[art.group]
    const bounds = { left: art.x, top: art.y, width: art.width, height: art.height }
    if (!art.alt) return <svg key={art.id} className="characters-art characters-traces" data-visible={entered} style={bounds} width={art.width} height={art.height} viewBox={`0 0 ${art.width} ${art.height}`} fill="none" aria-hidden="true">
      {tracePaths[art.id].map((d, index) => <path key={index} d={d} pathLength={1} stroke="#76716D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ '--trace-delay': `${index * 65}ms` } as CSSProperties} />)}
    </svg>
    return <div key={art.id} id={`character-${art.id}`} className="characters-art characters-figure" data-group={art.group} data-visible={entered} data-active={active === art.id} style={bounds} onPointerEnter={event => highlight(event, art.id)} onPointerLeave={() => setHovered(null)} onPointerCancel={() => setHovered(null)}>
      <div className="characters-entry" style={{ '--entry-delay': `${art.order * 140}ms` } as CSSProperties}>
        <div className="characters-zoom">
          {art.id === 'victoria' ? <HeroArtwork art={art} still={still} /> : <img src={art.src} {...responsiveImage(art.src)} alt={art.alt} width={art.width} height={art.height} draggable={false} />}
        </div>
      </div>
    </div>
  }
  const renderLabels = (panel: Panel) => <ul className="characters-labels">{labels.filter(label => ['enojado', 'triste', 'feliz'].includes(label.id) === (panel === 'emotions')).map(label => <li key={label.id} style={{ left: label.x, top: label.y, width: label.width }}>
    <button type="button" aria-controls={`character-${label.id}`} aria-label={`Destacar personaje: ${label.text.toLowerCase()}`} data-active={active === label.id} onPointerEnter={event => highlight(event, label.id)} onPointerLeave={() => setHovered(null)} onPointerCancel={() => setHovered(null)} onFocus={() => setFocused(label.id)} onBlur={() => setFocused(null)}><span>{label.text}</span></button>
  </li>)}</ul>
  return <div ref={host} className="characters-host" style={{ height: 1776 * scale }}>
    <section id="personajes" className="characters-composition" aria-labelledby="characters-title" data-figma-node="1:229" data-motion={still ? 'off' : 'on'} data-in-view={inView} style={{ transform: `scale(${scale})` }}>
      <div className="characters-clouds" aria-hidden="true">
        {clouds.map((cloud, index) => <div key={index} className="characters-cloud" style={{ left: cloud.x, top: cloud.y, width: cloud.width, height: cloud.height, opacity: cloud.opacity, '--cloud-duration': `${6 + index * .4}s`, '--cloud-delay': `${-index * .9}s`, '--cloud-travel-x': `${index % 2 === 0 ? 24 : -24}px` } as CSSProperties}>
          <img src={nube} {...responsiveImage(nube)} alt="" style={{ transform: cloud.mirror ? 'scaleX(-1)' : undefined }} />
        </div>)}
      </div>
      <img className="characters-divider" src={separador} alt="" aria-hidden="true" />
      <div className="characters-category"><span>03 / ILUSTRACIÓN<br /><br />{'         '}Y DISEÑO</span></div>
      <h2 id="characters-title">PEQUEÑOS<br />PERSONAJES.<br />GRANDES IDEAS.</h2>
      <div className="characters-description-panel" />
      <p className="characters-description">
        <span>En mis tiempos libres disfruto diseñar</span>{' '}
        <span>personajes 2D, explorando estilos, expresiones</span>{' '}
        <span>y formas que me permitan experimentar con</span>{' '}
        <span>nuevas ideas visuales y desarrollar mi</span>{' '}
        <span>creatividad.</span>
      </p>
      <div className="characters-artwork-group" data-panel="header">{illustrations.filter(art => art.group === 'header').map(renderArt)}</div>
      <h3 className="characters-sketch-title">BOCETOS</h3>
      <div className="characters-artwork-group" data-panel="emotions">
        <div ref={emotionsPanel} className="characters-panel characters-emotions-panel" />
        {illustrations.filter(art => art.group === 'emotions').map(renderArt)}
        {renderLabels('emotions')}
      </div>
      <div className="characters-artwork-group" data-panel="warrior">
        <div ref={warriorPanel} className="characters-panel characters-warrior-panel" />
        {illustrations.filter(art => art.group === 'warrior').map(renderArt)}
        {renderLabels('warrior')}
      </div>
    </section>
  </div>
}
