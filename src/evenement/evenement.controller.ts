import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { EvenementService } from './evenement.service';
import { EvenementCreateDto } from './dto/evenementCreate.dto';
import { ActiveUser, Public } from 'src/decorators/active-user.decorator';
import { utilisateurType } from 'src/utilisateur/model/utilisateur.model';
import { DecorRole } from 'src/decorators/role.decorator';
import { Evenement, evenementType } from './model/evenement.model';
import { PaginatedResult, PaginationParams } from 'src/utils/pagination';

@Controller('evenement')
export class EvenementController {
  constructor(private readonly evenementService: EvenementService) {}

  @Public()
  @Get()
  async allEvenement(
    @Query() query: PaginationParams & { type?: evenementType }, // Utilisation de evenementType
  ): Promise<PaginatedResult<Evenement>> {
    // Valider les paramètres de pagination
    if (query.page && isNaN(Number(query.page))) {
      throw new BadRequestException('La page doit être un nombre');
    }
    if (query.limit && isNaN(Number(query.limit))) {
      throw new BadRequestException('La limite doit être un nombre');
    }

    // Valider le paramètre type (optionnel, utilisé comme catégorie)
    if (query.type && !Object.values(evenementType).includes(query.type)) {
      throw new BadRequestException("Type d'événement invalide");
    }

    return this.evenementService.allEvenement(
      {
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
        search: query.search, // Recherche unifiée dans nom et description
        type: query.type, // Recherche ou filtre par type
      },
      query.type, // Filtre strict par type
    );
  }

  @Get('findEvenementById')
  findEvenementById(@Param() idEvenement: string) {
    return this.evenementService.findEvenementById(idEvenement);
  }

  @Put('/update-evenement')
  updateEvenement(
    @Param() idEvenement: string,
    @Body() evenement: EvenementCreateDto,
  ) {
    return this.evenementService.updateEvenement(idEvenement, evenement);
  }

  @Put('/valide-evenement')
  valideEvenement(@Param() idEvenement: string) {
    return this.evenementService.valideEvenement(idEvenement);
  }

  @DecorRole(
    utilisateurType.ETUDIANT ||
      utilisateurType.PROFESSEUR ||
      utilisateurType.ADMIN,
  )
  @Post('/create-evenement')
  createEvenement(
    @ActiveUser() user: any,
    @Body() evenement: EvenementCreateDto,
  ) {
    console.log('Evenement : ' + evenement);
    return this.evenementService.createEvenement(evenement, user.id);
  }

  @Delete()
  deleteEvenement(@Param() id: string) {
    return this.evenementService.deleteEvenement(id);
  }
}
