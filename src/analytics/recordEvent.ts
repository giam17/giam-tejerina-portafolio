import type { AnalyticsEvent } from '../../shared/analytics'

export function recordEvent(event: AnalyticsEvent) {
  if (!globalThis.crypto?.randomUUID) return
  void fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: crypto.randomUUID(), ...event }),
    keepalive: true,
  }).catch(() => {
    // Si falla la medición, la navegación y los enlaces siguen funcionando.
  })
}
