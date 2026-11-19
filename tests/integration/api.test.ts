import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { after, before, beforeEach, test } from 'node:test'
import type { StatsResponse } from '../../shared/analytics.js'
import type { Project } from '../../shared/projects.js'
import { startTestServer, statsPassword } from '../support/test-server.js'

let app: Awaited<ReturnType<typeof startTestServer>>

before(async () => { app = await startTestServer() })
after(async () => { await app?.close() })
beforeEach(async () => { await app.db.query('truncate portfolio.analytics_events') })

test('el catálogo devuelve los proyectos publicados en el orden de la base', async () => {
  await app.db.query(`
    insert into portfolio.projects (slug, title, description, thumbnail_key, display_order, published)
    values ('oculto', 'Borrador', '', 'oculto', 1, false)
  `)
  await app.db.query("update portfolio.projects set display_order = 5 where slug = 'educa'")

  const response = await fetch(app.origin + '/api/projects')
  assert.equal(response.status, 200)
  const projects: Project[] = await response.json()
  assert.deepEqual(projects.map(project => project.slug), ['educa', 'museo', 'personajes'])
})

test('registra un clic y evita contarlo dos veces si se reenvía', async () => {
  const id = randomUUID()
  const event = { id, kind: 'contact_click', target: 'linkedin' }
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(app.origin + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
    assert.equal(response.status, 204)
  }

  const { rows } = await app.db.query(
    'select id, kind, target from portfolio.analytics_events where id = $1',
    [id],
  )
  assert.deepEqual(rows, [event])
})

test('agrupa las visitas y clics a ambos lados de la medianoche de Bolivia', async () => {
  await app.db.query(`
    with cutoff as (
      select (((now() at time zone 'America/La_Paz')::date - 1)::timestamp at time zone 'America/La_Paz') as midnight
    )
    insert into portfolio.analytics_events (id, kind, target, created_at)
    select $1::uuid, 'page_view', 'portfolio', midnight - interval '1 second' from cutoff
    union all
    select $2::uuid, 'page_view', 'portfolio', midnight from cutoff
    union all
    select $3::uuid, 'contact_click', 'whatsapp', midnight + interval '1 second' from cutoff
  `, [randomUUID(), randomUUID(), randomUUID()])

  const response = await fetch(app.origin + '/api/stats', {
    headers: { Authorization: 'Bearer ' + statsPassword },
  })
  assert.equal(response.status, 200)
  const stats: StatsResponse = await response.json()
  assert.equal(stats.timeZone, 'America/La_Paz')
  assert.equal(stats.days.length, 7)
  assert.deepEqual(stats.days.filter(day => day.views > 0).map(day => [day.views, day.whatsapp]), [[1, 1], [1, 0]])
  assert.equal(stats.days[0].views, 0)
})
