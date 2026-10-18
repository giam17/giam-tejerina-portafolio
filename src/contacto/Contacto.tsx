import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from 'motion/react'
import { decodeImages, responsiveImage } from '../assets/images'
import personaje from '../assets/contacto/giam-walking.webp'
import separador from '../assets/contacto/divider-wave-orange.svg'
import whatsapp from '../assets/contacto/icons/whatsapp.svg'
import instagram from '../assets/contacto/icons/instagram.svg'
import correo from '../assets/contacto/icons/email.svg'
import linkedin from '../assets/contacto/icons/linkedin.svg'
import './contacto.css'

const contacts = [
  { node: '1:329', textNode: '1:325', name: 'WhatsApp', text: '+591 67949446', href: 'https://wa.me/59167949446', icon: whatsapp, x: 944, y: 170, width: 55, height: 55, textY: 187, textWidth: 317 },
  { node: '1:332', textNode: '1:326', name: 'Instagram', text: 'giam_tejerina', href: 'https://www.instagram.com/giam_tejerina/', icon: instagram, x: 944, y: 265, width: 54, height: 54, textY: 281, textWidth: 317 },
  { node: '1:338', textNode: '1:327', name: 'Correo electrónico', text: 'tejerinalucass4@gmail.com', href: 'mailto:tejerinalucass4@gmail.com', icon: correo, x: 938, y: 359, width: 65, height: 65, textY: 378, textWidth: 317 },
  { node: '1:341', textNode: '1:328', name: 'LinkedIn', text: 'www.linkedin.com/in/giamtejerina', href: 'https://www.linkedin.com/in/giamtejerina', icon: linkedin, x: 934, y: 451, width: 74, height: 74, textY: 477, textWidth: 391 },
]

function WaveTitle() {
  const base = useRef<HTMLSpanElement>(null)
  const [positions, setPositions] = useState<number[]>([])
  const [touchWave, setTouchWave] = useState(false)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(touchTimer.current), [])
  const waveOnTouch = () => {
    if (!window.matchMedia('(max-width: 900px)').matches) return
    setTouchWave(true)
    clearTimeout(touchTimer.current)
    touchTimer.current = setTimeout(() => setTouchWave(false), 1000)
  }
  useEffect(() => {
    let active = true
    const measure = () => {
      const element = base.current
      const text = element?.firstChild
      if (!active || !element || !text) return
      const rect = element.getBoundingClientRect()
      const section = element.closest('section')!
      const scale = section.getBoundingClientRect().width / section.offsetWidth
      const offsets = [...'GRACIAS'].map((_, index) => {
        const range = document.createRange()
        range.setStart(text, index)
        range.setEnd(text, index + 1)
        return (range.getBoundingClientRect().left - rect.left) / scale
      })
      setPositions(offsets)
    }
    const observer = new ResizeObserver(measure)
    if (base.current?.parentElement) observer.observe(base.current.parentElement)
    window.addEventListener('resize', measure)
    document.fonts.ready.then(measure)
    return () => { active = false; observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [])
  return <h2 id="contacto-title" data-figma-node="1:323" data-contacto-enter data-ready={positions.length === 7} data-touch-wave={touchWave} onClick={waveOnTouch} aria-label="GRACIAS">
    <span ref={base} className="contacto-title-base" aria-hidden="true">GRACIAS</span>
    {positions.map((left, index) => <span key={index} className="contacto-title-letter" aria-hidden="true" style={{ left, '--letter-delay': `${index * 55}ms` } as CSSProperties}>{'GRACIAS'[index]}</span>)}
  </h2>
}

export function Contacto() {
  const host = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const reducedMotion = useReducedMotion()
  const still = Boolean(reducedMotion) || new URLSearchParams(window.location.search).get('motion') === 'off'
  const [revealed, setRevealed] = useState(false)
  const [inView, setInView] = useState(false)
  const [visible, setVisible] = useState(document.visibilityState === 'visible')

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
    const sync = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  useEffect(() => {
    if (still || !host.current) return
    let active = true
    const element = host.current
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0]
      setInView(entry.isIntersecting)
      if (!entry.isIntersecting || entry.intersectionRatio < .18) return
      Promise.all([document.fonts.ready, decodeImages([...element.querySelectorAll('img')])]).then(() => {
        if (active) setRevealed(true)
      })
    }, { threshold: [0, .18] })
    observer.observe(element)
    return () => { active = false; observer.disconnect() }
  }, [still])

  useEffect(() => {
    if (window.location.hash !== '#contacto') return
    let active = true
    document.fonts.ready.then(() => {
      if (active) host.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    return () => { active = false }
  }, [])

  return <div ref={host} className="contacto-host" style={{ height: 707 * scale, scrollMarginTop: 44 * scale }}>
    <section id="contacto" className="contacto-composition" aria-labelledby="contacto-title" data-figma-node="1:317" data-motion={still ? 'off' : 'on'} data-revealed={still || revealed} data-active={inView && visible} style={{ transform: `scale(${scale})`, scrollMarginTop: 44 * scale }}>
      <div className="contacto-background" aria-hidden="true">
        <svg className="contacto-grid" width="1440" height="880" data-figma-node="1:318">
          <path d={[
            ...Array.from({ length: 31 }, (_, index) => `M${index * 48} 0V880`),
            ...Array.from({ length: 19 }, (_, index) => `M0 ${index * 48}H1440`),
          ].join(' ')} fill="none" stroke="#F4EBDD" strokeWidth="3" />
        </svg>
      </div>
      <img className="contacto-character" src={personaje} {...responsiveImage(personaje)} width={505} height={628} alt="Giam ilustrado caminando con una sudadera naranja" data-figma-node="1:320" draggable={false} />
      <img className="contacto-divider" src={separador} alt="" aria-hidden="true" data-figma-node="1:321" />
      <WaveTitle />
      <p className="contacto-farewell" data-figma-node="1:324" data-contacto-enter style={{ '--enter-delay': '140ms' } as CSSProperties}>Fin del recorrido<span className="contacto-dots">{[0, 1, 2].map(index => <span key={index} style={{ '--dot-delay': `${index * 250}ms` } as CSSProperties}>.</span>)}</span><br />por ahora.</p>
      <address className="contacto-links" aria-label="Vías de contacto de Giam Tejerina">
        {contacts.map((contact, index) => <a key={contact.node} className="contacto-link" data-contacto-enter href={contact.href} target={contact.href.startsWith('https:') ? '_blank' : undefined} rel={contact.href.startsWith('https:') ? 'noopener noreferrer' : undefined} aria-label={`${contact.name}: ${contact.text}`} style={{ left: contact.x, top: contact.y, width: 1410 - contact.x, height: contact.height, '--enter-delay': `${280 + index * 90}ms` } as CSSProperties}>
          <img src={contact.icon} width={contact.width} height={contact.height} alt="" aria-hidden="true" data-figma-node={contact.node} />
          <span className="contacto-link-label" data-figma-node={contact.textNode} style={{ left: 1019 - contact.x, top: contact.textY - contact.y, width: contact.textWidth }}><span className="contacto-link-text">{contact.text}</span></span>
        </a>)}
      </address>
    </section>
  </div>
}
