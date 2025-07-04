import {
  Injectable,
  Inject,
  forwardRef,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  notificationType,
  notificationEtat,
} from './model/notification.model';
import { Utilisateur } from '../utilisateur/model/utilisateur.model';
import { Evenement } from '../evenement/model/evenement.model';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Inscription } from 'src/inscription/model/inscription.model';
import { NotificationGateway } from './notification.gateway';
import { uuidRegex } from 'src/utils/uuidRegex';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @Inject(SchedulerRegistry)
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async getNotificationsByUser(userId: string) {
    const notifications = await this.notificationRepository.find({
      where: { utilisateurs: { id: userId } },
      relations: ['utilisateurs', 'evenements'],
      order: { createdAt: 'DESC' },
    });

    if (notifications.length === 0) {
      return { message: "Vous n'as pas de notification" };
    }

    return { notification: notifications, nombre: notifications.length };
  }

  async createNotification(
    utilisateur: Utilisateur,
    evenement: Evenement,
    contenu: string,
    type: notificationType = notificationType.APP,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      utilisateurs: utilisateur,
      evenements: evenement,
      contenu,
      type_notification: type,
      etat: notificationEtat.EN_ATTENTE,
      lu: false,
    });

    try {
      const savedNotification =
        await this.notificationRepository.save(notification);

      const sent = await this.notificationGateway.sendNotification(
        utilisateur.id,
        {
          contenu,
          evenementId: evenement.id,
          type,
          notificationId: savedNotification.id,
        },
      );

      savedNotification.etat = sent
        ? notificationEtat.ENVOYE
        : notificationEtat.EN_ATTENTE;
      await this.notificationRepository.save(savedNotification);
      return savedNotification;
    } catch (error) {
      notification.etat = notificationEtat.ECHOUE;
      await this.notificationRepository.save(notification);
      throw new BadRequestException("Échec de l'envoi de la notification");
    }
  }

  async notifyEventReminder(evenementId: string): Promise<void> {
    const evenement = await this.notificationRepository.manager
      .getRepository(Evenement)
      .findOne({
        where: { id: evenementId },
        relations: ['inscription', 'inscription.utilisateurs'],
      });

    if (!evenement) {
      throw new BadRequestException('Événement introuvable');
    }

    const currentTime = new Date();
    const currentTimeUTC = new Date(currentTime.getTime() - 3 * 60 * 60 * 1000); // Convertir EAT à UTC
    const eventStartTime = new Date(evenement.date_debut);
    console.log(
      `Heure actuelle (UTC): ${currentTimeUTC.toISOString()}, Heure début événement (UTC): ${eventStartTime.toISOString()}`,
    );
    const timeDifference =
      (eventStartTime.getTime() - currentTimeUTC.getTime()) / (1000 * 60);

    if (timeDifference > 121 || timeDifference < 119) {
      throw new BadRequestException(
        'L’événement doit commencer dans exactement 2 heures pour envoyer un rappel',
      );
    }

    if (evenement.inscription.length === 0) {
      throw new BadRequestException(
        'Aucune inscription trouvée pour cet événement',
      );
    }

    for (const inscription of evenement.inscription) {
      if (inscription.statut === 'Valide') {
        console.log(
          `Envoi rappel à utilisateur ${inscription.utilisateurs.nom}`,
        );
        await this.createNotification(
          inscription.utilisateurs,
          evenement,
          `Rappel : l'événement "${evenement.nom}" commence dans exactement 2 heures !`,
          notificationType.APP,
        );
      } else {
        console.log(
          `Inscription non valide pour utilisateur ${inscription.utilisateurs.nom}, statut: ${inscription.statut}, rappel ignoré`,
        );
      }
    }
  }

  async notifyInscriptionApproval(inscription: Inscription): Promise<void> {
    if (inscription.statut !== 'Valide') {
      throw new BadRequestException(
        'L’inscription doit être validée avant d’envoyer une notification',
      );
    }
    await this.createNotification(
      inscription.utilisateurs,
      inscription.evenements,
      `Votre inscription à l'événement "${inscription.evenements.nom}" a été approuvée !`,
      notificationType.APP,
    );
  }

  async notifyManual(
    evenementId: string,
    contenu: string,
    type: notificationType,
  ): Promise<void> {
    const evenement = await this.notificationRepository.manager
      .getRepository(Evenement)
      .findOne({
        where: { id: evenementId },
        relations: ['inscription', 'inscription.utilisateurs'],
      });

    if (!evenement) {
      throw new BadRequestException('Événement introuvable');
    }

    if (evenement.inscription.length === 0) {
      throw new BadRequestException(
        'Aucune inscription trouvée pour cet événement',
      );
    }
    for (const inscription of evenement.inscription) {
      if (inscription.statut === 'Valide') {
        await this.createNotification(
          inscription.utilisateurs,
          evenement,
          contenu,
          type,
        );
      }
    }
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    uuidRegex(userId);

    const notifications = await this.notificationRepository.find({
      where: {
        utilisateurs: { id: userId },
        lu: false,
        etat: notificationEtat.ENVOYE,
      },
      relations: ['utilisateurs', 'evenements'],
    });
    return notifications;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    console.log(`Marquage de la notification comme lue: ${notificationId}`);
    uuidRegex(notificationId);

    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    notification.lu = true;
    await this.notificationRepository.save(notification);
  }
}
