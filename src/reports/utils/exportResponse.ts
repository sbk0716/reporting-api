import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExportResponse {
  @ApiProperty({
    required: true,
    description: 'URL of the uploaded object.',
    default:
      'https://stg-gw-reporting-file.s3-ap-northeast-1.amazonaws.com/report/80000000-4000-4000-4000-120000000000/2021-01-01T00%3A00%3A00.000Z/sample.json',
  })
  @IsNotEmpty()
  @IsString()
  Location: string;

  @ApiProperty({
    required: true,
    description: 'ETag of the uploaded object.',
    default: '43966138aebfdc4438520cc5cd2aefa8',
  })
  @IsNotEmpty()
  @IsString()
  ETag: string;

  @ApiProperty({
    required: true,
    description: 'Bucket to which the object was uploaded.',
    default: 'stg-gw-reporting-file',
  })
  @IsNotEmpty()
  @IsString()
  Bucket: string;

  @ApiProperty({
    required: true,
    description: 'Key to which the object was uploaded.',
    default:
      'report/80000000-4000-4000-4000-120000000000/2021-01-01T00:00:00.000Z/sample.json',
  })
  @IsNotEmpty()
  @IsString()
  Key: string;
}
