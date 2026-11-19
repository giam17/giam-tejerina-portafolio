import { useEffect, useState } from 'react'
import type { Project } from '../../shared/projects'
import { responsiveImage } from '../assets/images'
import museo from '../assets/museo/museum-home.webp'
import personajes from '../assets/personajes/happy.webp'
import educa from '../assets/educa/city-sucre.webp'
import './project-catalog.css'

const thumbnails = new Map([
  ['museo', museo],
  ['personajes', personajes],
  ['educa', educa],
])

type CatalogState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; projects: Project[] }

export function ProjectCatalog() {
  const [state, setState] = useState<CatalogState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    async function loadProjects() {
      try {
        const response = await fetch('/api/projects', { signal: controller.signal })
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
          throw new Error('Catálogo no disponible')
        }
        const projects: Project[] = await response.json()
        if (!Array.isArray(projects)) throw new Error('Catálogo no válido')
        if (!controller.signal.aborted) setState({ status: 'ready', projects })
      } catch {
        if (!controller.signal.aborted) setState({ status: 'error' })
      }
    }

    void loadProjects()
    return () => controller.abort()
  }, [])

  return (
    <section className="project-catalog" aria-label="Catálogo de proyectos">
      {state.status === 'loading' && <p role="status">Cargando proyectos…</p>}
      {state.status === 'error' && <p role="status">El catálogo no está disponible en este momento.</p>}
      {state.status === 'ready' && state.projects.length === 0 && <p>No hay proyectos publicados.</p>}
      {state.status === 'ready' && state.projects.length > 0 && (
        <ul className="project-catalog-grid">
          {state.projects.map(project => {
            const thumbnail = thumbnails.get(project.thumbnailKey)
            return (
              <li className="project-catalog-card" key={project.slug}>
                {thumbnail && <img src={thumbnail} alt="" {...responsiveImage(thumbnail, { sizes: '(max-width: 640px) 90vw, 32vw' })} />}
                <div>
                  <h3><a href={`#${encodeURIComponent(project.slug)}`}>{project.title}</a></h3>
                  <p>{project.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
