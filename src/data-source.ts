import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Configuración de DataSource para CLI de TypeORM.
 * Usada para generar y correr migraciones:
 *
 *   npx typeorm -d src/data-source.ts migration:generate src/migrations/InitialSchema
 *   npx typeorm -d src/data-source.ts migration:run
 *
 * NOTA: ts-node debe estar disponible (ya está en devDependencies).
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
