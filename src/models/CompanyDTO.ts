export interface CompanyDTO {
  id: string;
  name: string;
  cnpj: string;
  category: string;
  address: string; // if Company.java has an Address entity, you can replace with AddressDTO
}

export function filterCompaniesByCategory(companies: CompanyDTO[], category: string): CompanyDTO[] {
  return companies.filter(company => company.category === category);
}
