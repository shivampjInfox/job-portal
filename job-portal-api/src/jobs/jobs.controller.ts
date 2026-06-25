import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobFilterDto } from './dto/job-filter.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @ApiOperation({ summary: 'Create a job' })
  create(@Body() dto: CreateJobDto, @CurrentUser() user) {
    return this.jobsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all jobs',
  })
  findAll(
    @Query() paginationDto: PaginationQueryDto,
    @Query() filters: JobFilterDto,
    @CurrentUser() user,
  ) {
    return this.jobsService.findAll(
      paginationDto,
      filters,
      user?.id,
      user?.role,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get job by id',
  })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update job',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @CurrentUser() user,
  ) {
    return this.jobsService.update(id, dto, user.id);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish job',
  })
  publish(@Param('id') id: string, @CurrentUser() user) {
    return this.jobsService.publish(id, user.id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Close job',
  })
  close(@Param('id') id: string, @CurrentUser() user) {
    return this.jobsService.close(id, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete job',
  })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.jobsService.remove(id, user.id);
  }
}
