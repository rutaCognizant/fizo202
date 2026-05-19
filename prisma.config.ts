import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

const host = env('DATABASE_HOST') || 'localhost';
const port = Number(env('DATABASE_PORT') || 3306);
const user = env('DATABASE_USER') || 'root';
const password = env('DATABASE_PASS') || '';
const database = env('DATABASE_NAME') || 'fizo202';

const connectionString = `mysql://${user}:${password}@${host}:${port}/${database}`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: connectionString,
  },
});
