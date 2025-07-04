import { Evenement } from 'src/evenement/model/evenement.model';
import { Utilisateur } from 'src/utilisateur/model/utilisateur.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum notificationType {
  EMAIL = 'Email',
  SMS = 'SMS',
  APP = 'App',
}

export enum notificationEtat {
  ENVOYE = 'Envoye',
  EN_ATTENTE = 'En Attente',
  ECHOUE = 'Echoue',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: notificationType,
    default: notificationType.APP,
  })
  type_notification: notificationType;

  @Column({ type: 'text' })
  contenu: string;

  @Column({ type: 'boolean', default: false })
  lu: boolean;

  @Column({
    type: 'enum',
    enum: notificationEtat,
    default: notificationEtat.EN_ATTENTE,
  })
  etat: notificationEtat;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.notification)
  @JoinColumn()
  utilisateurs: Utilisateur;

  @ManyToOne(() => Evenement, (evenement) => evenement.notifications)
  @JoinColumn()
  evenements: Evenement;
}
