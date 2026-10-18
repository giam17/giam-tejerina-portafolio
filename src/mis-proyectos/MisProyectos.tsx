import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { Sticker } from '../sobre-mi/SobreMi'
import seriousOpen from '../assets/animations/serious-open.webp'
import seriousAlternate from '../assets/animations/serious-blink.webp'
import standingOpen from '../assets/animations/standing-open.webp'
import standingAlternate from '../assets/animations/standing-blink.webp'
import separator from '../assets/shared/divider-wave-blue.svg'
import './mis-proyectos.css'

const seriousFrames: [string, string] = [seriousOpen, seriousAlternate]
const standingFrames: [string, string] = [standingOpen, standingAlternate]

export function MisProyectos() {
  const host = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const reducedMotion = useReducedMotion()
  const still = Boolean(reducedMotion) || new URLSearchParams(window.location.search).get('motion') === 'off'
  const [entrance, setEntrance] = useState<'pending' | 'playing' | 'complete'>('pending')
  const targetRotate = useMotionValue(0)
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const rotate = useSpring(targetRotate, { stiffness: 170, damping: 24 })
  const x = useSpring(targetX, { stiffness: 170, damping: 24 })
  const y = useSpring(targetY, { stiffness: 170, damping: 24 })
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

  const resetTracking = () => { targetRotate.set(0); targetX.set(0); targetY.set(0) }
  useEffect(() => {
    const reset = () => { targetRotate.set(0); targetX.set(0); targetY.set(0) }
    if (still) reset()
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', reset)
    return () => {
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', reset)
    }
  }, [still, targetRotate, targetX, targetY])

  const followPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (still || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const clamp = (value: number) => Math.max(-1, Math.min(1, value))
    const horizontal = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1)
    const vertical = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1)
    targetRotate.set(horizontal * 3.5)
    targetX.set(horizontal * 4)
    targetY.set(vertical * 3)
  }

  return <div ref={host} className="projects-host" style={{ height: 720 * scale }}>
    <section id="proyectos" className="projects-composition" aria-labelledby="projects-title" data-figma-node="1:165" data-motion={still ? 'off' : 'on'} data-entrance={still ? 'complete' : entrance} style={{ transform: `scale(${scale})` }}>
      <svg className="projects-grid" width="1440" height="720" aria-hidden="true">
        <path d={[
          ...Array.from({ length: 31 }, (_, i) => `M${i * 48} 0V720`),
          ...Array.from({ length: 16 }, (_, i) => `M0 ${i * 48}H1440`),
        ].join(' ')} fill="none" stroke="var(--ink)" strokeWidth="1" />
      </svg>
      <div className="projects-separator" aria-hidden="true"><img src={separator} width="1440" height="41" alt="" /></div>
      <div className="projects-content" data-figma-node="1:170">
        <h2 id="projects-title">MIS<br />PROYECTOS.</h2>
        <ol className="projects-categories">
          <li className="project-category project-category-web">
            <span className="project-category-circle" aria-hidden="true" />
            <span className="project-category-number" aria-hidden="true">01</span>
            <h3>DISEÑO/<br />DESARROLLO<br />WEB</h3>
            <a className="mobile-only mobile-project-link" href="#museo" aria-label="Ver proyecto de diseño y desarrollo web" />
          </li>
          <li className="project-category project-category-characters">
            <span className="project-category-circle" aria-hidden="true" />
            <span className="project-category-number" aria-hidden="true">02</span>
            <h3>DISEÑO/<br />PERSONAJES<br />2D</h3>
            <a className="mobile-only mobile-project-link" href="#personajes" aria-label="Ver proyecto de personajes 2D" />
          </li>
          <li className="project-category project-category-branding" onAnimationEnd={event => {
            if (event.target === event.currentTarget && event.animationName === 'projects-enter') setEntrance('complete')
          }}>
            <span className="project-category-circle" aria-hidden="true" />
            <span className="project-category-number" aria-hidden="true">03</span>
            <h3>BRANDING</h3>
            <a className="mobile-only mobile-project-link" href="#educa" aria-label="Ver proyecto de branding EDUCA" />
          </li>
        </ol>
      </div>
      <Sticker className="projects-serious" frames={seriousFrames} label="Giam con expresión seria" intervalMs={2000} alternateDurationMs={1000} />
      <div className="projects-standing" onPointerMove={followPointer} onPointerLeave={resetTracking} onPointerCancel={resetTracking}>
        <motion.div className="projects-standing-tracking" style={{ rotate, x, y }}>
          <Sticker className="projects-standing-art" frames={standingFrames} label="Giam de pie con los brazos cruzados" intervalMs={1000} />
        </motion.div>
      </div>
    </section>
  </div>
}
