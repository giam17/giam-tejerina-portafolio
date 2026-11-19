import express from 'express'
import type { Pool } from 'pg'
import type { Project } from '../shared/projects.js'
import { analyticsRouter } from './analytics.js'

export function createApp(pool: Pool, statsPassword: string | undefined) {
  const app = express()
  app.disable('x-powered-by')
  app.use('/api', analyticsRouter(pool, statsPassword))

  app.get('/api/projects', async (_request, response) => {
    response.set('Cache-Control', 'no-store')
    try {
      const { rows } = await pool.query<Project>(`
        SELECT slug, title, description, thumbnail_key AS "thumbnailKey"
        FROM portfolio.projects
        WHERE published
        ORDER BY display_order, slug
      `)
      response.json(rows)
    } catch {
      console.error('Falló la consulta del catálogo de proyectos.')
      response.status(503).json({ error: 'El catálogo no está disponible en este momento.' })
    }
  })

  return app
}
