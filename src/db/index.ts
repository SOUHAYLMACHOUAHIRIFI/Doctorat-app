import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    try {
      if (!process.env.SQL_HOST && !process.env.DATABASE_URL) {
        throw new Error('SQL_HOST / DATABASE_URL not configured');
      }
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 15000,
      });

      global._postgresPool.on('error', (err) => {
        console.error('Unexpected error on idle SQL pool client:', err);
      });
    } catch {
      console.warn('[AI Studio] PostgreSQL not connected — using mock pool');
      global._postgresPool = {
        query: async () => ({ rows: [] }),
        connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }),
        end: async () => {},
        on: () => {},
      } as unknown as Pool;
    }
  }
  return global._postgresPool;
};

const pool = createPool();

let db: any;
try {
  if (!process.env.SQL_HOST && !process.env.DATABASE_URL) {
    throw new Error('Database not configured');
  }
  db = drizzle(pool, { schema });
} catch {
  console.warn('[AI Studio] Drizzle ORM not connected — using mock');
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  db = new Proxy(
    {},
    {
      get: (_, prop) =>
        prop === 'query'
          ? new Proxy({}, { get: () => noOp })
          : prop === 'insert' || prop === 'update' || prop === 'delete'
          ? () => ({ values: () => ({ onConflictDoNothing: async () => [] }) })
          : async () => [],
    }
  );
}

export { db, pool };
