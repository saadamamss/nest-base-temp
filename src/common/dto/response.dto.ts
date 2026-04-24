import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}

export class FileUploadResponseDto {
  @ApiProperty({ example: 'http://localhost:3000/uploads/abc123.jpg' })
  url: string;

  @ApiProperty({ example: 'abc123.jpg' })
  filename: string;

  @ApiProperty({ example: 102400 })
  size: number;
}
