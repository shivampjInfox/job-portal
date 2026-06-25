import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { Company } from '../../companies/entities/company.entity';
import { JobCategory } from '../../categories/entities/job-category.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { Application } from 'src/applications/entities/application.entity';
import { SavedJob } from 'src/saved-jobs/entities/saved-job.entity';

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
}

export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.FULL_TIME,
  })
  type: JobType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status: JobStatus;

  @Column({ nullable: true })
  location?: string;

  @Column({ default: false })
  isRemote: boolean;

  @Column({ type: 'int', nullable: true })
  salaryMin?: number;

  @Column({ type: 'int', nullable: true })
  salaryMax?: number;

  @Column({ nullable: true })
  expiresAt?: Date;

  @ManyToOne(() => Company, (company) => company.jobs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  company: Company;

  @ManyToOne(() => JobCategory, (category) => category.jobs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: JobCategory;

  @ManyToMany(() => Skill, (skill) => skill.jobs)
  @JoinTable({
    name: 'job_skills',
    joinColumn: {
      name: 'job_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'skill_id',
      referencedColumnName: 'id',
    },
  })
  skills: Skill[];

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.job)
  savedJobs: SavedJob[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
