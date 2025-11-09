import { Pool } from 'pg'

let pool: Pool | null = null

const GLOBAL_KEY = Symbol.for('financely.db.pool')

type GlobalWithPool = typeof globalThis & {
  [GLOBAL_KEY]?: Pool | null
}

function getGlobalPoolHolder(): GlobalWithPool {
  return globalThis as GlobalWithPool
}

export function getPool(): Pool {
  const holder = getGlobalPoolHolder()

  if (holder[GLOBAL_KEY]) {
    pool = holder[GLOBAL_KEY] as Pool
  }

  if (!pool) {
    const connectionString =
      process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!connectionString) {
      throw new Error(
        'Database connection string is missing. Set SUPABASE_DB_URL, DATABASE_URL, or POSTGRES_URL.'
      )
    }

    pool = new Pool({
      connectionString,
      max: process.env.NODE_ENV === 'production' ? 8 : 2,
      idleTimeoutMillis: 10_000,
    })

    holder[GLOBAL_KEY] = pool
  }

  return pool
}

export function setPool(externalPool: Pool | null) {
  const holder = getGlobalPoolHolder()
  pool = externalPool
  holder[GLOBAL_KEY] = externalPool
}
