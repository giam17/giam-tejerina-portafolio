import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { readdir, readFile } from 'node:fs/promises'
import type { AddressInfo } from 'node:net'
import { Client, Pool } from 'pg'
import { createApp } from '../../server/app.js'

export const statsPassword = 'clave-publica-solo-para-pruebas'
const migrations = new URL('../../supabase/migrations/', import.meta.url)

async function createTestDatabase() {
  const value = process.env.TEST_DATABASE_URL
  if (!value) throw new Error('Define TEST_DATABASE_URL para el PostgreSQL temporal de pruebas.')

  const base = new URL(value)
  if (
    !['postgresql:', 'postgres:'].includes(base.protocol)
    || !['127.0.0.1', 'localhost'].includes(base.hostname)
    || base.pathname !== '/portfolio_test'
  ) {
    throw new Error('TEST_DATABASE_URL debe apuntar a portfolio_test en la máquina local.')
  }

  const name = 'portfolio_test_' + randomUUID().replaceAll('-', '')
  const admin = new Client({ connectionString: base.href, connectionTimeoutMillis: 5000 })
  await admin.connect()

  base.pathname = '/' + name
  const owner = new Pool({ connectionString: base.href, connectionTimeoutMillis: 5000 })
  const runtime = new Pool({
    connectionString: base.href,
    options: '-c role=portfolio_web',
    connectionTimeoutMillis: 5000,
  })
  let created = false

  async function close() {
    try {
      await Promise.all([runtime.end(), owner.end()])
      if (created) await admin.query('drop database ' + name)
    } finally {
      await admin.end()
    }
  }

  try {
    // Los roles pertenecen al clúster. Serializar el arranque evita carreras
    // cuando alguien ejecuta ambas suites desde su equipo.
    await admin.query('select pg_advisory_lock(871420)')
    await admin.query('create database ' + name)
    created = true

    await owner.query(`
      do $test_role$
      begin
        if not exists (select 1 from pg_roles where rolname = 'portfolio_web') then
          create role portfolio_web nologin;
        end if;
      end;
      $test_role$;
    `)
    for (const file of (await readdir(migrations)).filter(file => file.endsWith('.sql')).sort()) {
      await owner.query(await readFile(new URL(file, migrations), 'utf8'))
    }
    await owner.query('grant portfolio_catalog_reader to portfolio_web')
    await admin.query('select pg_advisory_unlock(871420)')
    return { owner, runtime, close }
  } catch (error) {
    await close()
    throw error
  }
}

export async function startTestServer() {
  const database = await createTestDatabase()
  try {
    const server = createApp(database.runtime, statsPassword).listen(0, '127.0.0.1')
    await once(server, 'listening')
    const { port } = server.address() as AddressInfo
    return {
      origin: 'http://127.0.0.1:' + port,
      db: database.owner,
      async close() {
        try {
          await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve())
          })
        } finally {
          await database.close()
        }
      },
    }
  } catch (error) {
    await database.close()
    throw error
  }
}
