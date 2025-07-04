import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Utilisateur, utilisateurType } from './model/utilisateur.model';
import { Repository } from 'typeorm';
import { UtilisateurCreateDto } from './dto/utilisateurCreate.tdo';
import * as bcrypt from 'bcrypt';
import { UtilisateurLoginDto } from './dto/utilisateurLogin.tdo';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { UtilisateurUpdateDto } from './dto/utilisateurUpdate.tdo';
import {
  paginate,
  PaginatedResult,
  PaginationParams,
  SearchField,
} from 'src/utils/pagination';
import { uuidRegex } from 'src/utils/uuidRegex';

@Injectable()
export class UtilisateurService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async findAll(
    params: PaginationParams,
    type: utilisateurType,
  ): Promise<PaginatedResult<Utilisateur>> {
    const searchFields: SearchField[] = [
      { field: 'nom' },
      { field: 'prenom' },
      { field: 'type_utilisateur', isEnum: true },
    ];

    const where = type ? { type_utilisateur: type } : undefined;

    return paginate<Utilisateur>(
      this.utilisateurRepository,
      params,
      searchFields,
      where,
    );
  }

  async inscription(utilisateur: UtilisateurCreateDto): Promise<Utilisateur> {
    const isEmailExist = await this.utilisateurRepository.findOne({
      where: { email: utilisateur.email },
    });
    // console.log('Email : ' + isEmailExist?.email);
    if (isEmailExist) {
      throw new ConflictException(
        'Cet utilisateur est déjà inscrit à la base de donnee',
      );
    }
    const hashPassword = await bcrypt.hash(utilisateur.mot_passe, 10);
    const createUtilisateur = this.utilisateurRepository.create({
      ...utilisateur,
      mot_passe: hashPassword,
    });
    await this.utilisateurRepository.save(createUtilisateur);
    return createUtilisateur;
  }

  async login(utilisateur: UtilisateurLoginDto): Promise<{ token: string }> {
    const veryfyEmail = await this.utilisateurRepository.findOne({
      where: { email: utilisateur.email },
    });
    if (
      !veryfyEmail ||
      !(await bcrypt.compare(utilisateur.mot_passe, veryfyEmail.mot_passe))
    ) {
      throw new UnauthorizedException(
        'Votre email ou mot de passe sont incorrect',
      );
    }
    const payload = {
      email: utilisateur.email,
      id: veryfyEmail.id,
      type: veryfyEmail.type_utilisateur,
    };
    return {
      token: await this.jwtService.signAsync(payload, this.jwtConfiguration),
    };
  }

  async updateUtilisateur(id: string, utilisateur: UtilisateurUpdateDto) {
    uuidRegex(id);
    const existingUtilisateur = await this.utilisateurRepository.findOne({
      where: { id },
    });
    if (!existingUtilisateur) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Mettre à jour les champs autorisés
    existingUtilisateur.nom = utilisateur.nom
      ? utilisateur.nom
      : existingUtilisateur.nom;
    existingUtilisateur.prenom = utilisateur.prenom
      ? utilisateur.prenom
      : existingUtilisateur.prenom;
    existingUtilisateur.email = utilisateur.email
      ? utilisateur.email
      : existingUtilisateur.email;
    existingUtilisateur.telephone = utilisateur.telephone
      ? utilisateur.telephone
      : existingUtilisateur.telephone;

    // Si le mot de passe est fourni, le hacher et le mettre à jour
    if (utilisateur.mot_passe) {
      existingUtilisateur.mot_passe = await bcrypt.hash(
        utilisateur.mot_passe,
        10,
      );
    }

    return this.utilisateurRepository.save(existingUtilisateur);
  }
}
