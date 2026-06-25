import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToMany(() => Job, (job) => job.skills)
  jobs: Job[];
}
