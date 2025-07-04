import { Evenement } from 'src/evenement/model/evenement.model';
import { Inscription } from 'src/inscription/model/inscription.model';
import { Notification } from 'src/notification/model/notification.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum utilisateurType {
  ETUDIANT = 'Etudiant',
  PROFESSEUR = 'Professeur',
  ADMIN = 'Admin',
}

@Entity()
export class Utilisateur {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  nom: string;

  @Column({ type: 'varchar', length: 150 })
  prenom: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 12, nullable: true })
  telephone: string;

  @Column({
    type: 'enum',
    enum: utilisateurType,
    default: utilisateurType.ETUDIANT,
  })
  type_utilisateur: utilisateurType;

  @Column({ type: 'varchar', length: 200 })
  mot_passe: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Inscription, (inscription) => inscription.utilisateurs)
  inscription: Inscription[];

  @OneToMany(() => Notification, (notification) => notification.utilisateurs)
  notification: Notification[];

  @OneToMany(() => Evenement, (event) => event.utilisateurs)
  evenements: Evenement[];
}
