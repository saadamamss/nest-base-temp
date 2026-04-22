// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('MAIL_HOST'),
      port: config.get('MAIL_PORT'),
      auth: {
        user: config.get('MAIL_USER'),
        pass: config.get('MAIL_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM'),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async sendWelcome(to: string, name: string) {
    return this.sendMail(
      to,
      'Welcome!',
      `<h1>Welcome ${name}!</h1><p>Thanks for signing up.</p>`,
    );
  }

  async sendPasswordReset(to: string, token: string) {
    const url = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;
    return this.sendMail(
      to,
      'Reset your password',
      `<p>Click <a href="${url}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    );
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const url = `${this.config.get('FRONTEND_URL')}/verify-email?token=${token}`;
    return this.sendMail(
      to,
      'Verify your email',
      `
      <h2>Hi ${name},</h2>
      <p>Click the link below to verify your email. Link expires in 24 hours.</p>
      <a href="${url}" style="
        display:inline-block;padding:12px 24px;
        background:#4F46E5;color:#fff;
        border-radius:6px;text-decoration:none;
      ">Verify Email</a>
      <p>Or copy this link: ${url}</p>
    `,
    );
  }
}
