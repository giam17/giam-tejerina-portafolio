import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const chapters = ['portada', 'sobre-mi', 'proyectos', 'museo', 'personajes', 'educa', 'contacto']
const names = ['Inicio', 'Sobre mí', 'Proyectos', 'Museo', 'Personajes', 'EDUCA', 'Contacto']
const disciplines = 'SYSTEMS ENGINEER / DATA ANALYST / DESIGNER / MARKETER / '

/** Mounts only on small screens. Desktop never receives observers or extra markup. */
export function MobileExperience() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const query = matchMedia('(max-width: 900px)')
    const sync = () => setMobile(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  return mobile ? <MobileCollage /> : null
}

function MobileCollage() {
  const [chapter, setChapter] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const progress = useRef<HTMLDivElement>(null)
  const still = paused || reduced || new URLSearchParams(location.search).get('motion') === 'off'

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.mobileCollage = still ? 'still' : 'moving'
    const sections = chapters.map(id => document.getElementById(id)!)
    const cards = [...document.querySelectorAll<HTMLElement>('.about-bio, .about-skills, .about-tools, .about-experience, .about-education, .project-category, .museum-technologies, .characters-artwork-group, .educa-photo')]
    const decorations = [...document.querySelectorAll<HTMLElement>('.about-photo, .projects-serious, .museum-category, .characters-category, .educa-category')]
    const animations = new Set<Animation>()
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer.unobserve(entry.target)
        if (still) continue
        const animation = entry.target.animate([
          { translate: '0 32px', opacity: .4 },
          { translate: '0 -3px', opacity: 1, offset: .8 },
          { translate: '0 0', opacity: 1 },
        ], { duration: 650, easing: 'cubic-bezier(.2,.75,.3,1)' })
        animations.add(animation)
        animation.onfinish = () => animations.delete(animation)
      }
    }, { threshold: 0, rootMargin: '0px 0px -50px 0px' })
    cards.forEach(card => observer.observe(card))
    let frame = 0
    const update = () => {
      frame = 0
      const height = window.innerHeight
      const distance = document.documentElement.scrollHeight - height
      progress.current?.style.setProperty('--read-progress', String(distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0))
      let current = 0
      sections.forEach((section, index) => { if (section.getBoundingClientRect().top <= height * .4) current = index })
      setChapter(current)
      if (!still) decorations.forEach(element => {
        const rect = element.getBoundingClientRect()
        if (rect.bottom < -100 || rect.top > height + 100) return
        const position = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - height / 2) / height))
        element.style.setProperty('--scroll-drift', `${position * 16}px`)
        element.style.setProperty('--scroll-turn', `${position * 3}deg`)
      })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    const resize = new ResizeObserver(schedule)
    resize.observe(document.body)
    update()
    return () => {
      delete root.dataset.mobileCollage
      observer.disconnect()
      resize.disconnect()
      cancelAnimationFrame(frame)
      animations.forEach(animation => animation.cancel())
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
      decorations.forEach(element => { element.style.removeProperty('--scroll-drift'); element.style.removeProperty('--scroll-turn') })
    }
  }, [still])

  const cover = document.getElementById('portada')
  return <>
    {cover && createPortal(<div className="mobile-cover-footer">
      <div className="mobile-ticker" aria-label="Systems engineer, data analyst, designer y marketer">
        <div className="mobile-ticker-track" aria-hidden="true"><span>{disciplines}</span><span>{disciplines}</span></div>
      </div>
      <a className="mobile-explore" href="#sobre-mi"><span>IDEAS CON PERSONALIDAD</span><span className="mobile-down" aria-hidden="true">↓</span><span>DESLIZA Y EXPLORA</span></a>
    </div>, cover)}
    <div className="mobile-reading-progress" ref={progress} aria-hidden="true" />
    <nav className="mobile-dock" aria-label="Navegación móvil">
      <span className="mobile-chapter" aria-label={`Sección ${chapter + 1}: ${names[chapter]}`}>{String(chapter + 1).padStart(2, '0')}<small>/07</small></span>
      <a href="#portada" aria-current={chapter === 0 ? 'location' : undefined}>Inicio</a>
      <a href="#proyectos" aria-current={chapter >= 2 && chapter <= 5 ? 'location' : undefined}>Proyectos</a>
      <a href="#contacto" aria-current={chapter === 6 ? 'location' : undefined}>Hablemos ↗</a>
      <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? 'Activar movimiento extra' : 'Pausar movimiento extra'}>{paused ? '▶' : 'Ⅱ'}</button>
    </nav>
  </>
}
