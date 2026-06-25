import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

@Entity('saved_jobs')
@Unique(['user', 'job'])
export class SavedJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Job, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  job: Job;

  @CreateDateColumn()
  savedAt: Date;
}
