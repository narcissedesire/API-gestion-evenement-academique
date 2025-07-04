import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './model/notification.model';
import { Evenement } from 'src/evenement/model/evenement.model';
import { Utilisateur } from 'src/utilisateur/model/utilisateur.model';
import { NotificationGateway } from './notification.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { Inscription } from 'src/inscription/model/inscription.model';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      Evenement,
      Utilisateur,
      Inscription,
    ]),
    ScheduleModule.forRoot(),
  ],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
