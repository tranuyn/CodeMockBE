import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  url: process.env.SUPABASE_DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  //migrations: ['src/database/migrations/*.ts'],
});
