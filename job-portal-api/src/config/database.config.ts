import { registerAs } from '@nestjs/config';

// database.config.ts
export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),          // hint: env vars are always strings, DB port must be a number
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
synchronize: process.env.NODE_ENV === 'development',
logging: process.env.NODE_ENV === 'development',
}));