import { Evenement } from 'src/evenement/model/evenement.model';
import { Utilisateur } from 'src/utilisateur/model/utilisateur.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum statusInscriptions {
  EN_ATTENTE = 'En attente',
  VALIDE = 'Valide',
  REFUSE = 'Refuse',
}
@Entity()
export class Inscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.inscription)
  utilisateurs: Utilisateur;

  @ManyToOne(() => Evenement, (evenement) => evenement.inscription)
  evenements: Evenement;

  @CreateDateColumn()
  date_inscription: Date;

  @Column({
    type: 'enum',
    enum: statusInscriptions,
    default: statusInscriptions.EN_ATTENTE,
  })
  statut?: statusInscriptions;
}
