import type { AnalyticsEvent } from '../../shared/analytics'

function eventId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

export function recordEvent(event: AnalyticsEvent) {
  if (!globalThis.crypto?.getRandomValues) return
  void fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: eventId(), ...event }),
    keepalive: true,
  }).catch(() => {
    // Si falla la medición, la navegación y los enlaces siguen funcionando.
  })
}
