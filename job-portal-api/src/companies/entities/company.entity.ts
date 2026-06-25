import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { CompanySize } from '../enums/company-size.enum';
import { Job } from 'src/jobs/entities/job.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    nullable: true,
  })
  website?: string;

  @Column({
    nullable: true,
  })
  logoUrl?: string;

  @Column({
    nullable: true,
  })
  location?: string;

  @Column({
    type: 'enum',
    enum: CompanySize,
  })
  size?: CompanySize;

  @Column({
    default: false,
  })
  isVerified!: boolean;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'owner_id',
  })
  owner!: User;

  @OneToMany(() => Job, (job) => job.company)
  jobs: Job[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
