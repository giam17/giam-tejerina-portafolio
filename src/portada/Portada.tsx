import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { decodeImages, responsiveImage } from '../assets/images'
import faceRegular from '../assets/animations/regular-open.webp'
import faceSmile from '../assets/animations/regular-blink.webp'
import { NotebookSignature } from './NotebookSignature'

const DESIGN_WIDTH = 1440
const DESIGN_HEIGHT = 800
const FRAMES = [faceRegular, faceSmile]
const FACE_SIZES = '(max-width: 900px) min(88vw, 360px), 36.1111vw'
const TRACKING_SPRING = { stiffness: 170, damping: 24, mass: 0.4 }

// Explicit review mode freezes the composition at Figma's first animation frame.
const isStill = new URLSearchParams(window.location.search).get('motion') === 'off'

/** The entire Figma composition scales as one unit; no mobile reflow. */
function useCompositionScale() {
  const host = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const element = host.current
    if (!element) return
    const measure = () => setScale(element.getBoundingClientRect().width / DESIGN_WIDTH)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { host, scale }
}

/** One shared frame drives both the character and the title in the same render. */
function useFaceFrame(still: boolean, entranceComplete: boolean) {
  const [frame, setFrame] = useState(0)
  const [ready, setReady] = useState(false)
  const images = useRef<(HTMLImageElement | null)[]>([])

  useEffect(() => {
    let active = true
    // Decode the actual responsive DOM images, including the hidden expression,
    // before the first entrance or blink can start.
    const imagesReady = decodeImages(images.current.filter((image): image is HTMLImageElement => image !== null))
    Promise.all([imagesReady, document.fonts.ready]).then(() => { if (active) setReady(true) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (still || !ready || !entranceComplete) { setFrame(0); return }
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    // Repeat the two original expressions automatically, without pointer input.
    const sequence = [
      { frame: 0, duration: 2200 },
      { frame: 1, duration: 700 },
    ]
    let index = 0
    const advance = () => {
      if (stopped) return
      const step = sequence[index]
      setFrame(step.frame)
      index = (index + 1) % sequence.length
      timer = setTimeout(advance, step.duration)
    }
    advance()
    return () => { stopped = true; clearTimeout(timer) }
  }, [ready, still, entranceComplete])

  return { frame: still ? 0 : frame, ready, images }
}

/** Motion values follow pointer input without rerendering the composition. */
function useFaceTracking(still: boolean) {
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const targetRotate = useMotionValue(0)
  const x = useSpring(targetX, TRACKING_SPRING)
  const y = useSpring(targetY, TRACKING_SPRING)
  const rotate = useSpring(targetRotate, TRACKING_SPRING)

  const reset = () => {
    targetX.set(0)
    targetY.set(0)
    targetRotate.set(0)
  }

  useEffect(() => {
    const resetTargets = () => {
      targetX.set(0)
      targetY.set(0)
      targetRotate.set(0)
    }
    if (still) resetTargets()
    window.addEventListener('blur', resetTargets)
    document.addEventListener('visibilitychange', resetTargets)
    return () => {
      window.removeEventListener('blur', resetTargets)
      document.removeEventListener('visibilitychange', resetTargets)
    }
  }, [still, targetX, targetY, targetRotate])

  const follow = (event: PointerEvent<HTMLElement>) => {
    if (still || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const localX = (event.clientX - bounds.left) * DESIGN_WIDTH / bounds.width
    const localY = (event.clientY - bounds.top) * DESIGN_HEIGHT / bounds.height
    const clamp = (value: number) => Math.max(-1, Math.min(1, value))
    // Centre of the original 520 px sticker after its static 7° rotation.
    const horizontal = clamp((localX - 1112.4) / (DESIGN_WIDTH / 2))
    const vertical = clamp((localY - 509.7) / (DESIGN_HEIGHT / 2))
    targetX.set(horizontal * 6)
    targetY.set(vertical * 5)
    targetRotate.set(horizontal * 3)
  }

  return { style: { x, y, rotate }, follow, reset }
}

function AnimatedFace({ still, frame, tracking, images, onEntranceComplete }: {
  still: boolean
  frame: number
  tracking: ReturnType<typeof useFaceTracking>['style']
  images: ReturnType<typeof useFaceFrame>['images']
  onEntranceComplete: () => void
}) {
  return (
    <div className="face-placement" data-figma-node="1:48">
      <div className="face-entrance intro-element" onAnimationEnd={event => {
        if (event.target === event.currentTarget && event.animationName === 'portada-face-enter') onEntranceComplete()
      }}>
        <motion.div className="face-tracking" style={tracking}>
          <motion.div
            className="face"
            role="img"
            aria-label="Giam, personaje animado con gafas y cabello mod cut"
            whileHover={still ? undefined : { rotate: -2, scale: 1.025 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            data-frame={frame}
          >
            {FRAMES.map((src, index) => (
              <img
                key={src}
                ref={element => { images.current[index] = element }}
                className="face-frame"
                src={src}
                {...responsiveImage(src, { eager: true, sizes: FACE_SIZES })}
                decoding="sync"
                alt=""
                aria-hidden="true"
                width={1254}
                height={1254}
                draggable={false}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                style={{ opacity: index === frame ? 1 : 0 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function StarSeal({ still, frame }: { still: boolean; frame: number }) {
  // Figma native Star: 12 vertices, 78% inner radius, 150 × 150, no rotation.
  const points = Array.from({ length: 24 }, (_, index) => {
    const angle = (index * Math.PI) / 12 - Math.PI / 2
    const radius = index % 2 === 0 ? 75 : 75 * 0.78
    return `${75 + Math.cos(angle) * radius},${75 + Math.sin(angle) * radius}`
  }).join(' ')

  return (
    <div className="seal" aria-hidden="true">
      <div className="seal-entrance intro-element">
        <motion.div
          className="seal-reaction"
          initial={false}
          animate={{ rotate: !still && frame === 1 ? -12 : 0, scale: !still && frame === 1 ? 1.04 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 13 }}
          data-blink={frame}
        >
          <motion.div
            className="seal-hover"
            whileHover={still ? undefined : { rotate: -9, scale: 1.045 }}
            transition={{ type: 'spring', stiffness: 230, damping: 16 }}
          >
            <svg className="seal-star" width="150" height="150" viewBox="0 0 150 150" data-figma-node="1:50">
              <polygon points={points} fill="var(--coral)" />
            </svg>
            <span className="seal-monogram" data-figma-node="1:51">g.</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export function Portada() {
  const { host, scale } = useCompositionScale()
  const reducedMotion = useReducedMotion()
  const still = isStill || Boolean(reducedMotion)
  const [entranceComplete, setEntranceComplete] = useState(false)
  const [signatureComplete, setSignatureComplete] = useState(false)
  const { frame: faceFrame, ready, images } = useFaceFrame(still, entranceComplete)
  const faceTracking = useFaceTracking(still || !entranceComplete)

  return (
    <div className="composition-host" ref={host} style={{ height: DESIGN_HEIGHT * scale }}>
      <section
        id="portada"
        className="portada"
        aria-label="Portafolio de Giam Tejerina"
        data-motion={still ? 'off' : 'on'}
        data-entrance={still || entranceComplete ? 'complete' : ready ? 'playing' : 'pending'}
        data-face-entry={still || signatureComplete ? 'ready' : 'waiting'}
        data-figma-node="1:37"
        onPointerMove={faceTracking.follow}
        onPointerLeave={faceTracking.reset}
        onPointerCancel={faceTracking.reset}
        style={{ transform: `scale(${scale})` }}
      >
        <svg className="grid intro-element" width="1440" height="800" aria-hidden="true" data-figma-node="1:38">
          <path
            d={[
              ...Array.from({ length: 31 }, (_, index) => `M${index * 48} 0V800`),
              ...Array.from({ length: 17 }, (_, index) => `M0 ${index * 48}H1440`),
            ].join(' ')}
            fill="none" stroke="var(--coral)" strokeWidth="3"
          />
        </svg>

        <header className="navigation intro-element" data-figma-node="1:40">
          <NotebookSignature onComplete={() => setSignatureComplete(true)} />
          <nav aria-label="Navegación principal">
            <a className="label label-blue nav-about" href="#sobre-mi" data-figma-node="1:42">SOBRE MÍ</a>
            <a className="label label-blue nav-projects" href="#proyectos" data-figma-node="1:43">PROYECTOS</a>
            <a className="label label-blue nav-contact" href="#contacto" data-figma-node="1:44">HABLEMOS ↗</a>
          </nav>
        </header>

        <p className="label label-blue professions intro-element" data-figma-node="1:45" aria-label="Systems engineer, data analyst, designer y marketer">
          <span className="professions-static">SYSTEMS ENGINEER | DATA ANALYST | DESIGNER | MARKETER</span>
          <span className="desktop-ribbon-track" aria-hidden="true">
            <span>SYSTEMS ENGINEER / DATA ANALYST / DESIGNER / MARKETER / </span>
            <span>SYSTEMS ENGINEER / DATA ANALYST / DESIGNER / MARKETER / </span>
          </span>
        </p>

        <h1 className="portfolio-title intro-element" aria-label="Portafolio" data-style={faceFrame === 1 ? 'swapped' : 'original'}>
          <svg className="title-outline" width="1170" height="229" viewBox="0 0 1170 229" data-figma-node="1:46" aria-hidden="true">
            <defs>
              <text id="porta-glyphs" x="0" y="186.24">PORTA</text>
              <mask id="porta-outside" maskUnits="userSpaceOnUse" x="-10" y="-10" width="1190" height="249">
                <rect x="-10" y="-10" width="1190" height="249" fill="white" />
                <use href="#porta-glyphs" fill="black" />
              </mask>
            </defs>
            <use className="porta-fill" href="#porta-glyphs" fill="var(--blue)" />
            <use className="porta-outline" href="#porta-glyphs" fill="var(--blue)" stroke="var(--blue)" strokeWidth="10" mask="url(#porta-outside)" />
          </svg>
          <span className="title-solid" data-figma-node="1:47" aria-hidden="true">FOLIO</span>
          <svg className="folio-outline" width="1150" height="238" viewBox="0 0 1150 238" aria-hidden="true">
            <defs>
              <text id="folio-glyphs" x="0" y="195.93">FOLIO</text>
              <mask id="folio-outside" maskUnits="userSpaceOnUse" x="-10" y="-10" width="1170" height="258">
                <rect x="-10" y="-10" width="1170" height="258" fill="white" />
                <use href="#folio-glyphs" fill="black" />
              </mask>
            </defs>
            <use href="#folio-glyphs" fill="var(--blue)" stroke="var(--blue)" strokeWidth="10" mask="url(#folio-outside)" />
          </svg>
        </h1>

        <AnimatedFace still={still} frame={faceFrame} tracking={faceTracking.style} images={images} onEntranceComplete={() => setEntranceComplete(true)} />

        <StarSeal still={still} frame={faceFrame} />
      </section>
    </div>
  )
}
