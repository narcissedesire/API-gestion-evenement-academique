import { Module } from '@nestjs/common';
import { InscriptionController } from './inscription.controller';
import { InscriptionService } from './inscription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscription } from './model/inscription.model';
import { Evenement } from 'src/evenement/model/evenement.model';
import { Utilisateur } from 'src/utilisateur/model/utilisateur.model';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  controllers: [InscriptionController],
  providers: [InscriptionService],
  imports: [
    TypeOrmModule.forFeature([
      Inscription,
      Evenement,
      Utilisateur,
      NotificationService,
    ]),
    NotificationModule,
  ],
})
export class InscriptionModule {}
