import { readFileSync } from 'node:fs'
import { Pool } from 'pg'
import { createApp } from './app.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Configura DATABASE_URL en el archivo .env del servidor.')
}

let databaseUrl: URL
try {
  databaseUrl = new URL(connectionString)
  if (databaseUrl.protocol !== 'postgres:' && databaseUrl.protocol !== 'postgresql:') {
    throw new Error()
  }
} catch {
  throw new Error('DATABASE_URL debe ser una URL válida de PostgreSQL.')
}
const caFile = process.env.DATABASE_CA_FILE
const useTls = process.env.DATABASE_SSL !== 'false'

// La configuración TLS se mantiene separada de la URL de conexión.
for (const option of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) {
  databaseUrl.searchParams.delete(option)
}
const pool = new Pool({
  connectionString: databaseUrl.toString(),
  ssl: useTls ? { rejectUnauthorized: true, ...(caFile ? { ca: readFileSync(caFile, 'utf8') } : {}) } : false,
  max: 4,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
})
pool.on('error', () => console.error('Se perdió una conexión inactiva con PostgreSQL.'))

const app = createApp(pool, process.env.STATS_ADMIN_PASSWORD)
if (process.env.API_TRUST_PROXY === 'true') app.set('trust proxy', 1)

const port = Number(process.env.API_PORT ?? 3001)
const host = process.env.API_HOST ?? '127.0.0.1'
const server = app.listen(port, host, () => console.log(`API del portafolio en http://${host}:${port}`))

function shutdown() {
  server.close(() => {
    void pool.end()
  })
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
