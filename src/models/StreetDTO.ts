import type { CoordinateDTO } from "./CoordinateDTO";

export interface StreetDTO {
  width: number;
  coordinateA: CoordinateDTO;
  coordinateB: CoordinateDTO;
}