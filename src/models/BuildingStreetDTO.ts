import type { CoordinateDTO } from "./CoordinateDTO";
export interface BuildingStreetDTO {
  id: string;
  name: string;
  number: string;
  postalCode: string;
  coordinate: CoordinateDTO;
}
