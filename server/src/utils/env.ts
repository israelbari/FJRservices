import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  MINIO_ENDPOINT: z.string().default('minio'),
  MINIO_PORT: z.string().default('9000'),
  MINIO_USE_SSL: z.string().default('false'),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_BUCKET_MEDIA: z.string().default('media'),
  MINIO_BUCKET_CLIENTS: z.string().default('client-media'),
  MINIO_PUBLIC_URL: z.string().optional().default(''),
  ODOO_URL: z.string().optional().default(''),
  ODOO_DB: z.string().optional().default(''),
  ODOO_USERNAME: z.string().optional().default(''),
  ODOO_API_KEY: z.string().optional().default(''),
});

export const env = envSchema.parse(process.env);
