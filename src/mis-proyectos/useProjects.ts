import { useEffect, useState } from 'react'
import type { Project } from '../../shared/projects'

export function useProjects() {
  const [projects, setProjects] = useState<ReadonlyMap<string, Project>>(() => new Map())

  useEffect(() => {
    const controller = new AbortController()

    async function loadProjects() {
      try {
        const response = await fetch('/api/projects', { signal: controller.signal })
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return

        const catalog: Project[] = await response.json()
        if (Array.isArray(catalog) && !controller.signal.aborted) {
          setProjects(new Map(catalog.map(project => [project.slug, project])))
        }
      } catch {
        // Los enlaces originales siguen disponibles si falla la consulta.
      }
    }

    void loadProjects()
    return () => controller.abort()
  }, [])

  return projects
}
