import { Company } from '../entities/company.entity';
import { CompanyResponseDto } from '../dto/company-response.dto';

export function toCompanyResponseDto(company: Company): CompanyResponseDto {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    description: company.description,
    website: company.website,
    logoUrl: company.logoUrl,
    location: company.location,
    size: company.size!,
    isVerified: company.isVerified,

    owner: {
      id: company.owner.id,
      firstName: company.owner.firstName,
      lastName: company.owner.lastName,
    },

    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}
