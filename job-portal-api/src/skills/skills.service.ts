import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { generateSlug } from '../common/utils/slug.util';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    const skill = this.skillsRepository.create({
      ...createSkillDto,
      slug: generateSlug(createSkillDto.name),
    });

    return this.skillsRepository.save(skill);
  }

  async findAll(): Promise<Skill[]> {
    return this.skillsRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findOne(id);

    Object.assign(skill, updateSkillDto);
    if (updateSkillDto.name) {
      skill.slug = generateSlug(updateSkillDto.name, {
        lower: true,
        strict: true,
      });
    }

    return this.skillsRepository.save(skill);
  }

  async remove(id: string): Promise<void> {
    const skill = await this.findOne(id);

    await this.skillsRepository.remove(skill);
  }
}
