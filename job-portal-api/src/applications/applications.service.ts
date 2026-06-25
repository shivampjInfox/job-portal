import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Repository } from 'typeorm';
import { Job } from 'src/jobs/entities/job.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JobStatus } from 'src/jobs/enums/job-status.enum';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,

    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,

    private readonly notificationsService: NotificationsService,
  ) {}

  async apply(
    dto: CreateApplicationDto,
    applicantId: string,
  ): Promise<Application> {
    const existing = await this.applicationsRepository.findOne({
      where: {
        job: { id: dto.jobId },
        applicant: { id: applicantId },
      },
    });

    if (existing) {
      throw new ConflictException('Already applied to this job');
    }

    const job = await this.jobsRepository.findOne({
      where: { id: dto.jobId },
      relations: ['company', 'company.owner'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException('Job is not accepting applications');
    }

    const application = this.applicationsRepository.create({
      job,
      applicant: { id: applicantId } as User,
      coverLetter: dto.coverLetter,
      resumeUrl: dto.resumeUrl,
    });

    const savedApplication =
      await this.applicationsRepository.save(application);

    await this.notificationsService.create(
      job.company.owner.id,
      'New Application Received',
      `Someone applied for ${job.title}`,
      NotificationType.APPLICATION_RECEIVED,
    );

    return savedApplication;
  }
  async findMyApplications(applicantId: string): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: {
        applicant: {
          id: applicantId,
        },
      },
      relations: ['job', 'job.company'],
      order: {
        appliedAt: 'DESC',
      },
    });
  }
  async findJobApplications(
    jobId: string,
    userId: string,
  ): Promise<Application[]> {
    const job = await this.jobsRepository.findOne({
      where: {
        id: jobId,
      },
      relations: ['company', 'company.owner'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.company.owner.id !== userId) {
      throw new ForbiddenException('You do not own this job');
    }

    return this.applicationsRepository.find({
      where: {
        job: {
          id: jobId,
        },
      },
      relations: ['applicant', 'job'],
      order: {
        appliedAt: 'DESC',
      },
    });
  }

  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    userId: string,
  ): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: {
        id: applicationId,
      },
      relations: ['applicant', 'job', 'job.company', 'job.company.owner'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.company.owner.id !== userId) {
      throw new ForbiddenException('You do not own this job');
    }

    application.status = status;

    const updated = await this.applicationsRepository.save(application);

    await this.notificationsService.create(
      application.applicant.id,
      'Application Status Updated',
      `Your application for ${application.job.title} is now ${status}`,
      NotificationType.APPLICATION_STATUS_CHANGED,
    );

    return updated;
  }

  async withdraw(applicationId: string, applicantId: string): Promise<void> {
    const application = await this.applicationsRepository.findOne({
      where: {
        id: applicationId,
      },
      relations: ['applicant'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.applicant.id !== applicantId) {
      throw new ForbiddenException();
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending applications can be withdrawn',
      );
    }

    await this.applicationsRepository.remove(application);
  }
}
