import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { notificationType } from './model/notification.model';
import { uuidRegex } from 'src/utils/uuidRegex';
import { ActiveUser } from 'src/decorators/active-user.decorator';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotificationsByUser(@ActiveUser() userId: { id: string }) {
    // Validation de l'UUID
    console.log(
      `Récupération des notifications pour l'utilisateur: ${userId.id}`,
    );
    uuidRegex(userId.id);

    return this.notificationService.getNotificationsByUser(userId.id);
  }

  @Post('manual')
  async sendManualNotification(
    @Body()
    body: {
      evenementId: string;
      contenu: string;
      type: notificationType;
    },
  ) {
    const { evenementId, contenu, type } = body;

    if (
      !evenementId ||
      !contenu ||
      !Object.values(notificationType).includes(type)
    ) {
      throw new BadRequestException('Paramètres invalides');
    }
    if (contenu.length > 500) {
      throw new BadRequestException(
        'Le contenu de la notification ne doit pas dépasser 500 caractères',
      );
    }
    // Validation de l'UUID
    uuidRegex(evenementId);

    await this.notificationService.notifyManual(evenementId, contenu, type);
    return { message: 'Notifications envoyées avec succès' };
  }

  @Post('mark-read')
  async markNotificationAsRead(@Body('notificationId') notificationId: string) {
    if (!notificationId) {
      throw new BadRequestException('ID de notification requis');
    }

    await this.notificationService.markNotificationAsRead(notificationId);
    return { message: 'Notification marquée comme lue' };
  }
}
