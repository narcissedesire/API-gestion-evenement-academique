import { evenementType } from '../model/evenement.model';

export class EvenementCreateDto {
  nom: string;
  type: evenementType;
  date: string;
  time: string;
  duree: number;
  nombre_place: number;
  description: string;
  sponsor?: string;
  theme?: string;
  formateur?: string;
}
