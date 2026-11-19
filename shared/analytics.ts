export const contactLabels = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  email: 'Correo electrónico',
  linkedin: 'LinkedIn',
} as const

export type ContactTarget = keyof typeof contactLabels
export type AnalyticsEvent =
  | { kind: 'page_view'; target: 'portfolio' }
  | { kind: 'contact_click'; target: ContactTarget }

export type DailyStats = { day: string; views: number } & Record<ContactTarget, number>
export interface StatsResponse {
  timeZone: string
  days: DailyStats[]
}
