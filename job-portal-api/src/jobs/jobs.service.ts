import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Job, JobStatus } from './entities/job.entity';
import { Company } from '../companies/entities/company.entity';
import { JobCategory } from '../categories/entities/job-category.entity';
import { Skill } from '../skills/entities/skill.entity';

import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobFilterDto } from './dto/job-filter.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,

    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,

    @InjectRepository(JobCategory)
    private readonly categoriesRepository: Repository<JobCategory>,

    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  private async verifyCompanyOwnership(
    companyId: string,
    userId: string,
  ): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['owner'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.owner.id !== userId) {
      throw new ForbiddenException('You do not own this company');
    }

    return company;
  }

  async create(dto: CreateJobDto, userId: string): Promise<Job> {
    if (dto.salaryMin && dto.salaryMax && dto.salaryMin > dto.salaryMax) {
      throw new BadRequestException('salaryMin cannot exceed salaryMax');
    }

    const company = await this.verifyCompanyOwnership(dto.companyId, userId);

    let category: JobCategory | undefined;

    if (dto.categoryId) {
      const foundCategory = await this.categoriesRepository.findOne({
        where: { id: dto.categoryId },
      });

      if (!foundCategory) {
        throw new NotFoundException('Category not found');
      }

      category = foundCategory;
    }

    let skills: Skill[] = [];

    if (dto.skillIds?.length) {
      skills = await this.skillsRepository.find({
        where: {
          id: In(dto.skillIds),
        },
      });

      if (skills.length !== dto.skillIds.length) {
        throw new BadRequestException('One or more skills not found');
      }
    }

    const job = this.jobsRepository.create({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      location: dto.location,
      isRemote: dto.isRemote,
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax,
      expiresAt: dto.expiresAt,
      company,
      category,
      skills,
    });

    return this.jobsRepository.save(job);
  }

  async findAll(
    paginationDto: PaginationQueryDto,
    filters: JobFilterDto,
    userId?: string,
    userRole?: string,
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    const qb = this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoin('company.owner', 'owner')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.skills', 'skills');
    if (userRole === UserRole.RECRUITER && userId) {
      qb.andWhere(
        `(
        job.status = :published
        OR (
          job.status = :draft
         AND owner.id = :userId
        )
      )`,
        {
          published: JobStatus.PUBLISHED,
          draft: JobStatus.DRAFT,
          userId,
        },
      );
    } else {
      qb.andWhere('job.status = :published', {
        published: JobStatus.PUBLISHED,
      });
    }

    if (filters.status) {
      qb.andWhere('job.status = :status', { status: filters.status });
    }

    if (filters.type) {
      qb.andWhere('job.type = :type', { type: filters.type });
    }

    if (filters.categoryId) {
      qb.andWhere('category.id = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.isRemote !== undefined) {
      qb.andWhere('job.isRemote = :isRemote', { isRemote: filters.isRemote });
    }

    if (filters.search) {
      qb.andWhere(
        '(job.title ILIKE :search OR job.description ILIKE :search)',
        {
          search: `%${filters.search}%`,
        },
      );
    }

    qb.orderBy('job.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id },
      relations: ['company', 'category', 'skills'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(id: string, dto: UpdateJobDto, userId: string): Promise<Job> {
    const job = await this.findOne(id);

    await this.verifyCompanyOwnership(job.company.id, userId);

    if (dto.salaryMin && dto.salaryMax && dto.salaryMin > dto.salaryMax) {
      throw new BadRequestException('salaryMin cannot exceed salaryMax');
    }

    if (dto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: {
          id: dto.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      job.category = category;
    }

    if (dto.skillIds) {
      const skills = await this.skillsRepository.find({
        where: {
          id: In(dto.skillIds),
        },
      });

      if (skills.length !== dto.skillIds.length) {
        throw new BadRequestException('One or more skills not found');
      }

      job.skills = skills;
    }

    Object.assign(job, {
      title: dto.title ?? job.title,
      description: dto.description ?? job.description,
      type: dto.type ?? job.type,
      location: dto.location ?? job.location,
      isRemote: dto.isRemote ?? job.isRemote,
      salaryMin: dto.salaryMin ?? job.salaryMin,
      salaryMax: dto.salaryMax ?? job.salaryMax,
      expiresAt: dto.expiresAt ?? job.expiresAt,
    });

    return this.jobsRepository.save(job);
  }

  async publish(id: string, userId: string): Promise<Job> {
    const job = await this.findOne(id);

    await this.verifyCompanyOwnership(job.company.id, userId);

    job.status = JobStatus.PUBLISHED;

    return this.jobsRepository.save(job);
  }

  async close(id: string, userId: string): Promise<Job> {
    const job = await this.findOne(id);

    await this.verifyCompanyOwnership(job.company.id, userId);

    job.status = JobStatus.CLOSED;

    return this.jobsRepository.save(job);
  }

  async remove(id: string, userId: string): Promise<void> {
    const job = await this.findOne(id);

    await this.verifyCompanyOwnership(job.company.id, userId);

    await this.jobsRepository.remove(job);
  }
}
