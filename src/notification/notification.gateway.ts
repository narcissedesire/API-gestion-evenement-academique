import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Evenement } from '../evenement/model/evenement.model';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { uuidRegex } from 'src/utils/uuidRegex';

export interface NotificationDto {
  contenu: string;
  evenementId: string;
  type: string;
  notificationId: string;
}

@Injectable()
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'notifications' })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, Socket> = new Map();
  private scheduledReminders: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
  ) {
    this.scheduleAllReminders();
  }

  async scheduleAllReminders() {
    console.log(
      `Planification des rappels pour tous les événements à ${new Date().toISOString()}`,
    );
    const currentTime = new Date();
    const currentTimeUTC = new Date(currentTime.getTime() - 3 * 60 * 60 * 1000); // Convertir EAT à UTC
    const events = await this.evenementRepository.find({
      where: {
        date_debut: Between(
          currentTimeUTC,
          new Date(currentTimeUTC.getTime() + 24 * 60 * 60 * 1000),
        ), // Événements dans les 24h
      },
      relations: ['inscription', 'inscription.utilisateurs'],
    });

    console.log(`Événements trouvés pour planification: ${events.length}`);
    for (const event of events) {
      this.scheduleReminder(event);
    }
  }

  scheduleReminder(event: Evenement) {
    const eventStartTime = new Date(event.date_debut);
    const reminderTime = new Date(
      eventStartTime.getTime() - 2 * 60 * 60 * 1000,
    ); // 2h avant
    const currentTime = new Date();
    const currentTimeUTC = new Date(currentTime.getTime() - 3 * 60 * 60 * 1000); // Convertir EAT à UTC
    const timeToReminder = reminderTime.getTime() - currentTimeUTC.getTime();

    if (timeToReminder > 0) {
      console.log(
        `Planification rappel pour événement ${event.id} à ${reminderTime.toISOString()} (dans ${timeToReminder / (1000 * 60)} minutes)`,
      );
      const timeout = setTimeout(async () => {
        console.log(`Exécution rappel pour événement ${event.id}`);
        await this.notificationService.notifyEventReminder(event.id);
        this.scheduledReminders.delete(event.id);
      }, timeToReminder);
      this.scheduledReminders.set(event.id, timeout);
    } else {
      console.log(
        `Rappel pour événement ${event.id} ignoré: déjà passé ou trop proche`,
      );
    }
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    uuidRegex(userId);

    this.connectedUsers.set(userId, client);
    console.log(`Utilisateur ${userId} connecté au WebSocket`);

    try {
      const unreadNotifications =
        await this.notificationService.getUnreadNotifications(userId);
      console.log(
        `Envoi de ${unreadNotifications.length} notifications non lues à ${userId}`,
      );
      for (const notification of unreadNotifications) {
        client.emit('notification', {
          notificationId: notification.id,
          contenu: notification.contenu,
          evenementId: notification.evenements?.id,
          type: notification.type_notification,
        });
      }
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des notifications pour ${userId}:`,
        error,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`Utilisateur ${userId} déconnecté`);
    }
  }

  async sendNotification(
    userId: string,
    notification: {
      notificationId: string;
      contenu: string;
      evenementId: string;
      type: string;
    },
  ): Promise<boolean> {
    const client = this.connectedUsers.get(userId);
    if (client) {
      client.emit('notification', notification);
      return true;
    }
    return false;
  }

  @SubscribeMessage('trigger-reminders')
  async handleTriggerReminders(client: Socket) {
    console.log(
      `Événement trigger-reminders reçu de ${client.handshake.query.userId}`,
    );
    try {
      await this.scheduleAllReminders();
      client.emit('reminders-triggered', {
        message: 'Planification des rappels déclenchée avec succès',
      });
    } catch (error) {
      console.error(`Erreur lors du déclenchement des rappels:`, error);
      client.emit('reminders-error', {
        message: 'Erreur lors de la planification des rappels',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
