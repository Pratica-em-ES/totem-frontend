import type { CompanyDTO } from "./CompanyDTO";

export interface BuildingCompanyDTO {
    id: string;
  buildingId: string;
  companyId: string;
  company: CompanyDTO;
}
