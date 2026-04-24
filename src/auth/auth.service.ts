// src/auth/auth.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { Response } from 'express';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  // ─── helpers ────────────────────────────────────────────
  private generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  private tokenExpiry(hours = 1) {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  private signTokens(payload: {
    sub: string;
    email: string;
    tokenVersion: number;
  }) {
    const jti = crypto.randomUUID();

    const accessToken = this.jwt.sign(
      { ...payload, jti },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      },
    );

    const refreshToken = this.jwt.sign(
      { ...payload, jti: crypto.randomUUID() },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    return { accessToken, refreshToken };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  // ─── register ───────────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 12);
    const verifyToken = this.generateToken();

    // Use transaction to ensure user + email are atomic
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashed,
          verifyToken,
          verifyTokenExpiry: this.tokenExpiry(24),
        },
      });

      await this.mail.sendVerificationEmail(
        newUser.email,
        newUser.name,
        verifyToken,
      );

      return newUser;
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return { ...result, message: 'Check your email to verify your account' };
  }

  // ─── verify email ────────────────────────────────────────
  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        verifyToken: dto.token,
        verifyTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  // ─── login ───────────────────────────────────────────────
  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new BadRequestException('Invalid credentials');

    // ─── Check if account is locked ─────────────────────────
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new BadRequestException(
        `Account locked. Try again after ${user.lockedUntil.toISOString()}`,
      );
    }

    // ─── Validate password ──────────────────────────────────
    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) {
      const attempts: number = user.failedLoginAttempts + 1;
      const updateData: { failedLoginAttempts: number; lockedUntil?: Date } = {
        failedLoginAttempts: attempts,
      };

      // Lock account after 5 failed attempts for 30 minutes
      if (attempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        updateData.failedLoginAttempts = 0;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new BadRequestException('Invalid credentials');
    }

    // ─── Reset failed attempts on successful login ──────────
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    // ─── Continue with token generation ─────────────────────
    if (!user.emailVerified)
      throw new BadRequestException('Please verify your email first');

    const payload = {
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    };
    const { accessToken, refreshToken } = this.signTokens(payload);
    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  // ─── refresh ─────────────────────────────────────────────
  async refresh(userId: string, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const payload = {
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    };
    const { accessToken, refreshToken } = this.signTokens(payload);
    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  // ─── logout ──────────────────────────────────────────────
  async logout(userId: string, res: Response) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }

  // ─── forgot password ─────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Don't reveal if email exists to client (security)
    if (!user)
      return { message: 'If this email exists, a reset link was sent' };

    const resetToken = this.generateToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: this.tokenExpiry(1),
      },
    });

    await this.mail.sendPasswordReset(user.email, resetToken);

    return { message: 'If this email exists, a reset link was sent' };
  }

  // ─── reset password ──────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    const hashed = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
        tokenVersion: { increment: 1 },
      },
    });

    return { message: 'Password reset successfully' };
  }
}
