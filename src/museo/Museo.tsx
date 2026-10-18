import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { responsiveImage } from '../assets/images'
import capturaPC from '../assets/museo/museum-history.webp'
import capturaPC2 from '../assets/museo/museum-home.webp'
import celularIzquierdo from '../assets/museo/museum-phone-gallery.webp'
import celularDerecho from '../assets/museo/museum-phone-home.webp'
import paleta1 from '../assets/museo/palette-01.svg'
import paleta2 from '../assets/museo/palette-02.svg'
import paleta3 from '../assets/museo/palette-03.svg'
import paleta4 from '../assets/museo/palette-04.svg'
import nextIcon from '../assets/museo/icons/nextjs.svg'
import reactIcon from '../assets/museo/icons/react.svg'
import typescriptIcon from '../assets/museo/icons/typescript.svg'
import tailwindIcon from '../assets/museo/icons/tailwind.svg'
import nextLabel from '../assets/museo/labels/nextjs.webp'
import reactLabel from '../assets/museo/labels/react.webp'
import typescriptLabel from '../assets/museo/labels/typescript.webp'
import tailwindLabel from '../assets/museo/labels/tailwind.webp'
import './museo.css'

// Bounds include the original Figma shadows and strokes at their exported 5× scale.
const captures = [
  { src: capturaPC, x: 62, y: 551, width: 1294, height: 628, alt: 'Página sobre el origen del Museo La Niña de Quemes', phone: false },
  { src: capturaPC2, x: 542, y: 1117, width: 813, height: 413, alt: 'Portada de la plataforma web del museo', phone: false },
  { src: celularIzquierdo, x: 752, y: 89, width: 317, height: 624, alt: 'Galería de objetos del museo en un teléfono', phone: true },
  { src: celularDerecho, x: 1068, y: 89, width: 295, height: 622, alt: 'Portada del museo en un teléfono', phone: true },
]
const palette = [paleta1, paleta2, paleta3, paleta4]
const technologies = [
  { name: 'Next.js', icon: nextIcon, label: nextLabel, x: 97, y: 1277, size: 81, labelX: 111, labelWidth: 54 },
  { name: 'React', icon: reactIcon, label: reactLabel, x: 203, y: 1268, size: 100, labelX: 230, labelWidth: 45 },
  { name: 'TypeScript', icon: typescriptIcon, label: typescriptLabel, x: 331, y: 1280, size: 75, labelX: 326, labelWidth: 85 },
  { name: 'Tailwind', icon: tailwindIcon, label: tailwindLabel, x: 447, y: 1281, size: 74, labelX: 451, labelWidth: 63 },
]

type CaptureData = typeof captures[number]

function MuseumCapture({ capture, still, onOpen, onEntered }: {
  capture: CaptureData
  still: boolean
  onOpen: () => void
  onEntered?: () => void
}) {
  const { src, x, y, width, height, alt, phone } = capture
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const rotateX = useSpring(targetX, { stiffness: 180, damping: 25 })
  const rotateY = useSpring(targetY, { stiffness: 180, damping: 25 })
  const reset = () => { targetX.set(0); targetY.set(0) }

  useEffect(() => {
    const clear = () => { targetX.set(0); targetY.set(0) }
    if (still) clear()
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    return () => {
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', clear)
    }
  }, [still, targetX, targetY])

  const followPointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (!phone || still || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const clamp = (value: number) => Math.max(-1, Math.min(1, value))
    targetY.set(clamp((event.clientX - bounds.left) / bounds.width * 2 - 1) * 3.5)
    targetX.set(-clamp((event.clientY - bounds.top) / bounds.height * 2 - 1) * 3)
  }

  return <button type="button" className={`museum-capture${phone ? ' museum-phone' : ''}`} aria-label={`Ampliar: ${alt}`} aria-haspopup="dialog" style={{ left: x, top: y, width, height }} onClick={() => { reset(); onOpen() }} onPointerMove={followPointer} onPointerLeave={reset} onPointerCancel={reset}>
    <div className="museum-capture-entry" onAnimationEnd={event => {
      if (event.target === event.currentTarget && event.animationName === 'museum-enter') onEntered?.()
    }}>
      <motion.div className="museum-capture-tracking" style={phone ? { rotateX, rotateY, transformPerspective: 900 } : undefined}>
        <img src={src} {...responsiveImage(src)} alt={alt} width={width} height={height} draggable={false} />
      </motion.div>
    </div>
    <span className="desktop-capture-hint" aria-hidden="true">Ampliar ↗</span>
  </button>
}

export function Museo() {
  const host = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const reducedMotion = useReducedMotion()
  const still = Boolean(reducedMotion) || new URLSearchParams(window.location.search).get('motion') === 'off'
  const [entrance, setEntrance] = useState<'pending' | 'playing' | 'complete'>('pending')
  const [selected, setSelected] = useState<CaptureData | null>(null)
  const isOpen = selected !== null
  const changeCapture = (direction: number) => setSelected(current => current ? captures[(captures.indexOf(current) + direction + captures.length) % captures.length] : null)
  const lightbox = useRef<HTMLDialogElement>(null)
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
    let active = true
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        document.fonts.ready.then(() => { if (active) setEntrance('playing') })
        observer.disconnect()
      }
    }, { threshold: .12 })
    observer.observe(host.current)
    return () => { active = false; observer.disconnect() }
  }, [still])

  useEffect(() => {
    const dialog = lightbox.current
    if (!isOpen || !dialog) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [isOpen])

  useEffect(() => {
    if (window.location.hash !== '#museo') return
    let active = true
    document.fonts.ready.then(() => {
      if (active) host.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    return () => { active = false }
  }, [])

  return <><div ref={host} className="museum-host" style={{ height: 1598 * scale, scrollMarginTop: 40 * scale }}>
    <section id="museo" className="museum-composition" aria-labelledby="museum-title" data-figma-node="1:186" data-motion={still ? 'off' : 'on'} data-entrance={still ? 'complete' : entrance} style={{ transform: `scale(${scale})`, scrollMarginTop: 40 * scale }}>
      <div className="museum-category" data-figma-node="1:187"><span>01 / DISEÑO + DESARROLLO WEB</span></div>
      <h2 id="museum-title">LA NIÑA<br />DE QUEMES.</h2>
      <p className="museum-description" data-figma-node="1:190">
        <span>Diseñé y desarrollé la plataforma web oficial para el</span>{' '}
        <span>Museo “La Niña de Quemes” (sedes en Uyuni y San Pedro</span>{' '}
        <span>de Quemes), un proyecto cultural dedicado a preservar y</span>{' '}
        <span>difundir el patrimonio arqueológico e incaico del altiplano</span>{' '}
        <span>boliviano.</span>
      </p>
      {captures.map((capture, index) => <MuseumCapture key={capture.src} capture={capture} still={still} onOpen={() => setSelected(capture)} onEntered={index === 1 ? () => setEntrance('complete') : undefined} />)}
      <p className="mobile-only museum-mobile-hint">Toca las imágenes para ampliarlas ↗</p>
      <div className="museum-palette" role="img" aria-label="Paleta de colores de la identidad del museo">
        {palette.map((src, index) => <div key={src} className="museum-swatch" style={{ left: 78.9 + index * 115, top: 1059.8999 }}><img src={src} alt="" width="120" height="197" draggable={false} /></div>)}
      </div>
      <ul className="museum-technologies" aria-label="Tecnologías del proyecto">
        {technologies.map(({ name, icon, label, x, y, size, labelX, labelWidth }) => {
          const left = Math.min(x, labelX)
          return <li key={name} className="museum-technology" aria-label={name} data-technology={name} style={{ left, top: y, width: Math.max(x + size, labelX + labelWidth) - left, height: 1390 - y }}>
            <img className="museum-image museum-technology-icon" src={icon} alt="" width={size} height={size} style={{ left: x - left, top: 0 }} draggable={false} />
            <img className="museum-image" src={label} {...responsiveImage(label)} alt="" width={labelWidth} height="22" style={{ left: labelX - left, top: 1368 - y }} />
          </li>
        })}
      </ul>
    </section>
  </div>{createPortal(<dialog ref={lightbox} className="museum-lightbox" aria-labelledby="museum-lightbox-title" onKeyDown={event => {
    if (!window.matchMedia('(min-width: 901px)').matches) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); changeCapture(event.key === 'ArrowLeft' ? -1 : 1) }
  }} onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null) }}>
    <div className="museum-lightbox-header">
      <p id="museum-lightbox-title">{selected?.alt}</p>
      <button type="button" className="museum-lightbox-close" onClick={() => setSelected(null)}>Cerrar <span aria-hidden="true">×</span></button>
    </div>
    {selected && <img className="museum-lightbox-image" src={selected.src} {...responsiveImage(selected.src, { eager: true, sizes: '(min-width: 1600px) 1460px, 94vw' })} alt={selected.alt} draggable={false} />}
    <div className="desktop-gallery-controls">
      <button type="button" aria-label="Captura anterior" onClick={() => changeCapture(-1)}>← Anterior</button>
      <span aria-live="polite">{selected ? captures.indexOf(selected) + 1 : 0} / {captures.length}</span>
      <button type="button" aria-label="Captura siguiente" onClick={() => changeCapture(1)}>Siguiente →</button>
    </div>
  </dialog>, document.body)}</>
}
