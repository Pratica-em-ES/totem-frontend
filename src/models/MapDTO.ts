import type { StreetDTO } from "./StreetDTO";
import type { BuildingDTO } from "./BuildingDTO";

export interface MapDTO {
  buildings: BuildingDTO[];
  streets: StreetDTO[];
}