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
import { InscriptionService } from './inscription.service';
import { ActiveUser, Public } from 'src/decorators/active-user.decorator';
import { Inscription, statusInscriptions } from './model/inscription.model';
import { DecorRole } from 'src/decorators/role.decorator';
import { utilisateurType } from 'src/utilisateur/model/utilisateur.model';
import { PaginationParams, PaginatedResult } from 'src/utils/pagination';

@Controller('inscription')
export class InscriptionController {
  constructor(private readonly inscriptionService: InscriptionService) {}

  @Public()
  @Get('/all-inscription')
  async getAllInscriptions(
    @Query() query: PaginationParams & { type?: statusInscriptions },
  ): Promise<PaginatedResult<Inscription>> {
    if (query.page && isNaN(Number(query.page))) {
      throw new BadRequestException('La page doit etre en nombre');
    }

    if (query.limit && isNaN(Number(query.limit))) {
      throw new BadRequestException('La limit doit etre en nombre');
    }

    if (query.type && !Object.values(statusInscriptions).includes(query.type)) {
      throw new BadRequestException('Le status est invalide');
    }

    return this.inscriptionService.allInscription(
      {
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
        search: query.search,
        type: query.type,
      },
      query.type,
    );
  }

  @DecorRole(utilisateurType.ETUDIANT, utilisateurType.PROFESSEUR)
  @Get('/inscription-user')
  getInscriptionUser(@ActiveUser() user: any) {
    return this.inscriptionService.inscriptionUser(user.id);
  }

  @DecorRole(utilisateurType.ETUDIANT, utilisateurType.PROFESSEUR)
  @Post('create')
  async createInscription(
    @Body() body: { evenementId: string },
    @ActiveUser() user: any,
  ): Promise<Inscription> {
    const utilisateurId = user.id;
    const { evenementId } = body;

    if (!utilisateurId || !evenementId) {
      throw new BadRequestException('Paramètres invalides');
    }

    return this.inscriptionService.createInscription(
      utilisateurId,
      evenementId,
    );
  }

  @DecorRole(utilisateurType.ETUDIANT, utilisateurType.PROFESSEUR)
  @Put(':id')
  valideInscription(@Param() param: { id: string }, @ActiveUser() user: any) {
    const { id } = param;
    return this.inscriptionService.approveInscription(id, user.id);
  }

  @Delete()
  deleteInscription(@Param() idInscription: string) {
    return this.inscriptionService.deleteInscription(idInscription);
  }
}
