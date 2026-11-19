import { useRef, useState, type FormEvent } from 'react'
import { contactLabels, type StatsResponse } from '../../shared/analytics'
import './stats.css'

const dateLabel = new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeZone: 'UTC' })
const contacts = Object.entries(contactLabels) as [keyof typeof contactLabels, string][]

export function StatsPage() {
  const [stats, setStats] = useState<StatsResponse>()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const credential = useRef('')

  async function load(password: string) {
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/stats', {
        headers: { Authorization: 'Bearer ' + password },
        cache: 'no-store',
      })
      if (response.status === 401) {
        credential.current = ''
        setStats(undefined)
        setError('Contraseña incorrecta.')
        return
      }
      if (!response.ok) {
        setError(response.status === 429 ? 'Demasiados intentos. Prueba más tarde.' : 'Las estadísticas no están disponibles.')
        return
      }
      const data: StatsResponse = await response.json()
      credential.current = password
      setStats(data)
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setPending(false)
    }
  }

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const password = String(new FormData(form).get('password') ?? '')
    form.reset()
    void load(password)
  }

  return (
    <main className="stats-view">
      <a href="/">← Volver al portafolio</a>
      <h1>Estadísticas del portafolio</h1>
      {stats ? (
        <>
          <p>Visitas y clics de los últimos 7 días, hora de Bolivia.</p>
          <div className="stats-actions">
            <button type="button" disabled={pending} onClick={() => void load(credential.current)}>Actualizar</button>
            <button type="button" disabled={pending} onClick={() => {
              credential.current = ''
              setStats(undefined)
              setError('')
            }}>Cerrar sesión</button>
          </div>
          <div className="stats-table" role="region" aria-label="Actividad diaria" tabIndex={0}>
            <table>
              <caption>Actividad diaria</caption>
              <thead><tr><th scope="col">Fecha</th><th scope="col">Visitas</th>{contacts.map(([key, label]) => <th key={key} scope="col">{label}</th>)}</tr></thead>
              <tbody>{stats.days.map(day => (
                <tr key={day.day}>
                  <th scope="row">{dateLabel.format(new Date(day.day + 'T00:00:00Z'))}</th>
                  <td>{day.views}</td>
                  {contacts.map(([key]) => <td key={key}>{day[key]}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      ) : (
        <form className="stats-login" onSubmit={signIn}>
          <label htmlFor="stats-password">Contraseña de administrador</label>
          <input id="stats-password" name="password" type="password" autoComplete="current-password" required />
          <button type="submit" disabled={pending}>{pending ? 'Comprobando…' : 'Ver estadísticas'}</button>
        </form>
      )}
      {error && <p role="alert">{error}</p>}
    </main>
  )
}
