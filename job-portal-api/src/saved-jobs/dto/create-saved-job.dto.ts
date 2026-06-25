import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateSavedJobDto {
  @ApiProperty()
  @IsUUID()
  jobId: string;
}
