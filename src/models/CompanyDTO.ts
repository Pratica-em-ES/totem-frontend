export interface CompanyDTO {
  id: string;
  name: string;
  category: string;
  description: string;
  building: string;
  floor?: string;
  logoUrl?: string | null;
  fullDescription?: string;
  services?: string[];
}

export function filterCompaniesByCategory(companies: CompanyDTO[], category: string): CompanyDTO[] {
  return companies.filter(company => company.category === category);
}
