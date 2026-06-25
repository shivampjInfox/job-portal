import { ApiProperty } from '@nestjs/swagger';
import { CompanySize } from '../enums/company-size.enum';

class CompanyOwnerDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class CompanyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  website?: string;

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ enum: CompanySize })
  size!: CompanySize;

  @ApiProperty()
  isVerified!: boolean;

  @ApiProperty({ type: CompanyOwnerDto })
  owner!: CompanyOwnerDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
