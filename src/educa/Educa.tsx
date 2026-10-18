import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { decodeImages, responsiveImage } from '../assets/images'
import logo from '../assets/educa/logo-educa.webp'
import panorama from '../assets/educa/panorama-sucre.webp'
import iglesia from '../assets/educa/church-sucre.webp'
import patio from '../assets/educa/courtyard-sucre.webp'
import ciudad from '../assets/educa/city-sucre.webp'
import construccion from '../assets/educa/logo-construction.webp'
import noche from '../assets/educa/u-night.webp'
import edificios from '../assets/educa/u-buildings.webp'
import monumento from '../assets/educa/u-monument.webp'
import marcaNegra from '../assets/educa/logo-black.webp'
import marcaBlanca from '../assets/educa/logo-white.webp'
import separador from '../assets/educa/divider-wave.svg'
import './educa.css'

// These 5× exports already include the Figma crops and image compositions.
const images = [
  { node: '1:305', src: logo, x: 575, y: 566, width: 300, height: 300, alt: 'Logotipo de EDUCA inspirado en las torres y los cerros de Sucre' },
  { node: '1:306', src: iglesia, x: 41, y: 1784, width: 440, height: 293, alt: 'Torres de una iglesia colonial de Sucre' },
  { node: '1:307', src: panorama, x: 0, y: 934, width: 1440, height: 515, alt: 'Vista panorámica de los tejados y las iglesias de Sucre' },
  { node: '1:308', src: patio, x: 500, y: 1784, width: 439, height: 293, alt: 'Patio colonial y torre de una iglesia de Sucre' },
  { node: '1:309', src: ciudad, x: 958, y: 1784, width: 439, height: 293, alt: 'Arquitectura y cerros de la ciudad de Sucre' },
  { node: '1:310', src: construccion, x: 261, y: 1994, width: 782, height: 782, alt: 'Construcción del logotipo desde la letra U y tipografía ADLaM Display' },
  { node: '1:311', src: noche, x: 207, y: 2710, width: 311, height: 392, alt: 'Letra U con una fotografía nocturna de Sucre' },
  { node: '1:312', src: edificios, x: 592, y: 2710, width: 316, height: 392, alt: 'Letra U con una fotografía de arquitectura colonial' },
  { node: '1:313', src: monumento, x: 949, y: 2538, width: 370, height: 564, alt: 'Letra U con una fotografía de un monumento de Sucre' },
  { node: '1:314', src: marcaNegra, x: 423, y: 3191, width: 229, height: 330, alt: 'Versión negra del logotipo de EDUCA' },
  { node: '55:10', src: marcaBlanca, x: 709, y: 3175, width: 361, height: 361, alt: 'Versión blanca del logotipo de EDUCA sobre fondo negro' },
]

type ImageData = typeof images[number]
type Reveal = 'title' | 'logo' | 'construction'
const photoNodes = new Set(['1:306', '1:308', '1:309'])
const letterNodes = ['1:311', '1:312', '1:313']
const markNodes = new Set(['1:314', '55:10'])
const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
const bounds = (image: ImageData) => ({ left: image.x, top: image.y, width: image.width, height: image.height })
function Artwork({ image, decorative = false }: { image: ImageData, decorative?: boolean }) {
  const mobileSizes = image.node === '1:305' ? 'min(60vw, 300px)' : image.node === '1:307' ? '100vw' : image.node === '1:306' || image.node === '1:310' ? 'calc(100vw - 40px)' : letterNodes.includes(image.node) ? 'calc(33.333vw - 24px)' : 'calc(50vw - 28px)'
  return <img className="educa-image" src={image.src} {...responsiveImage(image.src, { mobileSizes })} width={image.width} height={image.height} alt={decorative ? '' : image.alt} data-figma-node={image.node} draggable={false} />
}

function TiltPhoto({ image, still }: { image: ImageData, still: boolean }) {
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const rotateX = useSpring(targetX, { stiffness: 180, damping: 25 })
  const rotateY = useSpring(targetY, { stiffness: 180, damping: 25 })
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reset = () => { targetX.set(0); targetY.set(0) }
  useEffect(() => {
    const clear = () => { targetX.set(0); targetY.set(0); setHovered(false) }
    if (still) clear()
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    return () => { window.removeEventListener('blur', clear); document.removeEventListener('visibilitychange', clear) }
  }, [still, targetX, targetY])
  const track = (event: PointerEvent<HTMLDivElement>) => {
    if (still || event.pointerType !== 'mouse' || !canHover()) return
    const rect = event.currentTarget.getBoundingClientRect()
    const clamp = (value: number) => Math.max(-1, Math.min(1, value))
    targetY.set(clamp((event.clientX - rect.left) / rect.width * 2 - 1) * 3.5)
    targetX.set(-clamp((event.clientY - rect.top) / rect.height * 2 - 1) * 3)
  }
  return <div className="educa-art educa-photo" data-educa-slot={image.node} style={bounds(image)} tabIndex={0} role="img" aria-label={image.alt} data-active={hovered || focused} onPointerEnter={event => { if (event.pointerType === 'mouse' && canHover()) setHovered(true) }} onPointerMove={track} onPointerLeave={() => { reset(); setHovered(false) }} onPointerCancel={() => { reset(); setHovered(false) }} onFocus={() => setFocused(true)} onBlur={() => { reset(); setFocused(false) }}>
    <motion.div className="educa-photo-tracking" style={still ? undefined : { rotateX, rotateY, transformPerspective: 900 }}>
      <div className="educa-photo-zoom"><Artwork image={image} decorative /></div>
    </motion.div>
    <span className="desktop-photo-note" aria-hidden="true">{image.node === '1:306' ? 'Torres' : image.node === '1:308' ? 'Arquitectura' : 'Cerros'}</span>
  </div>
}

function Panorama({ image, still }: { image: ImageData, still: boolean }) {
  const slot = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: slot, offset: ['start end', 'end start'] })
  const offset = useTransform(scrollYProgress, [0, 1], [12, -12])
  const y = useSpring(offset, { stiffness: 100, damping: 25 })
  return <div ref={slot} className="educa-art educa-panorama" data-educa-slot={image.node} style={bounds(image)}>
    <motion.div className="educa-panorama-tracking" style={{ y: still ? 0 : y }}><Artwork image={image} /></motion.div>
  </div>
}

export function Educa() {
  const host = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const reducedMotion = useReducedMotion()
  const still = Boolean(reducedMotion) || new URLSearchParams(window.location.search).get('motion') === 'off'
  const [revealed, setRevealed] = useState<Record<Reveal, boolean>>({ title: false, logo: false, construction: false })
  const [inView, setInView] = useState(false)
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null)
  const [focusedLetter, setFocusedLetter] = useState<string | null>(null)
  const [hoveredMark, setHoveredMark] = useState<string | null>(null)
  const [focusedMark, setFocusedMark] = useState<string | null>(null)
  const activeLetter = hoveredLetter ?? focusedLetter
  const activeMark = hoveredMark ?? focusedMark
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
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const element = entry.target as HTMLElement
        const name = element.dataset.educaReveal as Reveal
        observer.unobserve(element)
        Promise.all([document.fonts.ready, decodeImages([...element.querySelectorAll('img')])]).then(() => {
          if (live) setRevealed(previous => ({ ...previous, [name]: true }))
        })
      }
    }, { threshold: .2 })
    host.current.querySelectorAll('[data-educa-reveal]').forEach(element => observer.observe(element))
    return () => { live = false; observer.disconnect() }
  }, [still])
  useEffect(() => {
    const clear = () => { setHoveredLetter(null); setFocusedLetter(null); setHoveredMark(null); setFocusedMark(null) }
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    return () => { window.removeEventListener('blur', clear); document.removeEventListener('visibilitychange', clear) }
  }, [])
  useEffect(() => {
    if (window.location.hash !== '#educa') return
    let active = true
    document.fonts.ready.then(() => {
      if (active) host.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    return () => { active = false }
  }, [])

  return <div ref={host} className="educa-host" style={{ height: 3636 * scale, scrollMarginTop: 120 * scale }}>
    <section id="educa" className="educa-composition" aria-labelledby="educa-title" data-figma-node="1:297" data-motion={still ? 'off' : 'on'} data-in-view={inView} style={{ transform: `scale(${scale})`, scrollMarginTop: 120 * scale }}>
      <img className="educa-divider" src={separador} width={1440} height={80} alt="" aria-hidden="true" />
      <div className="educa-category" data-educa-reveal="title" data-visible={still || revealed.title}>
        <p className="educa-category-label">EDUCA / BRANDING</p>
        <h2 id="educa-title"><span className="educa-title-first">MARCAS</span><br /><span className="educa-title-second">CON IDENTIDAD.</span></h2>
        <svg className="educa-category-ornament" width="56" height="56" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <path d="M15 7v30c0 11 7 18 17 18s17-7 17-18V7" fill="none" stroke="currentColor" strokeWidth="14" />
        </svg>
      </div>
      <p className="educa-subtitle" data-figma-node="1:301">Plataforma E-learning - EDUCA</p>
      <p className="educa-year" data-figma-node="1:302">2026</p>
      <p className="educa-description" data-figma-node="1:303">
        La idea de Educa nació en Sucre como una startup de educación virtual en etapa de construcción,<br />
        enfocada en ofrecer cursos prácticos y accesibles adaptados a la realidad laboral de Bolivia,<br />
        donde soy el encargado de la imagen de la marca para su posicionamiento en el mercado.
      </p>
      <p className="educa-logo-description" data-figma-node="1:304">El logotipo de Educa nace de la letra «U» como símbolo universitario, inspirándose directamente en la identidad de Sucre al integrar las torres de sus iglesias coloniales y la silueta de los cerros Sica Sica y Churuquella en una sola pieza visual.</p>
      {images.map(image => {
        if (image.node === '1:307') return <Panorama key={image.node} image={image} still={still} />
        if (photoNodes.has(image.node)) return <TiltPhoto key={image.node} image={image} still={still} />
        const reveal: Reveal | undefined = image.node === '1:305' ? 'logo' : image.node === '1:310' ? 'construction' : undefined
        if (reveal) return <div key={image.node} className={`educa-art educa-reveal-${reveal}`} data-educa-slot={image.node} data-educa-reveal={reveal} data-visible={still || revealed[reveal]} style={bounds(image)}>
          <div className="educa-reveal-clip"><Artwork image={image} /></div>
        </div>
        const letterIndex = letterNodes.indexOf(image.node)
        if (letterIndex >= 0) return <div key={image.node} className="educa-art educa-letter" data-educa-slot={image.node} data-active={activeLetter === image.node} data-paused={Boolean(activeLetter && activeLetter !== image.node)} style={{ ...bounds(image), '--float-duration': `${4.8 + letterIndex * .8}s`, '--float-delay': `${-letterIndex * 1.3}s` } as CSSProperties} tabIndex={0} role="img" aria-label={image.alt} onPointerEnter={event => { if (event.pointerType === 'mouse' && canHover()) setHoveredLetter(image.node) }} onPointerLeave={() => setHoveredLetter(null)} onPointerCancel={() => setHoveredLetter(null)} onFocus={() => setFocusedLetter(image.node)} onBlur={() => setFocusedLetter(null)}>
          <div className="educa-letter-float"><div className="educa-letter-zoom"><Artwork image={image} decorative /></div></div>
        </div>
        if (markNodes.has(image.node)) return <div key={image.node} className="educa-art educa-mark" data-educa-slot={image.node} data-active={activeMark === image.node} data-muted={Boolean(activeMark && activeMark !== image.node)} style={bounds(image)} tabIndex={0} role="img" aria-label={image.alt} onPointerEnter={event => { if (event.pointerType === 'mouse' && canHover()) setHoveredMark(image.node) }} onPointerLeave={() => setHoveredMark(null)} onPointerCancel={() => setHoveredMark(null)} onFocus={() => setFocusedMark(image.node)} onBlur={() => setFocusedMark(null)}>
          <div className="educa-mark-emphasis"><Artwork image={image} decorative /></div>
        </div>
        return <div key={image.node} className="educa-art" style={bounds(image)}><Artwork image={image} /></div>
      })}
    </section>
  </div>
}
