import type { NodeDTO } from "./NodeDTO";
export interface BuildingStreetDTO {
  id: string;
  name: string;
  number: string;
  postalCode: string;
  coordinate: NodeDTO;
}
