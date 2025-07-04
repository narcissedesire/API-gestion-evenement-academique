import { utilisateurType } from '../model/utilisateur.model';

export class UtilisateurUpdateDto {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  mot_passe?: string;
}
