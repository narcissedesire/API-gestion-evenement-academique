import { utilisateurType } from '../model/utilisateur.model';

export class UtilisateurCreateDto {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  type_utilisateur?: utilisateurType;
  mot_passe: string;
}
