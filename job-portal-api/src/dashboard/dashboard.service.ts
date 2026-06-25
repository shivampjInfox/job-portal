import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { Job } from '../jobs/entities/job.entity';
import { Application } from '../applications/entities/application.entity';
import { SavedJob } from '../saved-jobs/entities/saved-job.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,

    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,

    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,

    @InjectRepository(SavedJob)
    private readonly savedJobsRepository: Repository<SavedJob>,
  ) {}

  async getCandidateDashboard(userId: string) {
    const totalApplications = await this.applicationsRepository.count({
      where: {
        applicant: {
          id: userId,
        },
      },
    });

    const savedJobsCount = await this.savedJobsRepository.count({
      where: {
        user: {
          id: userId,
        },
      },
    });

    const rawStatusCounts = await this.applicationsRepository
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('application.applicantId = :userId', { userId })
      .groupBy('application.status')
      .getRawMany();

    const applicationsByStatus = {
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    };

    rawStatusCounts.forEach((item) => {
      applicationsByStatus[item.status] = Number(item.count);
    });

    const recentApplications = await this.applicationsRepository.find({
      where: {
        applicant: {
          id: userId,
        },
      },
      relations: ['job', 'job.company'],
      order: {
        appliedAt: 'DESC',
      },
      take: 5,
    });

    return {
      totalApplications,
      savedJobsCount,
      applicationsByStatus,
      recentApplications,
    };
  }

  async getRecruiterDashboard(userId: string) {
    const totalCompanies = await this.companiesRepository.count({
      where: {
        owner: {
          id: userId,
        },
      },
    });

    const totalJobs = await this.jobsRepository.count({
      where: {
        company: {
          owner: {
            id: userId,
          },
        },
      },
    });

    const totalApplications = await this.applicationsRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .leftJoin('job.company', 'company')
      .where('company.ownerId = :userId', { userId })
      .getCount();

    const rawStatusCounts = await this.applicationsRepository
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('application.job', 'job')
      .leftJoin('job.company', 'company')
      .where('company.ownerId = :userId', { userId })
      .groupBy('application.status')
      .getRawMany();

    const applicationsByStatus = {
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    };

    rawStatusCounts.forEach((item) => {
      applicationsByStatus[item.status] = Number(item.count);
    });

    const recentApplications = await this.applicationsRepository.find({
      where: {
        job: {
          company: {
            owner: {
              id: userId,
            },
          },
        },
      },
      relations: ['applicant', 'job', 'job.company'],
      order: {
        appliedAt: 'DESC',
      },
      take: 5,
    });

    return {
      totalCompanies,
      totalJobs,
      totalApplications,
      applicationsByStatus,
      recentApplications,
    };
  }

  async getAdminDashboard() {
    const [totalUsers, totalCompanies, totalJobs, totalApplications] =
      await Promise.all([
        this.usersRepository.count(),
        this.companiesRepository.count(),
        this.jobsRepository.count(),
        this.applicationsRepository.count(),
      ]);

    const usersByRole = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const companiesByVerification = await this.companiesRepository
      .createQueryBuilder('company')
      .select('company.isVerified', 'isVerified')
      .addSelect('COUNT(*)', 'count')
      .groupBy('company.isVerified')
      .getRawMany();

    const jobsByStatus = await this.jobsRepository
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.status')
      .getRawMany();

    return {
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      usersByRole,
      companiesByVerification,
      jobsByStatus,
    };
  }
}
