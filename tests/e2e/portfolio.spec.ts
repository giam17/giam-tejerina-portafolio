import type { AddressInfo } from 'node:net'
import { expect, test, type Page } from '@playwright/test'
import { preview, type PreviewServer } from 'vite'
import { startTestServer, statsPassword } from '../support/test-server.js'

let api: Awaited<ReturnType<typeof startTestServer>>
let site: PreviewServer
let url: string

test.beforeAll(async () => {
  api = await startTestServer()
  site = await preview({
    preview: { host: '127.0.0.1', port: 0, strictPort: true, proxy: { '/api': api.origin } },
  })
  url = 'http://127.0.0.1:' + (site.httpServer.address() as AddressInfo).port
})

test.afterAll(async () => {
  try {
    if (site) await new Promise<void>(resolve => site.httpServer.close(() => resolve()))
  } finally {
    await api?.close()
  }
})

async function openStats(page: Page) {
  await page.goto(url + '/admin/estadisticas')
  await page.getByLabel('Contraseña de administrador').fill(statsPassword)
  await page.getByRole('button', { name: 'Ver estadísticas' }).click()
  await expect(page.getByRole('table', { name: 'Actividad diaria' })).toBeVisible()
}

test('el enlace original usa el título de PostgreSQL y conserva la composición', async ({ page }) => {
  await api.db.query("update portfolio.projects set title = 'EDUCA para la defensa' where slug = 'educa'")
  await page.goto(url + '/?motion=off#proyectos')
  await expect(page.locator('main > .projects-host + .museum-host')).toHaveCount(1)

  await page.setViewportSize({ width: 390, height: 844 })
  const project = page.locator('#proyectos').getByRole('link', { name: 'Ver proyecto EDUCA para la defensa' })
  await expect(project).toHaveAttribute('href', '#educa')
  await expect(project).toHaveAccessibleDescription('Identidad visual y branding con referencias a la arquitectura de Sucre.')
  await expect(page.locator('#proyectos').getByRole('heading', { name: 'BRANDING' })).toBeVisible()
})

test('un clic real en WhatsApp incrementa el contador privado', async ({ page, context }) => {
  await openStats(page)
  const latest = page.getByRole('table').getByRole('row').nth(1)
  const whatsapp = latest.getByRole('cell').nth(1)
  const initial = Number(await whatsapp.textContent())

  await context.route('https://wa.me/**', route => route.abort())
  const visitor = await context.newPage()
  await visitor.goto(url + '/?motion=off#contacto')
  const [recorded] = await Promise.all([
    visitor.waitForResponse(response => response.url().endsWith('/api/events')
      && response.request().postDataJSON()?.kind === 'contact_click'),
    visitor.getByRole('link', { name: /^WhatsApp:/ }).click(),
  ])
  expect(recorded.status()).toBe(204)

  await page.getByRole('button', { name: 'Actualizar' }).click()
  await expect(whatsapp).toHaveText(String(initial + 1))
})

test('un visitante sin la contraseña no puede consultar las estadísticas', async ({ page, request }) => {
  expect((await request.get(url + '/api/stats')).status()).toBe(401)
  await page.goto(url + '/admin/estadisticas')
  await page.getByLabel('Contraseña de administrador').fill('contraseña equivocada')
  await page.getByRole('button', { name: 'Ver estadísticas' }).click()
  await expect(page.getByRole('alert')).toHaveText('Contraseña incorrecta.')
  await expect(page.getByRole('table')).toHaveCount(0)
})
