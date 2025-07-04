import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { UtilisateurService } from './utilisateur.service';
import { UtilisateurCreateDto } from './dto/utilisateurCreate.tdo';
import { UtilisateurLoginDto } from './dto/utilisateurLogin.tdo';
import { ActiveUser, Public } from 'src/decorators/active-user.decorator';
import { DecorRole } from 'src/decorators/role.decorator';
import { utilisateurType } from './model/utilisateur.model';
import { PaginationParams } from 'src/utils/pagination';
import { UtilisateurUpdateDto } from './dto/utilisateurUpdate.tdo';

@Controller('utilisateur')
export class UtilisateurController {
  constructor(private readonly utilisateurService: UtilisateurService) {}

  @Public()
  @Post('/inscription')
  inscription(@Body() utilisateur: UtilisateurCreateDto) {
    // console.log('Controlleur : ' + utilisateur.type_utilisateur);
    return this.utilisateurService.inscription(utilisateur);
  }

  @Public()
  @Post('/login')
  login(@Body() utilisateur: UtilisateurLoginDto) {
    return this.utilisateurService.login(utilisateur);
  }

  @DecorRole(utilisateurType.PROFESSEUR)
  @Get('/profile')
  getProfile(@ActiveUser() user) {
    console.log(user);
    return {
      message: 'Les donner dans le token',
      user: user,
    };
  }

  @DecorRole(utilisateurType.ADMIN)
  // @Public()
  @Get('/all')
  findAll(@Query() query: PaginationParams & { type: utilisateurType }) {
    if (query.page && isNaN(Number(query.page))) {
      throw new BadRequestException('La page doit être un nombre');
    }
    if (query.limit && isNaN(Number(query.limit))) {
      throw new BadRequestException('La limite doit être un nombre');
    }
    if (query.type && !Object.values(utilisateurType).includes(query.type)) {
      throw new BadRequestException("Type d'utilisateur invalide");
    }
    return this.utilisateurService.findAll(
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
  @Put('/update')
  update(@ActiveUser() user, @Body() utilisateur: UtilisateurUpdateDto) {
    return this.utilisateurService.updateUtilisateur(user.id, utilisateur);
  }
}
