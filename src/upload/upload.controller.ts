// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { FileUploadResponseDto } from '../common/dto/response.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @ApiResponse({
    status: 201,
    description: 'Image uploaded',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only images allowed'), false);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFile(file);
  }

  @ApiResponse({
    status: 201,
    description: 'File uploaded',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('file')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFile(file);
  }
}
