import { InjectRepository } from '@nestjs/typeorm';
import { Inscription, statusInscriptions } from './model/inscription.model';
import { Repository } from 'typeorm';
import { Utilisateur } from 'src/utilisateur/model/utilisateur.model';
import { Evenement } from 'src/evenement/model/evenement.model';
import {
  paginate,
  PaginatedResult,
  PaginationParams,
  SearchField,
} from './../utils/pagination';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { uuidRegex } from 'src/utils/uuidRegex';

@Injectable()
export class InscriptionService {
  constructor(
    @InjectRepository(Inscription)
    private readonly inscriptionRepository: Repository<Inscription>,
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
    private readonly notificationService: NotificationService,
  ) {}

  async allInscription(
    params: PaginationParams,
    type?: statusInscriptions,
  ): Promise<PaginatedResult<Inscription>> {
    const searchFields: SearchField[] = [{ field: 'statut', isEnum: true }];

    const where = type ? { statut: type } : undefined;

    return paginate<Inscription>(
      this.inscriptionRepository,
      params,
      searchFields,
      where,
    );
  }

  inscriptionId(id: string) {
    const inscription = this.inscriptionRepository.findOne({
      where: { id: id },
    });
    return inscription;
  }

  async inscriptionUser(idUser: string) {
    const inscriptionUser = await this.inscriptionRepository.findOne({
      where: { utilisateurs: { id: idUser } },
    });
    if (!inscriptionUser) {
      return "Vous n'as pas encore inscrit a une seule cours";
    }
    return inscriptionUser;
  }

  async createInscription(utilisateurId: string, evenementId: string) {
    uuidRegex(utilisateurId);
    uuidRegex(evenementId);

    const userAuteur = await this.evenementRepository.findOne({
      where: { utilisateurs: { id: utilisateurId }, id: evenementId },
    });

    if (userAuteur) {
      throw new ConflictException(
        "L'auteur de l'événement ne peut pas s'inscrire à l'événement",
      );
    }

    const userExiste = await this.inscriptionRepository.findOne({
      where: {
        utilisateurs: { id: utilisateurId },
        evenements: { id: evenementId },
      },
    });

    if (userExiste) {
      throw new ConflictException(
        'Cet utilisateur est déjà inscrit à cet événement',
      );
    }

    const utilisateur = await this.utilisateurRepository.findOne({
      where: { id: utilisateurId },
    });

    const evenement = await this.evenementRepository.findOne({
      where: { id: evenementId },
    });

    if (!utilisateur || !evenement) {
      throw new NotFoundException('Utilisateur ou événement introuvable');
    }

    const currentTime = new Date();
    const eventStartTime = new Date(evenement.date_debut);
    const timeDifference =
      (eventStartTime.getTime() - currentTime.getTime()) / (1000 * 60);

    if (eventStartTime < currentTime) {
      throw new BadRequestException(
        "Impossible de s'inscrire : l'événement est déjà terminé ou a commencé",
      );
    }

    if (timeDifference < 120) {
      throw new BadRequestException(
        "Impossible de s'inscrire : l'événement commence dans moins de 2 heures",
      );
    }

    const createInscription = this.inscriptionRepository.create({
      utilisateurs: utilisateur,
      evenements: evenement,
    });
    return this.inscriptionRepository.save(createInscription);
  }

  async approveInscription(
    inscriptionId: string,
    utilisateurId: string,
  ): Promise<Inscription> {
    const inscription = await this.inscriptionRepository.findOne({
      where: { id: inscriptionId },
      relations: ['utilisateurs', 'evenements', 'evenements.utilisateurs'],
    });

    if (!inscription) {
      throw new NotFoundException('Inscription introuvable');
    }
    if (inscription.evenements.utilisateurs.id !== utilisateurId) {
      throw new BadRequestException(
        "Vous n'êtes pas autorisé à approuver cette inscription",
      );
    }

    if (inscription.statut === statusInscriptions.VALIDE) {
      throw new BadRequestException("L'inscription est déjà approuvée");
    }

    inscription.statut = statusInscriptions.VALIDE;
    const updatedInscription =
      await this.inscriptionRepository.save(inscription);

    await this.notificationService.notifyInscriptionApproval(
      updatedInscription,
    );
    return updatedInscription;
  }

  async deleteInscription(id: string) {
    const inscription = await this.inscriptionRepository.findOne({
      where: { id: id },
    });
    if (!inscription) {
      throw new NotFoundException();
    }
    return this.inscriptionRepository.delete(inscription);
  }
}
