import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SavedJob } from './entities/saved-job.entity';
import { Job } from '../jobs/entities/job.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SavedJobsService {
  constructor(
    @InjectRepository(SavedJob)
    private readonly savedJobsRepository: Repository<SavedJob>,

    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async save(userId: string, jobId: string): Promise<SavedJob> {
    const existing = await this.savedJobsRepository.findOne({
      where: {
        user: { id: userId },
        job: { id: jobId },
      },
    });

    if (existing) {
      throw new ConflictException('Job already saved');
    }

    const job = await this.jobsRepository.findOne({
      where: { id: jobId },
      relations: ['company'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const savedJob = this.savedJobsRepository.create({
      user: { id: userId },
      job,
    });

    return this.savedJobsRepository.save(savedJob);
  }

  async findMySavedJobs(userId: string): Promise<SavedJob[]> {
    return this.savedJobsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['job', 'job.company', 'job.category', 'job.skills'],
      order: {
        savedAt: 'DESC',
      },
    });
  }

  async remove(userId: string, savedJobId: string): Promise<void> {
    const savedJob = await this.savedJobsRepository.findOne({
      where: {
        id: savedJobId,
      },
      relations: ['user'],
    });

    if (!savedJob) {
      throw new NotFoundException('Saved job not found');
    }

    if (savedJob.user.id !== userId) {
      throw new ForbiddenException('You cannot remove this saved job');
    }

    await this.savedJobsRepository.remove(savedJob);
  }
}
