import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Company } from 'src/companies/entities/company.entity';
import { JobCategory } from 'src/categories/entities/job-category.entity';
import { Skill } from 'src/skills/entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Company, JobCategory, Skill])],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
