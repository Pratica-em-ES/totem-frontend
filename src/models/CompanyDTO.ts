export interface NodeDTO {
  id: number;
  name: string;
}

export interface BuildingWithNodeDTO {
  id: number;
  name: string;
  modelPath: string;
  node: NodeDTO;
}

export interface CategoryDTO {
  id: number;
  name: string;
}

export interface CompanyDTO {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  building: BuildingWithNodeDTO;
  categories: CategoryDTO[];
}

export function filterCompaniesByCategory(companies: CompanyDTO[], categoryName: string): CompanyDTO[] {
  return companies.filter(company =>
    company.categories.some(cat => cat.name === categoryName)
  );
}
