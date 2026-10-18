import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from 'motion/react'
import { loadImage, responsiveImage } from '../assets/images'
import happyOpen from '../assets/animations/happy-orange-open.webp'
import happyClosed from '../assets/animations/happy-orange-blink.webp'
import thinkingOpen from '../assets/animations/thinking-open.webp'
import thinkingClosed from '../assets/animations/thinking-blink.webp'
import surpriseOpen from '../assets/animations/surprised-open.webp'
import surpriseClosed from '../assets/animations/surprised-blink.webp'
import photo from '../assets/sobre-mi/giam-photo.webp'
import educationWave from '../assets/shared/divider-wave-small.svg'
import orangeSeparator from '../assets/shared/divider-wave-orange.svg'
import python from '../assets/sobre-mi/icons/python.svg'
import javascript from '../assets/sobre-mi/icons/javascript.svg'
import git from '../assets/sobre-mi/icons/git.svg'
import docker from '../assets/sobre-mi/icons/docker.svg'
import sql from '../assets/sobre-mi/icons/sql.svg'
import powerbi from '../assets/sobre-mi/icons/powerbi.svg'
import excel from '../assets/sobre-mi/icons/excel.svg'
import tableau from '../assets/sobre-mi/icons/tableau.svg'
import figma from '../assets/sobre-mi/icons/figma.svg'
import illustrator from '../assets/sobre-mi/icons/illustrator.svg'
import photoshop from '../assets/sobre-mi/icons/photoshop.svg'
import aftereffects from '../assets/sobre-mi/icons/after-effects.svg'
import './sobre-mi.css'

const tools = [
  { name: 'Python', src: python, x: 18, y: 145, width: 63, height: 63, labelX: 0, labelY: 212 },
  { name: 'JavaScript', src: javascript, x: 115, y: 148, width: 59, height: 58, labelX: 96, labelY: 212 },
  { name: 'Git', src: git, x: 208, y: 145, width: 59, height: 59, labelX: 190, labelY: 212 },
  { name: 'Docker', src: docker, x: 301, y: 136, width: 78, height: 78, labelX: 285, labelY: 212 },
  { name: 'SQL', src: sql, x: 4, y: 268, width: 91, height: 91, labelX: 0, labelY: 351 },
  { name: 'Power BI', src: powerbi, x: 106, y: 275, width: 78, height: 78, labelX: 96, labelY: 351 },
  { name: 'Excel', src: excel, x: 205, y: 281, width: 63, height: 63, labelX: 190, labelY: 351 },
  { name: 'Tableau', src: tableau, x: 301, y: 283, width: 62, height: 62, labelX: 285, labelY: 351 },
  { name: 'Figma', src: figma, x: 20, y: 426, width: 58, height: 58, labelX: 0, labelY: 490 },
  { name: 'Illustrator', src: illustrator, x: 108, y: 423, width: 67, height: 67, labelX: 96, labelY: 490 },
  { name: 'Photoshop', src: photoshop, x: 206, y: 423, width: 61, height: 61, labelX: 190, labelY: 490 },
  { name: 'After Effects', src: aftereffects, x: 302, y: 423, width: 61, height: 61, labelX: 285, labelY: 490 },
]

/** Preloaded expressions alternate independently of the hover jump. */
export function Sticker({ frames, className, label, offset = 0, mirror = false, intervalMs, alternateDurationMs }: {
  frames: [string, string]; className: string; label: string; offset?: number; mirror?: boolean; intervalMs?: number; alternateDurationMs?: number
}) {
  const reducedMotion = useReducedMotion()
  const still = Boolean(reducedMotion) || new URLSearchParams(window.location.search).get('motion') === 'off'
  const [frame, setFrame] = useState(0)
  const element = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [hopping, setHopping] = useState(false)
  const hopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(hopTimer.current), [])
  const hopOnTouch = () => {
    if (still || !window.matchMedia('(max-width: 900px)').matches) return
    setHopping(true)
    clearTimeout(hopTimer.current)
    hopTimer.current = setTimeout(() => setHopping(false), 550)
  }
  const mobileSizes = className.includes('standing') ? 'min(88vw, 360px)' : className.includes('serious') ? '144px' : className.includes('thinking') ? '120px' : '108px'
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      setNear(true)
      Promise.all(frames.map(src => loadImage(src, { mobileSizes }))).then(() => {
        if (cancelled || still) return
        const toggle = (next: number) => {
          if (cancelled) return
          setFrame(next)
          const duration = next === 0 ? (intervalMs ?? 2600) : (alternateDurationMs ?? intervalMs ?? 650)
          timer = setTimeout(() => toggle(1 - next), duration)
        }
        timer = setTimeout(() => toggle(1), (intervalMs ?? 2600) + offset)
      })
    }, { rootMargin: '500px' })
    if (element.current) observer.observe(element.current)
    return () => { cancelled = true; observer.disconnect(); clearTimeout(timer) }
  }, [frames, offset, still, intervalMs, alternateDurationMs, mobileSizes])
  return <div ref={element} className={`about-sticker ${className}`} role="img" aria-label={label} data-frame={still ? 0 : frame} data-hopping={hopping} onClick={hopOnTouch}>
    <div className="about-sticker-art">{frames.map((src, index) => <img key={src} src={src} {...responsiveImage(src, { eager: near, mobileSizes })} alt="" aria-hidden="true" width="1254" height="1254" draggable={false}
      style={{ visibility: index === (still ? 0 : frame) ? 'visible' : 'hidden', transform: mirror ? 'scaleX(-1)' : undefined }} />)}
    </div>
  </div>
}

// Stable arrays keep the timers running across layout measurements.
const happyFrames: [string, string] = [happyOpen, happyClosed]
const thinkingFrames: [string, string] = [thinkingOpen, thinkingClosed]
const surpriseFrames: [string, string] = [surpriseOpen, surpriseClosed]

function ToolsCard() {
  return <aside className="about-tools about-soft-shadow" aria-labelledby="tools-title" data-figma-node="1:57">
    <div className="tools-content" data-figma-node="1:58">
      <h2 id="tools-title">MI CAJA DE<br />HERRAMIENTAS</h2>
      <div className="tools-rule" />
      <h3 className="tools-category category-engineer">SYSTEMS ENGINEER</h3>
      <h3 className="tools-category category-analyst">DATA ANALYST</h3>
      <h3 className="tools-category category-designer">DESIGNER</h3>
      <ul className="tools-list">{tools.map(tool => <li key={tool.name} style={{ left: tool.labelX, top: tool.y, height: tool.labelY + 32 - tool.y }}>
        <span aria-hidden="true" className={`tool-icon${tool.name === 'Power BI' ? ' tool-icon-luminance' : ''}`} style={{ left: tool.x - tool.labelX, top: 0, width: tool.width, height: tool.height,
          '--icon-url': `url("${tool.src}")` } as CSSProperties} />
        <span className="tool-name" style={{ left: 0, top: tool.labelY - tool.y }}>{tool.name}</span>
      </li>)}</ul>
    </div>
  </aside>
}

function ExperienceCard() {
  return <article className="about-experience about-soft-shadow" aria-labelledby="experience-title" data-figma-node="1:131">
    <div className="experience-content" data-figma-node="1:132">
      <h2 id="experience-title">EXPERIENCIA</h2>
      <p className="experience-employer" style={{ top: 64 }}>CAT KAT FOOD</p>
      <p className="experience-role" style={{ top: 118 }}>Analista de Costos y<br />Presupuesto</p>
      <hr style={{ top: 204 }} />
      <p className="experience-employer" style={{ top: 228 }}>CENTRO RECREATIVO LA<br />FLORESTA</p>
      <p className="experience-role" style={{ top: 314 }}>Administración y<br />Marketing</p>
      <hr style={{ top: 400 }} />
      <p className="experience-employer" style={{ top: 424 }}>FARMACIA VIRGEN DE<br />CHAGUAYA</p>
      <p className="experience-role" style={{ top: 510 }}>Encargado de Logística y<br />Distribución</p>
      <hr style={{ top: 596 }} />
      <p className="experience-employer" style={{ top: 620 }}>MUSEO “LA NIÑA DE<br />QUEMES”</p>
      <p className="experience-role" style={{ top: 706 }}>Diseñador y Desarrollador<br />Web</p>
    </div>
  </article>
}

function EducationCard({ scale }: { scale: number }) {
  // Render the filtered SVG at twice its final display size, then downsample.
  // Cancelling the composition's scale avoids enlarging its rasterized filter.
  const waveRenderScale = scale * 2
  return <article className="about-education about-soft-shadow" aria-labelledby="careers-title" data-figma-node="1:115">
    <div className="education-wave" aria-hidden="true">
      <img src={educationWave} width="450" height="33" alt="" style={{
        width: 450 * waveRenderScale,
        height: 33 * waveRenderScale,
        transform: `scale(${1 / waveRenderScale})`,
      }} />
    </div>
    <div className="education-content" data-figma-node="1:118">
      <h2 id="careers-title">CARRERAS</h2>
      <hr style={{ top: 60 }} />
      <div className="career" style={{ top: 82 }}><h3>UNIVERSIDAD DEL VALLE</h3><p>Ingeniería de Sistemas Informáticos - 2027</p></div>
      <div className="career" style={{ top: 159 }}><h3>TECNOLOGICO BOLIVIANO ALEMAN</h3><p>Mercadotecnia - 2025</p></div>
      <hr style={{ top: 236 }} />
      <h2 className="courses-title">CURSOS</h2>
      <ul className="courses-list">
        <li>2025&nbsp;&nbsp; Database Design · Oracle Academy</li>
        <li>2024&nbsp;&nbsp; Database Foundations · Oracle Academy</li>
        <li>2024&nbsp;&nbsp; Python Essentials 1 · Cisco</li>
        <li>2024&nbsp;&nbsp; Cybersecurity · Cisco</li>
      </ul>
    </div>
    <Sticker className="about-surprise" frames={surpriseFrames} label="Giam con expresión de asombro" intervalMs={1000} />
  </article>
}

function SkillsCard() {
  return <article className="about-skills" aria-labelledby="skills-title" data-figma-node="1:145">
    <div className="skills-content" data-figma-node="1:146">
      <h2 id="skills-title">SKILLS</h2>
      <h3>LO QUE APORTO</h3><p>Estrategia · Creatividad ·<br />Tecnología · Resolución</p><hr />
      <h3>COMO TRABAJO</h3><p>Explorar · Analizar ·<br />Crear · Mejorar</p><hr />
      <h3>MI FORMA DE CREAR</h3><p>Investigar · Idear ·<br />Diseñar · Construir</p><hr />
      <p className="skills-languages">ESPAÑOL / NATIVO<br />INGLÉS / INTERMEDIO</p>
    </div>
  </article>
}

export function SobreMi() {
  const host = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const element = host.current
    if (!element) return
    const measure = () => setScale(element.getBoundingClientRect().width / 1440)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <div ref={host} className="about-host" style={{ height: 1407 * scale }}>
    <section id="sobre-mi" className="about-composition" aria-label="Sobre mí" data-figma-node="1:52" data-motion={new URLSearchParams(window.location.search).get('motion') === 'off' ? 'off' : 'on'} style={{ transform: `scale(${scale})` }}>
      <div className="about-paper-separator" data-figma-node="1:55" aria-hidden="true">
        <img src={orangeSeparator} width="1440" height="60" alt="" />
      </div>
      <svg className="about-grid" width="1440" height="1420" aria-hidden="true"><path d={[
        ...Array.from({ length: 31 }, (_, i) => `M${i * 48} 0V1420`),
        ...Array.from({ length: 30 }, (_, i) => `M0 ${i * 48}H1440`),
      ].join(' ')} fill="none" stroke="var(--coral)" strokeWidth="3" /></svg>
      <ToolsCard />
      <div className="about-introduction" data-figma-node="1:110">
        <h2 className="about-greeting" data-figma-node="1:111">¡HOLA!<br />SOY GIAM.</h2>
        <div className="about-bio about-soft-shadow" data-figma-node="1:112">
          <div data-figma-node="1:113"><p>Combino marketing, tecnología, datos y diseño para transformar ideas en experiencias digitales que no solo se ven bien, sino que también comunican, conectan y resuelven.</p>
          <p>Me interesa entender el problema desde distintos ángulos, encontrar las oportunidades en los datos, convertirlas en estrategia y darles forma mediante diseño y tecnología. Mi objetivo es crear soluciones funcionales, creativas y con identidad, donde cada decisión tenga un propósito y cada detalle aporte valor.</p></div>
        </div>
        <Sticker className="about-happy" frames={happyFrames} label="Giam con expresión feliz" intervalMs={1000} mirror />
      </div>
      <EducationCard scale={scale} />
      <div className="about-photo" data-figma-node="1:130"><img src={photo} {...responsiveImage(photo, { mobileSizes: 'min(75vw, 320px)' })} alt="Giam Tejerina" width="800" height="1280" draggable={false} /></div>
      <ExperienceCard />
      <SkillsCard />
      <Sticker className="about-thinking" frames={thinkingFrames} label="Giam con expresión pensativa" intervalMs={1000} />
    </section>
  </div>
}
