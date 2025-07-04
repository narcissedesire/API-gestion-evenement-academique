import { SetMetadata } from '@nestjs/common';
import { utilisateurType } from 'src/utilisateur/model/utilisateur.model';

export const role = 'role';

export const DecorRole = (...roles: utilisateurType[]) =>
  SetMetadata(role, roles);
