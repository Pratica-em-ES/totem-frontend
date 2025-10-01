import type { BuildingStreetDTO } from "./BuildingStreetDTO";
import type { BuildingCompanyDTO } from "./BuildingCompanyDTO";

export interface BuildingDTO {
  id: string;
  name: string;
  description?: string;
  street: BuildingStreetDTO;
  companies: BuildingCompanyDTO[];
}
