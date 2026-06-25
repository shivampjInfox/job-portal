import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    example: 'NestJS',
  })
  @IsString()
  name: string;
}
