import { ConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvenementModule } from './evenement/evenement.module';
import { InscriptionModule } from './inscription/inscription.module';
import { NotificationModule } from './notification/notification.module';
import { UtilisateurModule } from './utilisateur/utilisateur.module';
import { IamModule } from './iam/iam.module';
import { Utilisateur } from './utilisateur/model/utilisateur.model';
import { Evenement } from './evenement/model/evenement.model';
import { Inscription } from './inscription/model/inscription.model';
import { Notification } from './notification/model/notification.model';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Utilisateur, Evenement, Inscription, Notification],
      synchronize: false,
      autoLoadEntities: true,
    }),
    //   TypeOrmModule.forRoot({
    //     type: 'postgres',
    //     host: 'localhost',
    //     port: 5000,
    //     database: 'bdd_gestion_evenement',
    //     username: 'postgres',
    //     password: '1234',
    //     autoLoadEntities: true,
    //     synchronize: true,
    //   }),
    IamModule,

    EvenementModule,
    InscriptionModule,
    NotificationModule,
    UtilisateurModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
