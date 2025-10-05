import postgres, { Sql } from 'postgres'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable')
}

declare global {
  // eslint-disable-next-line no-var
  var __sql: Sql<any> | undefined
}

const client = globalThis.__sql ?? postgres(connectionString)

if (process.env.NODE_ENV !== 'production') {
  globalThis.__sql = client
}

export default client
export type { Sql }

