import { Controller, Get, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDashboard(@CurrentUser() user) {
    switch (user.role) {
      case UserRole.CANDIDATE:
        return this.dashboardService.getCandidateDashboard(user.id);

      case UserRole.RECRUITER:
        return this.dashboardService.getRecruiterDashboard(user.id);

      case UserRole.ADMIN:
        return this.dashboardService.getAdminDashboard();

      default:
        return {
          message: 'Invalid user role',
        };
    }
  }
}
