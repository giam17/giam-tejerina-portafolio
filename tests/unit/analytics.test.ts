import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseAnalyticsEvent } from '../../server/analytics.js'

const id = 'e4ad5629-126f-4c71-8ab2-ff585619fcf3'

test('acepta una visita y conserva solo los campos necesarios', () => {
  assert.deepEqual(
    parseAnalyticsEvent({ id, kind: 'page_view', target: 'portfolio', extra: 'ignorar' }),
    { id, kind: 'page_view', target: 'portfolio' },
  )
})

test('acepta un clic en un enlace de contacto permitido', () => {
  const event = { id, kind: 'contact_click', target: 'whatsapp' }
  assert.deepEqual(parseAnalyticsEvent(event), event)
})

test('rechaza destinos desconocidos, IDs inválidos y tipos incorrectos', () => {
  assert.equal(parseAnalyticsEvent({ id, kind: 'contact_click', target: 'desconocido' }), null)
  assert.equal(parseAnalyticsEvent({ id, kind: 'contact_click', target: 'constructor' }), null)
  assert.equal(parseAnalyticsEvent({ id: 'incorrecto', kind: 'page_view', target: 'portfolio' }), null)
  assert.equal(parseAnalyticsEvent({ id, kind: 'share', target: 'portfolio' }), null)
})
