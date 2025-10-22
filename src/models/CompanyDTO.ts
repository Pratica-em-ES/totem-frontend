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
  if (!category || category === 'Todas') return companies
  const normalized = category.trim().toLowerCase()
  return companies.filter(company => {
    const parts = company.category.split(',').map(p => p.trim().toLowerCase()).filter(Boolean)
    return parts.includes(normalized)
  })
}
