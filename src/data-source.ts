import { DataSource } from 'typeorm';
import { Utilisateur } from './utilisateur/model/utilisateur.model';
import { Evenement } from './evenement/model/evenement.model';
import { Inscription } from './inscription/model/inscription.model';
import { Notification } from './notification/model/notification.model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Utilisateur, Evenement, Inscription, Notification],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
