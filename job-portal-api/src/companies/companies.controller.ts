import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

import { UserRole } from '../users/entities/user.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedCompanyResponseDto } from './dto/paginated-company-response.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @ApiBody({ type: CreateCompanyDto })
  @ApiCreatedResponse({ type: CompanyResponseDto })
  create(@Body() dto: CreateCompanyDto, @CurrentUser() user: { id: string }) {
    return this.companiesService.create(dto, user.id);
  }

  @Get()
  @ApiOkResponse({
    type: PaginatedCompanyResponseDto,
  })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.companiesService.findAll(pagination);
  }

  @Get('my-companies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @ApiOkResponse({
    type: CompanyResponseDto,
    isArray: true,
  })
  findMyCompanies(@CurrentUser() user: { id: string }) {
    return this.companiesService.findByOwner(user.id);
  }

  @Get(':id')
  @ApiOkResponse({
    type: CompanyResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateCompanyDto })
  @ApiOkResponse({
    type: CompanyResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user,
  ) {
    return this.companiesService.update(id, dto, user.id, user.role);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({
    type: CompanyResponseDto,
  })
  verify(@Param('id') id: string) {
    return this.companiesService.verify(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.companiesService.remove(id, user.id);
  }
}
