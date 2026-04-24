// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '../generated/prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { MessageResponseDto } from '../common/dto/response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 10 attempts per hour
  @Public()
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @ApiResponse({
    status: 201,
    description: 'User registered',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or email already in use',
  })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // 5 attempts per minute
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials or unverified email',
  })
  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Public()
  @ApiResponse({
    status: 200,
    description: 'Email verified',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  // 3 attempts per hour
  @Public()
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent',
    type: MessageResponseDto,
  })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh((req.user as { sub: string }).sub, res);
  }

  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Logged out',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('logout')
  logout(
    @CurrentUser() user: { id: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(user.id, res);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  me(@CurrentUser() user: User) {
    return user;
  }
}
