import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvenementModule } from './evenement/evenement.module';
import { InscriptionModule } from './inscription/inscription.module';
import { NotificationModule } from './notification/notification.module';
import { UtilisateurModule } from './utilisateur/utilisateur.module';
import { IamModule } from './iam/iam.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5000,
      database: 'bdd_gestion_evenement',
      username: 'postgres',
      password: '1234',
      autoLoadEntities: true,
      synchronize: true,
    }),
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
