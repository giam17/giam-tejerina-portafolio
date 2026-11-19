import { createHash, timingSafeEqual } from 'node:crypto'
import { json, Router, type ErrorRequestHandler } from 'express'
import { rateLimit } from 'express-rate-limit'
import type { Pool } from 'pg'
import { contactLabels, type AnalyticsEvent, type DailyStats } from '../shared/analytics.js'

const timeZone = 'America/La_Paz'
const uuid = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i

export function parseAnalyticsEvent(input: unknown): (AnalyticsEvent & { id: string }) | null {
  if (!input || typeof input !== 'object') return null
  const { id, kind, target } = input as Record<string, unknown>
  if (typeof id !== 'string' || !uuid.test(id)) return null
  if (kind === 'page_view' && target === 'portfolio') return { id, kind, target }
  if (kind === 'contact_click' && typeof target === 'string' && Object.hasOwn(contactLabels, target)) {
    return { id, kind, target: target as keyof typeof contactLabels }
  }
  return null
}

const digest = (value: string) => createHash('sha256').update(value).digest()
const invalidJson: ErrorRequestHandler = (error, _request, response, next) => {
  if (error.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'El cuerpo debe ser JSON válido.' })
  } else if (error.type === 'entity.too.large') {
    response.status(413).json({ error: 'El evento excede el tamaño permitido.' })
  } else {
    next(error)
  }
}

export function analyticsRouter(pool: Pool, adminPassword: string | undefined) {
  const router = Router()
  const adminDigest = adminPassword ? digest(adminPassword) : null
  const eventLimit = rateLimit({ windowMs: 60_000, limit: 90, legacyHeaders: false, standardHeaders: 'draft-8' })
  const authLimit = rateLimit({ windowMs: 600_000, limit: 10, skipSuccessfulRequests: true, legacyHeaders: false, standardHeaders: 'draft-8' })

  router.post('/events', eventLimit, json({ limit: '1kb' }), async (request, response) => {
    if (!request.is('application/json')) {
      response.status(415).json({ error: 'Envía el evento como application/json.' })
      return
    }
    const event = parseAnalyticsEvent(request.body)
    if (!event) {
      response.status(400).json({ error: 'Evento de actividad no válido.' })
      return
    }
    try {
      await pool.query(
        'insert into portfolio.analytics_events (id, kind, target) values ($1, $2, $3) on conflict (id) do nothing',
        [event.id, event.kind, event.target],
      )
      response.sendStatus(204)
    } catch {
      console.error('Falló el registro de actividad del portafolio.')
      response.status(503).json({ error: 'El registro de actividad no está disponible.' })
    }
  })

  router.get('/stats', authLimit, async (request, response) => {
    response.set('Cache-Control', 'no-store')
    if (!adminDigest) {
      response.status(503).json({ error: 'Las estadísticas no están configuradas.' })
      return
    }
    const authorization = request.get('authorization')
    if (!authorization?.startsWith('Bearer ') || !timingSafeEqual(digest(authorization.slice(7)), adminDigest)) {
      response.status(401).json({ error: 'Contraseña incorrecta.' })
      return
    }

    try {
      const { rows } = await pool.query<DailyStats>(`
        with today as (
          select (now() at time zone $1)::date as day
        ), days as (
          select today.day - offset_days as day
          from today cross join generate_series(0, 6) as offset_days
        )
        select to_char(days.day, 'YYYY-MM-DD') as day,
          count(events.id) filter (where events.kind = 'page_view')::int as views,
          count(events.id) filter (where events.target = 'whatsapp')::int as whatsapp,
          count(events.id) filter (where events.target = 'instagram')::int as instagram,
          count(events.id) filter (where events.target = 'email')::int as email,
          count(events.id) filter (where events.target = 'linkedin')::int as linkedin
        from days
        left join portfolio.analytics_events as events
          on events.created_at >= (days.day::timestamp at time zone $1)
          and events.created_at < ((days.day + 1)::timestamp at time zone $1)
        group by days.day
        order by days.day desc
      `, [timeZone])
      response.json({ timeZone, days: rows })
    } catch {
      console.error('Falló la consulta de estadísticas del portafolio.')
      response.status(503).json({ error: 'Las estadísticas no están disponibles.' })
    }
  })
  router.use(invalidJson)
  return router
}
