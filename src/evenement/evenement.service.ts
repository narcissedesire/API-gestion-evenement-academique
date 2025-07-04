import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Evenement, evenementType } from './model/evenement.model';
import { Repository } from 'typeorm';
import { EvenementCreateDto } from './dto/evenementCreate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Utilisateur } from 'src/utilisateur/model/utilisateur.model';
import {
  paginate,
  PaginatedResult,
  PaginationParams,
  SearchField,
} from 'src/utils/pagination';

@Injectable()
export class EvenementService {
  constructor(
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
  ) {}

  async allEvenement(
    params: PaginationParams,
    type?: evenementType,
  ): Promise<PaginatedResult<Evenement>> {
    // Définir les champs de recherche pour l'entité Evenement
    const searchFields: SearchField[] = [
      { field: 'nom' },
      { field: 'description' },
      { field: 'type', isEnum: true },
    ];

    // Conditions de filtrage supplémentaires (type comme catégorie)
    const where = type ? { type } : undefined;

    return paginate<Evenement>(
      this.evenementRepository,
      params,
      searchFields,
      where,
    );
  }

  findEvenementById(id: string) {
    const oneEvenement = this.evenementRepository.findOne({
      where: { id: id },
    });
    if (!oneEvenement) {
      throw new NotFoundException();
    }
    return oneEvenement;
  }

  async createEvenement(evenement: EvenementCreateDto, utilisateurId: any) {
    const user = await this.utilisateurRepository.findOne({
      where: { id: utilisateurId },
    });
    console.log('Utilisateur trouvé:', user);
    if (!user) {
      throw new NotFoundException();
    }

    const date_debut = evenement.date + ' ' + evenement.time;
    const nowDate = new Date();
    const dateEvent = new Date(date_debut);
    if (dateEvent <= nowDate) {
      throw new BadRequestException('La date doit etre au plutard');
    }

    const create = this.evenementRepository.create({
      ...evenement,
      date_debut: date_debut,
      utilisateurs: user,
    });
    return this.evenementRepository.save(create);
  }

  async updateEvenement(id: string, evenement: EvenementCreateDto) {
    const newEvenement = await this.evenementRepository.preload({
      id: id,
      ...evenement,
    });
    if (!newEvenement) {
      throw new NotFoundException();
    }
    return this.evenementRepository.save(newEvenement);
  }

  async valideEvenement(id: string) {
    const valideEvenement = await this.evenementRepository.preload({
      id: id,
      acces_restreint: true,
    });
    if (!valideEvenement) {
      throw new NotFoundException();
    }
    return this.evenementRepository.save(valideEvenement);
  }

  async deleteEvenement(id: string) {
    const existing = await this.evenementRepository.findOne({
      where: { id: id },
    });
    if (!existing) {
      throw new NotFoundException();
    }
    return this.evenementRepository.delete(existing);
  }
}
