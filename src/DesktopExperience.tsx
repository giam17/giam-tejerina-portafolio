import { useEffect, useState } from 'react'
import './desktop-experience.css'

const chapters = [['portada', 'Inicio'], ['sobre-mi', 'Sobre mí'], ['proyectos', 'Proyectos'], ['museo', 'Museo'], ['personajes', 'Personajes'], ['educa', 'EDUCA'], ['contacto', 'Contacto']]

export function DesktopExperience() {
  const [desktop, setDesktop] = useState(false)
  const [active, setActive] = useState('portada')
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const media = matchMedia('(min-width: 901px)')
    const update = () => setDesktop(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!desktop) return
    let frame = 0
    const update = () => {
      frame = 0
      const total = document.documentElement.scrollHeight - innerHeight
      setProgress(total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0)
      let current = 'portada'
      for (const [id] of chapters) {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= innerHeight * .4) current = id
      }
      if (total > 0 && scrollY >= total - 4) current = 'contacto'
      setActive(current)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const resize = new ResizeObserver(schedule)
    resize.observe(document.body)
    return () => { cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
  }, [desktop])
  useEffect(() => {
    if (!desktop || new URLSearchParams(location.search).get('motion') === 'off') return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    const animations: Animation[] = []
    const observer = new IntersectionObserver(entries => {
      let order = 0
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer.unobserve(entry.target)
        if (reduce.matches) continue
        animations.push(entry.target.animate([
          { opacity: .75, translate: '0 8px' }, { opacity: 1, translate: '0 0' },
        ], { duration: 450, delay: order++ * 50, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }))
      }
    }, { threshold: .12 })
    document.querySelectorAll('.about-tools, .about-bio, .about-education, .about-experience, .about-skills').forEach(card => observer.observe(card))
    const stop = () => { if (reduce.matches) animations.forEach(animation => animation.cancel()) }
    reduce.addEventListener('change', stop)
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); reduce.removeEventListener('change', stop) }
  }, [desktop])
  if (!desktop) return null
  return <>
    <div className="desktop-reading-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
    <nav className="desktop-chapters" aria-label="Recorrido del portafolio" data-visible={active !== 'portada'}>
      <span className="desktop-chapter-caption">EXPLORA /</span>
      {chapters.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{label}</a>)}
    </nav>
  </>
}
