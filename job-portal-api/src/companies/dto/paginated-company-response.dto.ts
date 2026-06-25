import { ApiProperty } from '@nestjs/swagger';
import { CompanyResponseDto } from './company-response.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';

export class PaginatedCompanyResponseDto {
  @ApiProperty({
    type: [CompanyResponseDto],
  })
  data!: CompanyResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
  })
  meta!: PaginationMetaDto;
}
