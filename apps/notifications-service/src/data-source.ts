import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Configuração de conexão
ConfigModule.forRoot();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'challenge_db',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // NUNCA true em DataSource para migrations
});
