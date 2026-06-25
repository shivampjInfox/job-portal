import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  login(@CurrentUser() user, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(user, response);
  }

  @Post('register/candidate')
  @ApiOperation({ summary: 'Register candidate' })
  @ApiBody({ type: RegisterDto })
  registerCandidate(@Body() dto: RegisterDto) {
    return this.authService.registerCandidate(dto);
  }

  @Post('register/recruiter')
  @ApiOperation({ summary: 'Register recruiter' })
  @ApiBody({ type: RegisterDto })
  registerRecruiter(@Body() dto: RegisterDto) {
    return this.authService.registerRecruiter(dto);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@CurrentUser() user) {
    return this.userService.findOne(user.id);
  }
}
