import { Module } from '@nestjs/common';
import { EvenementController } from './evenement.controller';
import { EvenementService } from './evenement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evenement } from './model/evenement.model';
import { Inscription } from 'src/inscription/model/inscription.model';
import { Notification } from 'src/notification/model/notification.model';
import { Utilisateur } from 'src/utilisateur/model/utilisateur.model';

@Module({
  controllers: [EvenementController],
  providers: [EvenementService],
  imports: [
    TypeOrmModule.forFeature([
      Evenement,
      Inscription,
      Notification,
      Utilisateur,
    ]),
  ],
})
export class EvenementModule {}
