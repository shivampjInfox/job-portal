import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Repository } from 'typeorm';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { generateSlug } from '../common/utils/slug.util';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { toCompanyResponseDto } from './mappers/company.mapper';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  private async findCompanyEntity(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    return company;
  }

  async create(
    dto: CreateCompanyDto,
    ownerId: string,
  ): Promise<CompanyResponseDto> {
    const slug = generateSlug(dto.name, { lower: true, strict: true });

    const company = this.companyRepository.create({
      ...dto,
      slug,
      owner: { id: ownerId },
    });

    const savedCompany = await this.companyRepository.save(company);

    return this.findOne(savedCompany.id);
  }

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<CompanyResponseDto>> {
    const { page, limit } = pagination;

    const [companies, total] = await this.companyRepository.findAndCount({
      relations: ['owner'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: companies.map(toCompanyResponseDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<CompanyResponseDto> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    return toCompanyResponseDto(company);
  }

  async findByOwner(ownerId: string): Promise<CompanyResponseDto[]> {
    const companies = await this.companyRepository.find({
      where: {
        owner: {
          id: ownerId,
        },
      },
      relations: ['owner'],
    });

    return companies.map(toCompanyResponseDto);
  }

  async update(
    id: string,
    dto: UpdateCompanyDto,
    userId: string,
    userRole: UserRole,
  ): Promise<CompanyResponseDto> {
    const company = await this.findCompanyEntity(id);

    const isOwner = company.owner.id === userId;

    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not allowed to update this company',
      );
    }

    Object.assign(company, dto);

    if (dto.name) {
      company.slug = generateSlug(dto.name, {
        lower: true,
        strict: true,
      });
    }

    const updatedCompany = await this.companyRepository.save(company);

    return toCompanyResponseDto(updatedCompany);
  }

  async verify(id: string): Promise<CompanyResponseDto> {
    const company = await this.findCompanyEntity(id);

    company.isVerified = true;

    const updatedCompany = await this.companyRepository.save(company);

    return toCompanyResponseDto(updatedCompany);
  }

  async remove(id: string, userId: string): Promise<void> {
    const company = await this.findCompanyEntity(id);

    if (company.owner.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this company',
      );
    }

    await this.companyRepository.remove(company);
  }
}
