import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JobCategory } from './entities/job-category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateSlug } from '../common/utils/slug.util';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(JobCategory)
    private readonly categoriesRepository: Repository<JobCategory>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<JobCategory> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      slug: generateSlug(createCategoryDto.name, {
        lower: true,
        strict: true,
      }),
    });

    return this.categoriesRepository.save(category);
  }

  async findAll(): Promise<JobCategory[]> {
    return this.categoriesRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<JobCategory> {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<JobCategory> {
    const category = await this.findOne(id);

    Object.assign(category, updateCategoryDto);
    if (updateCategoryDto.name) {
      category.slug = generateSlug(updateCategoryDto.name);
    }
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    await this.categoriesRepository.remove(category);
  }
}
