import { Module } from '@nestjs/common';
import { UtilisateurController } from './utilisateur.controller';
import { UtilisateurService } from './utilisateur.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from './model/utilisateur.model';
import { Inscription } from 'src/inscription/model/inscription.model';
import { Notification } from 'src/notification/model/notification.model';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [UtilisateurController],
  providers: [UtilisateurService],
  imports: [
    TypeOrmModule.forFeature([Utilisateur, Inscription, Notification]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
})
export class UtilisateurModule {}
