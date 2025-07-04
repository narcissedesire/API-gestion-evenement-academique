import { Inscription } from 'src/inscription/model/inscription.model';
import { Notification } from 'src/notification/model/notification.model';
import { Utilisateur } from 'src/utilisateur/model/utilisateur.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';

export enum evenementType {
  CONFERENCE = 'Conference',
  HACKATHON = 'Hackathon',
  SEMINAIRE = 'Seminaire',
}

@Entity()
export class Evenement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  nom: string;

  @Column({ type: 'enum', enum: evenementType })
  type: evenementType;

  @Column({ type: 'timestamp' })
  date_debut: Date;

  @Column({ type: 'int' })
  duree: number;

  @Column({ type: 'int' })
  nombre_place: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  sponsor?: string;

  @Column({ type: 'varchar', nullable: true })
  theme?: string;

  @Column({ type: 'varchar', nullable: true })
  formateur?: string;

  @Column({ type: 'boolean', default: false })
  acces_restreint: boolean;

  @CreateDateColumn()
  created_at: Timestamp;

  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.evenements)
  utilisateurs: Utilisateur;

  @OneToMany(() => Notification, (notification) => notification.evenements)
  notifications: Notification[];

  @OneToMany(() => Inscription, (inscription) => inscription.evenements)
  inscription: Inscription[];
}
