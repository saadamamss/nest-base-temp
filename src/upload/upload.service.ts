// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private config: ConfigService) {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  saveFile(file: Express.Multer.File): Promise<{
    url: string;
    filename: string;
    size: number;
  }> {
    const filename = file.filename;

    const baseUrl =
      this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
    return Promise.resolve({
      url: `${baseUrl}/uploads/${filename}`,
      filename,
      size: file.size,
    });
  }
}
